import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Icon from './Icon';

const ToastContext = createContext(null);

const STYLES = {
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: 'check' },
  error: { box: 'border-red-200 bg-red-50 text-red-800', icon: 'alert' },
  info: { box: 'border-blue-200 bg-blue-50 text-blue-800', icon: 'alert' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, type = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:right-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg ${STYLES[type].box}`}
          >
            <Icon name={STYLES[type].icon} className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button onClick={() => dismiss(id)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
