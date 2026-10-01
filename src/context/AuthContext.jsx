import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { clearSession, getStoredUser, getToken, isTokenExpired, saveSession } from '../utils/session';

const AuthContext = createContext(null);

const initialUser = () => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return getStoredUser() || {};
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);

  // Confirm the stored token is still valid with the server
  useEffect(() => {
    if (!getToken()) return;
    authApi
      .fetchMe()
      .then((me) => {
        setUser(me);
        saveSession({ token: getToken(), ...me });
      })
      .catch(() => {
        // 401s are handled by the API client's interceptor
      });
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const startSession = useCallback((session) => {
    saveSession(session);
    const { token: _token, ...profile } = session;
    setUser(profile);
  }, []);

  const login = useCallback(
    async (email, password) => startSession(await authApi.login(email, password)),
    [startSession]
  );

  const register = useCallback(
    async (details) => startSession(await authApi.register(details)),
    [startSession]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
