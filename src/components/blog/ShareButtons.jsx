import { useState } from 'react';
import Icon from '../ui/Icon';

const ShareButtons = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const nativeShare = () => navigator.share?.({ title, url }).catch(() => {});

  const btn = 'inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof navigator !== 'undefined' && navigator.share && (
        <button type="button" onClick={nativeShare} className={`${btn} sm:hidden`}>
          <Icon name="share" className="h-3.5 w-3.5" /> Share
        </button>
      )}
      {links.map(({ label, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={`${btn} hidden sm:inline-flex`}>
          {label}
        </a>
      ))}
      <button type="button" onClick={copy} className={btn}>
        <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
};

export default ShareButtons;
