import { useState } from 'react';
import Icon from '../ui/Icon';

const MAX_TAGS = 10;

const TagInput = ({ tags, onChange, suggestions = [] }) => {
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const next = raw
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag && !tags.includes(tag));
    if (next.length) onChange([...tags, ...new Set(next)].slice(0, MAX_TAGS));
    setDraft('');
  };

  const unused = suggestions.filter((tag) => !tags.includes(tag)).slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-slate-300 p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            #{tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
              <Icon name="x" className="h-3 w-3" />
            </button>
          </span>
        ))}
        {tags.length < MAX_TAGS && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                add(draft);
              } else if (e.key === 'Backspace' && !draft && tags.length) {
                onChange(tags.slice(0, -1));
              }
            }}
            onBlur={() => draft && add(draft)}
            placeholder={tags.length ? '' : 'aws, devops…'}
            className="min-w-[80px] flex-1 border-0 p-0.5 text-sm focus:outline-none focus:ring-0"
          />
        )}
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {unused.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:border-blue-300 hover:text-blue-600"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
