import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { deleteComment, fetchAdminPosts } from '../../api/posts';
import { errorMessage } from '../../api/client';
import { postPath, timeAgo } from '../../utils/content';
import { SITE_NAME } from '../../config';

const Comments = () => {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchAll = useCallback(
    () =>
      fetchAdminPosts()
        .then(setPosts)
        .catch((err) => setError(errorMessage(err, 'Failed to load comments')))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const retry = () => {
    setLoading(true);
    setError('');
    fetchAll();
  };

  const comments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts
      .flatMap((post) => (post.comments || []).map((comment) => ({ ...comment, post })))
      .filter((c) => !q || [c.name, c.email, c.comment, c.post.title].join(' ').toLowerCase().includes(q))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [posts, search]);

  const remove = async (comment) => {
    if (!window.confirm(`Delete this comment by ${comment.name}?`)) return;
    setDeleting(comment._id);
    try {
      const { comments: remaining } = await deleteComment(comment.post._id, comment._id);
      setPosts((list) => list.map((p) => (p._id === comment.post._id ? { ...p, comments: remaining } : p)));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete comment'));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <PageSpinner label="Loading comments…" />;

  return (
    <>
      <title>{`Comments · ${SITE_NAME}`}</title>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comments</h1>
          <p className="mt-1 text-slate-500">Review and moderate reader comments across all posts.</p>
        </div>
        <div className="relative sm:w-72">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comments…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {error ? (
        <EmptyState icon="alert" title="Couldn't load comments" description={error}
          action={<button onClick={retry} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>} />
      ) : comments.length === 0 ? (
        <EmptyState icon="comment" title={search ? 'No matching comments' : 'No comments yet'} description="Reader comments will appear here." />
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {comments.map((c) => (
            <li key={c._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  <a href={`mailto:${c.email}`} className="text-slate-500 hover:text-blue-700">{c.email}</a>
                  <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line break-words text-slate-700">{c.comment}</p>
                <Link to={`${postPath(c.post)}#comments`} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">
                  on “{c.post.title}” <Icon name="external" className="h-3 w-3" />
                </Link>
              </div>
              <button
                onClick={() => remove(c)}
                disabled={deleting === c._id}
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Icon name="trash" className="h-4 w-4" />
                {deleting === c._id ? 'Deleting…' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Comments;
