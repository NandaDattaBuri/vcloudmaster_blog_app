import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ArticleBody from '../components/blog/ArticleBody';
import ImageLightbox from '../components/blog/ImageLightbox';
import CommentSection from '../components/blog/CommentSection';
import PostCard from '../components/blog/PostCard';
import Reactions from '../components/blog/Reactions';
import ReadingProgress from '../components/blog/ReadingProgress';
import ShareButtons from '../components/blog/ShareButtons';
import TableOfContents from '../components/blog/TableOfContents';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { fetchPostById, fetchPostBySlug, fetchPosts } from '../api/posts';
import { errorMessage } from '../api/client';
import { compactNumber, excerptOf, formatDate, isObjectId, prepareArticle, readingTimeOf } from '../utils/content';
import { SITE_NAME } from '../config';

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState({ slug: null, post: null, error: null });
  const [related, setRelated] = useState([]);
  const [zoomCover, setZoomCover] = useState(false);
  const { post, error } = state;
  const loading = state.slug !== slug;

  const setPost = (updater) =>
    setState((prev) => ({ ...prev, post: typeof updater === 'function' ? updater(prev.post) : updater }));

  useEffect(() => {
    let cancelled = false;

    (isObjectId(slug) ? fetchPostById(slug) : fetchPostBySlug(slug))
      .then((data) => {
        if (cancelled) return;
        // Old /post/<id> links move to the readable slug URL
        if (isObjectId(slug) && data.slug) {
          setState({ slug: data.slug, post: data, error: null });
          navigate(`/post/${data.slug}`, { replace: true });
          return;
        }
        setState({ slug, post: data, error: null });
        window.scrollTo(0, 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          slug,
          post: null,
          error: err.response?.status === 404 ? 'not-found' : errorMessage(err, 'Failed to load article'),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  // Related: shares a tag or category, otherwise the latest posts
  useEffect(() => {
    if (!post?._id) return;
    fetchPosts()
      .then((all) => {
        const others = all.filter((p) => p._id !== post._id);
        const score = (p) =>
          (p.tags || []).filter((t) => post.tags?.includes(t)).length * 2 +
          (post.category && p.category === post.category ? 1 : 0);
        setRelated([...others].sort((a, b) => score(b) - score(a) || new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3));
      })
      .catch(() => setRelated([]));
  }, [post?._id, post?.tags, post?.category]);

  const article = useMemo(() => prepareArticle(post?.content || ''), [post?.content]);

  if (loading) return <PageSpinner label="Loading article…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <title>{`Not found · ${SITE_NAME}`}</title>
        <EmptyState
          icon={error === 'not-found' ? 'search' : 'alert'}
          title={error === 'not-found' ? 'Article not found' : "Couldn't load this article"}
          description={error === 'not-found' ? 'It may have been moved or deleted.' : error}
          action={<Link to="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Browse all articles</Link>}
        />
      </div>
    );
  }

  const url = window.location.href;
  const description = post.subtitle || excerptOf(post, 160);
  // Long articles list main sections only, so the outline stays scannable
  const tocHeadings = article.headings.length > 12 ? article.headings.filter((h) => h.level === 2) : article.headings;
  const showToc = tocHeadings.length >= 2;

  return (
    <>
      <title>{`${post.title} · ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      {post.coverImage && <meta property="og:image" content={post.coverImage} />}
      <meta name="twitter:card" content={post.coverImage ? 'summary_large_image' : 'summary'} />

      <ReadingProgress />
      {zoomCover && <ImageLightbox src={post.coverImage} alt={post.title} onClose={() => setZoomCover(false)} />}

      {post.status === 'draft' && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-800">
          Draft preview: this post isn't visible to readers yet.
        </div>
      )}

      <article>
        <header className="mx-auto max-w-3xl px-4 pt-10 text-center sm:px-6 sm:pt-14">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900">
              <Icon name="arrowLeft" className="h-4 w-4" /> All articles
            </Link>
            {post.category && (
              <>
                <span className="text-slate-300">/</span>
                <Link to={`/?category=${encodeURIComponent(post.category)}`} className="font-semibold text-blue-700 hover:underline">
                  {post.category}
                </Link>
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.subtitle && <p className="mt-4 text-lg text-slate-600 sm:text-xl">{post.subtitle}</p>}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {(post.author?.name || 'V').charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-slate-700">{post.author?.name || 'VCloudMaster Team'}</span>
            </span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt, 'MMMM d, yyyy')}</time>
            <span className="inline-flex items-center gap-1"><Icon name="clock" className="h-4 w-4" />{readingTimeOf(post)} min read</span>
            {post.views > 0 && (
              <span className="inline-flex items-center gap-1"><Icon name="eye" className="h-4 w-4" />{compactNumber(post.views)} views</span>
            )}
          </div>

          {isAuthenticated && (
            <Link to={`/admin/edit/${post._id}`} className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700">
              <Icon name="edit" className="h-3.5 w-3.5" /> Edit post
            </Link>
          )}
        </header>

        {post.coverImage && (
          <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
            <button type="button" onClick={() => setZoomCover(true)} className="block w-full cursor-zoom-in" aria-label="View cover image full size">
              <img src={post.coverImage} alt="" className="h-auto w-full rounded-2xl shadow-lg" />
            </button>
          </div>
        )}

        <div className={`mx-auto mt-12 px-4 sm:px-6 ${showToc ? 'grid max-w-6xl gap-12 lg:grid-cols-[1fr_220px]' : 'max-w-3xl'}`}>
          <div className="min-w-0">
            <ArticleBody html={article.html} />

            {post.tags?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/?tag=${encodeURIComponent(tag)}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col gap-4 border-y border-slate-200 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Was this helpful?</span>
                <Reactions post={post} onChange={(counts) => setPost((prev) => ({ ...prev, ...counts }))} />
              </div>
              <ShareButtons title={post.title} url={url} />
            </div>

            <div className="mt-12 pb-4">
              <CommentSection
                postId={post._id}
                comments={post.comments || []}
                onChange={(comments) => setPost((prev) => ({ ...prev, comments }))}
              />
            </div>
          </div>

          {showToc && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents headings={tocHeadings} />
              </div>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-16 border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-slate-900">Keep reading</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default PostPage;
