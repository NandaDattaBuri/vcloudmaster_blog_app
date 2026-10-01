import { useEffect } from 'react';
import Icon from '../ui/Icon';

// Full-screen view of an image at its original resolution
const ImageLightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image'}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
    >
      <img src={src} alt={alt} className="max-h-[92vh] max-w-[96vw] rounded-lg object-contain shadow-2xl" />
      <div className="absolute right-4 top-4 flex gap-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          <Icon name="external" className="h-4 w-4" /> Original
        </a>
        <button
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Close"
        >
          <Icon name="x" />
        </button>
      </div>
    </div>
  );
};

export default ImageLightbox;
