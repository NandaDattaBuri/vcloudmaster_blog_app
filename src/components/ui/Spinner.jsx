const Spinner = ({ className = 'h-8 w-8', label }) => (
  <div className="flex flex-col items-center justify-center gap-3" role="status">
    <div className={`animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 ${className}`} />
    {label && <p className="text-sm text-slate-500">{label}</p>}
  </div>
);

export const PageSpinner = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner label={label} />
  </div>
);

export default Spinner;
