import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PostCard, { FeaturedPostCard } from '../components/blog/PostCard';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import { fetchPosts } from '../api/posts';
import { errorMessage } from '../api/client';
import { plainText } from '../utils/content';
import { SITE_DESCRIPTION, SITE_NAME } from '../config';

const PAGE_SIZE = 9;

const Chip = ({ active, to, children }) => (
  <Link
    to={to}
    className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-slate-900 bg-slate-900 text-white'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
    }`}
  >
    {children}
  </Link>
);

const Home = () => {
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() || '';
  const tag = params.get('tag') || '';
  const category = params.get('category') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // "Load more" count resets whenever the filters change
  const filterKey = `${query}|${tag}|${category}`;
  const [paging, setPaging] = useState({ key: filterKey, count: PAGE_SIZE });
  const visible = paging.key === filterKey ? paging.count : PAGE_SIZE;

  const fetchAll = useCallback(
    () =>
      fetchPosts()
        .then((data) => setPosts(Array.isArray(data) ? data : []))
        .catch((err) => setError(errorMessage(err, 'Failed to load articles')))
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

  const { categories, tags } = useMemo(() => {
    const count = (values) => {
      const map = new Map();
      values.forEach((v) => v && map.set(v, (map.get(v) || 0) + 1));
      return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    };
    return {
      categories: count(posts.map((p) => p.category)),
      tags: count(posts.flatMap((p) => p.tags || [])).slice(0, 15),
    };
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter((post) => {
      if (tag && !(post.tags || []).includes(tag)) return false;
      if (category && post.category !== category) return false;
      if (!q) return true;
      return [post.title, post.subtitle, post.excerpt || plainText(post.content), ...(post.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [posts, query, tag, category]);

  const isFiltering = Boolean(query || tag || category);
  const [featured, ...rest] = filtered;
  const grid = isFiltering ? filtered : rest;
  const title = query ? `Search: ${query}` : tag ? `#${tag}` : category || 'Latest articles';

  return (
    <>
      <title>{isFiltering ? `${title} · ${SITE_NAME}` : SITE_NAME}</title>
      <meta name="description" content={SITE_DESCRIPTION} />

      {!isFiltering && (
        <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/60 to-white">
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">The VCloudMaster Blog</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Insights on cloud, DevOps &amp; engineering
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">{SITE_DESCRIPTION}</p>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {(categories.length > 0 || tags.length > 0) && (
          <div className="mb-8 space-y-3">
            {categories.length > 0 && (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                <Chip to="/" active={!category && !tag && !query}>All</Chip>
                {categories.map((name) => (
                  <Chip key={name} to={`/?category=${encodeURIComponent(name)}`} active={category === name}>
                    {name}
                  </Chip>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((name) => (
                  <Link
                    key={name}
                    to={tag === name ? '/' : `/?tag=${encodeURIComponent(name)}`}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      tag === name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    #{name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <PageSpinner label="Loading articles…" />
        ) : error ? (
          <EmptyState
            icon="alert"
            title="Couldn't load articles"
            description={error}
            action={<button onClick={retry} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Try again</button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title={isFiltering ? 'No matching articles' : 'No articles yet'}
            description={isFiltering ? 'Try a different search or topic.' : 'Check back soon for new posts.'}
            action={isFiltering && <Link to="/" className="text-sm font-semibold text-blue-700 hover:underline">Clear filters</Link>}
          />
        ) : (
          <>
            {!isFiltering && featured && (
              <div className="mb-12">
                <FeaturedPostCard post={featured} />
              </div>
            )}

            {grid.length > 0 && (
              <>
                <div className="mb-6 flex items-end justify-between">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
                  <span className="text-sm text-slate-500">
                    {isFiltering ? filtered.length : posts.length} article{(isFiltering ? filtered.length : posts.length) !== 1 && 's'}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {grid.slice(0, visible).map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
                {grid.length > visible && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setPaging({ key: filterKey, count: visible + PAGE_SIZE })}
                      className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900"
                    >
                      Load more articles
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Home;
