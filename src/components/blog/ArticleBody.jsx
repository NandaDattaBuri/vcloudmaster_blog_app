import { useCallback, useState } from 'react';
import ImageLightbox from './ImageLightbox';

// Renders sanitized post HTML (see utils/content.js prepareArticle).
// Clicking an image opens it full-size so detailed diagrams stay readable.
const ArticleBody = ({ html }) => {
  const [zoomed, setZoomed] = useState(null);
  const close = useCallback(() => setZoomed(null), []);

  const handleClick = (e) => {
    const img = e.target.closest('img');
    if (!img || img.closest('a')) return; // linked images keep their link
    setZoomed({ src: img.currentSrc || img.src, alt: img.alt });
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="article-body prose prose-slate prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-700 prose-img:rounded-xl prose-img:shadow-md prose-pre:bg-slate-900"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {zoomed && <ImageLightbox src={zoomed.src} alt={zoomed.alt} onClose={close} />}
    </>
  );
};

export default ArticleBody;
