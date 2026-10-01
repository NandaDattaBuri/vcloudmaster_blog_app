import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { deletePost, fetchAdminPosts } from '../../api/posts';
import { errorMessage } from '../../api/client';
import { compactNumber, formatDate, postPath } from '../../utils/content';
import { SITE_NAME } from '../../config';

const PAGE_SIZE = 10;

const Stat = ({ label, value, icon, tone }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`rounded-lg p-2 ${tone}`}>
        <Icon name={icon} className="h-4 w-4" />
      </span>
    </div>
    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{compactNumber(value)}</p>
  </div>
);

const StatusBadge = ({ status }) =>
  status === 'draft' ? (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Draft</span>
  ) : (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Published</span>
  );

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchAll = useCallback(
    () =>
      fetchAdminPosts()
        .then(setPosts)
        .catch((err) => setError(errorMessage(err, 'Failed to load posts')))
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

  const stats = useMemo(() => ({
    published: posts.filter((p) => p.status !== 'draft').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
    views: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    likes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
    comments: posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0),
  }), [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (status === 'draft' && p.status !== 'draft') return false;
      if (status === 'published' && p.status === 'draft') return false;
      if (!q) return true;
      return [p.title, p.subtitle, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(q);
    });
  }, [posts, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This also removes its images and comments and cannot be undone.`)) return;
    setDeleting(post._id);
    try {
      await deletePost(post._id);
      setPosts((list) => list.filter((p) => p._id !== post._id));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete post'));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <PageSpinner label="Loading dashboard…" />;

  return (
    <>
      <title>{`Dashboard · ${SITE_NAME}`}</title>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-slate-500">Here's how your blog is doing.</p>
        </div>
        <Link to="/admin/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          <Icon name="plus" className="h-4 w-4" /> New post
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Published" value={stats.published} icon="file" tone="bg-blue-50 text-blue-600" />
        <Stat label="Drafts" value={stats.drafts} icon="edit" tone="bg-amber-50 text-amber-600" />
        <Stat label="Views" value={stats.views} icon="eye" tone="bg-violet-50 text-violet-600" />
        <Stat label="Likes" value={stats.likes} icon="heart" tone="bg-rose-50 text-rose-600" />
        <Stat label="Comments" value={stats.comments} icon="comment" tone="bg-emerald-50 text-emerald-600" />
      </div>

      {error ? (
        <EmptyState icon="alert" title="Couldn't load posts" description={error}
          action={<button onClick={retry} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Try again</button>} />
      ) : posts.length === 0 ? (
        <EmptyState icon="edit" title="No posts yet" description="Write your first article. You can add images anywhere in the text."
          action={<Link to="/admin/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Write your first post</Link>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, tag or category…"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
              {[['all', `All (${posts.length})`], ['published', `Published (${stats.published})`], ['draft', `Drafts (${stats.drafts})`]].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setStatus(value);
                    setPage(1);
                  }}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 ${status === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-500">No posts match your filters.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pagePosts.map((post) => (
                <li key={post._id} className="flex flex-col gap-4 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center">
                  <button onClick={() => navigate(`/admin/edit/${post._id}`)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        <Icon name="image" className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">{post.title}</p>
                        <StatusBadge status={post.status} />
                      </div>
                      <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                        <span>{formatDate(post.createdAt)}</span>
                        {post.category && <span>{post.category}</span>}
                        <span className="inline-flex items-center gap-1"><Icon name="eye" className="h-3 w-3" />{post.views || 0}</span>
                        <span className="inline-flex items-center gap-1"><Icon name="heart" className="h-3 w-3" />{post.likes || 0}</span>
                        <span className="inline-flex items-center gap-1"><Icon name="comment" className="h-3 w-3" />{post.comments?.length || 0}</span>
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <Link to={postPath(post)} target="_blank" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900">
                      {post.status === 'draft' ? 'Preview' : 'View'}
                    </Link>
                    <Link to={`/admin/edit/${post._id}`} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post)}
                      disabled={deleting === post._id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === post._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
              <span className="text-slate-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40">Previous</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Dashboard;
