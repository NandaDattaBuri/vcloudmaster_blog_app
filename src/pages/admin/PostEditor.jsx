import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../../components/editor/RichTextEditor';
import CoverImagePicker from '../../components/editor/CoverImagePicker';
import TagInput from '../../components/editor/TagInput';
import ArticleBody from '../../components/blog/ArticleBody';
import Icon from '../../components/ui/Icon';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { createPost, fetchAdminPosts, fetchPostById, updatePost, uploadContentImage } from '../../api/posts';
import { errorMessage } from '../../api/client';
import { plainText, postPath, prepareArticle, toEditorHtml } from '../../utils/content';
import { SITE_NAME } from '../../config';

const EMPTY_FORM = { title: '', subtitle: '', content: '', tags: [], category: '', cover: { file: null, url: '' } };

const Card = ({ title, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
    {children}
  </section>
);

const PostEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(null); // 'draft' | 'published'
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState({ tags: [], categories: [] });
  const dirtyRef = useRef(false);
  const [dirty, setDirtyState] = useState(false);

  const setDirty = (value) => {
    dirtyRef.current = value;
    setDirtyState(value);
  };

  useEffect(() => {
    if (!isEditing) return;
    fetchPostById(id)
      .then((post) => {
        setOriginal(post);
        setForm({
          title: post.title || '',
          subtitle: post.subtitle || '',
          content: toEditorHtml(post.content || ''),
          tags: post.tags || [],
          category: post.category || '',
          cover: { file: null, url: post.coverImage || '' },
        });
        setDirty(false);
      })
      .catch((err) => setLoadError(err.response?.status === 404 ? 'This post no longer exists.' : errorMessage(err, 'Failed to load post')))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  // Existing tags/categories for quick selection
  useEffect(() => {
    fetchAdminPosts()
      .then((posts) => {
        const tagCount = new Map();
        posts.flatMap((p) => p.tags || []).forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1));
        setSuggestions({
          tags: [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t),
          categories: [...new Set(posts.map((p) => p.category).filter(Boolean))],
        });
      })
      .catch(() => {});
  }, []);

  // Warn before leaving with unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname
  );
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('You have unsaved changes. Leave without saving?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    dirtyRef.current = true;
    setDirtyState(true);
  }, []);

  const handleContentChange = useCallback((html) => update('content', html), [update]);
  const handleError = useCallback((message) => toast.error(message), [toast]);
  const handleWarning = useCallback((message) => toast.info(message), [toast]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Give your post a title';
    if (!plainText(form.content) && !/<img/i.test(form.content)) next.content = 'Write something before saving';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async (status) => {
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(status);
    try {
      const data = new FormData();
      data.append('title', form.title.trim());
      data.append('subtitle', form.subtitle.trim());
      data.append('content', form.content);
      data.append('tags', JSON.stringify(form.tags));
      data.append('category', form.category.trim());
      data.append('status', status);

      const { file, url } = form.cover;
      if (file) {
        data.append('coverImage', file);
      } else if (url && url !== original?.coverImage) {
        data.append('imageUrl', url);
      } else if (!url && original?.coverImage) {
        data.append('removeCoverImage', 'true');
      }

      const saved = isEditing ? await updatePost(id, data) : await createPost(data);
      setDirty(false);
      setOriginal(saved);
      setForm((prev) => ({ ...prev, cover: { file: null, url: saved.coverImage || '' } }));

      if (status === 'published') {
        toast.success(isEditing && original?.status !== 'draft' ? 'Post updated' : 'Post published!');
        navigate('/admin');
      } else {
        toast.success('Draft saved');
        if (!isEditing) navigate(`/admin/edit/${saved._id}`, { replace: true });
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save post'));
    } finally {
      setSaving(null);
    }
  };

  const previewHtml = useMemo(() => (preview ? prepareArticle(form.content).html : ''), [preview, form.content]);

  if (loading) return <PageSpinner label="Loading post…" />;
  if (loadError) {
    return (
      <EmptyState icon="alert" title="Can't edit this post" description={loadError}
        action={<Link to="/admin" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Back to dashboard</Link>} />
    );
  }

  const isPublished = original?.status === 'published';
  const inputBase = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';

  return (
    <>
      <title>{`${isEditing ? 'Edit' : 'New'} post · ${SITE_NAME}`}</title>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900" aria-label="Back to dashboard">
            <Icon name="arrowLeft" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit post' : 'New post'}</h1>
            <p className="text-xs text-slate-500">
              {original ? (original.status === 'draft' ? 'Draft' : 'Published') : 'Not saved yet'}
              {dirty && ' · Unsaved changes'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {preview ? 'Back to editing' : 'Preview'}
          </button>
          {original && (
            <Link to={postPath(original)} target="_blank" className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white sm:inline-flex">
              {isPublished ? 'View live' : 'Open preview'} <Icon name="external" className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {preview ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 sm:px-10">
              <div className="mx-auto max-w-3xl">
                {form.cover.url && !form.cover.file && <img src={form.cover.url} alt="" className="mb-8 h-auto w-full rounded-xl" />}
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{form.title || 'Untitled'}</h1>
                {form.subtitle && <p className="mt-3 text-xl text-slate-600">{form.subtitle}</p>}
                <div className="mt-8"><ArticleBody html={previewHtml} /></div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Post title"
                  maxLength={200}
                  aria-label="Title"
                  className={`w-full rounded-xl border bg-white px-5 py-4 text-2xl font-bold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 sm:text-3xl ${
                    errors.title ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              <input
                value={form.subtitle}
                onChange={(e) => update('subtitle', e.target.value)}
                placeholder="Subtitle (optional, shown under the title and in search results)"
                maxLength={300}
                aria-label="Subtitle"
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-lg text-slate-600 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <div>
                <RichTextEditor
                  key={original?._id || 'new'}
                  initialContent={form.content}
                  onChange={handleContentChange}
                  onUploadImage={uploadContentImage}
                  onError={handleError}
                  onWarning={handleWarning}
                  placeholder="Start writing… Use the Image button, paste, or drag images anywhere in your story."
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card title="Publish">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => save('published')}
                disabled={!!saving}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving === 'published' ? 'Saving…' : isPublished ? 'Update post' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => save('draft')}
                disabled={!!saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {saving === 'draft' ? 'Saving…' : isPublished ? 'Unpublish (save as draft)' : 'Save draft'}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Drafts are only visible to admins.</p>
          </Card>

          <Card title="Cover image">
            <CoverImagePicker value={form.cover} onChange={(cover) => update('cover', cover)} onError={handleError} onWarning={handleWarning} />
          </Card>

          <Card title="Category">
            <input
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              list="category-suggestions"
              placeholder="e.g. AWS"
              maxLength={50}
              className={inputBase}
            />
            <datalist id="category-suggestions">
              {suggestions.categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Card>

          <Card title="Tags">
            <TagInput tags={form.tags} onChange={(tags) => update('tags', tags)} suggestions={suggestions.tags} />
            <p className="mt-2 text-xs text-slate-500">Press Enter or comma to add. Up to 10.</p>
          </Card>
        </aside>
      </div>
    </>
  );
};

export default PostEditor;
