import DOMPurify from 'dompurify';
import { format, formatDistanceToNow } from 'date-fns';

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
export const isObjectId = (value) => OBJECT_ID_RE.test(value || '');

export const looksLikeHtml = (text = '') => /<\/?[a-z][\s\S]*>/i.test(text);

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Older posts were stored as plain text
export const toEditorHtml = (content = '') =>
  looksLikeHtml(content)
    ? content
    : content
        .replace(/\r\n?/g, '\n')
        .split(/\n{2,}/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
        .join('');

export const slugify = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Sanitizes post HTML and gives headings ids for the table of contents
export const prepareArticle = (content = '') => {
  const clean = DOMPurify.sanitize(toEditorHtml(content), {
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['style', 'form', 'input'],
  });
  const doc = new DOMParser().parseFromString(clean, 'text/html');
  const headings = [];
  const used = new Set();

  doc.body.querySelectorAll('h2, h3').forEach((heading) => {
    const base = slugify(heading.textContent) || 'section';
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    heading.id = id;
    headings.push({ id, text: heading.textContent, level: Number(heading.tagName[1]) });
  });

  doc.body.querySelectorAll('a[href^="http"]').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return { html: doc.body.innerHTML, headings };
};

// Block-level tags become spaces so "<h2>Intro</h2><p>Text" reads "Intro Text"
const BLOCK_END = /<\/(p|div|h[1-6]|li|blockquote|pre|tr|td|th|figcaption)>|<br\s*\/?>/gi;

export const plainText = (html = '') => {
  const spaced = html.replace(BLOCK_END, (tag) => `${tag} `);
  const doc = new DOMParser().parseFromString(DOMPurify.sanitize(spaced), 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

export const excerptOf = (post, length = 160) => {
  const text = plainText(post.content) || post.excerpt || post.subtitle || '';
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
};

export const readingTimeOf = (post) =>
  post.readingTime || Math.max(1, Math.ceil(plainText(post.content).split(' ').length / 200));

export const postPath = (post) => `/post/${post.slug || post._id}`;

export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  try {
    return format(new Date(date), pattern);
  } catch {
    return '';
  }
};

export const timeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const compactNumber = (n = 0) =>
  new Intl.NumberFormat('en', { notation: 'compact' }).format(n);
