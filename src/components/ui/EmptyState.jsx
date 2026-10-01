import Icon from './Icon';

const EmptyState = ({ icon = 'file', title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
    <div className="mb-4 rounded-full bg-slate-100 p-3 text-slate-400">
      <Icon name={icon} className="h-7 w-7" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
