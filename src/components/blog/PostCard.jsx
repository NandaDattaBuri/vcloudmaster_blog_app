import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import { excerptOf, formatDate, postPath, readingTimeOf } from '../../utils/content';

// Covers often have text baked in, so show the whole image (never crop it)
// and fill any leftover space with a blurred copy of the same image.
const Cover = ({ post, className = '' }) =>
  post.coverImage ? (
    <div className={`relative h-full w-full overflow-hidden bg-slate-900 ${className}`}>
      <img
        src={post.coverImage}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
      />
      <img
        src={post.coverImage}
        alt=""
        loading="lazy"
        className="relative h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
      />
    </div>
  ) : (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 ${className}`}>
      <span className="line-clamp-3 text-center text-lg font-bold text-white/90">{post.title}</span>
    </div>
  );

const Meta = ({ post }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
    <span aria-hidden="true">·</span>
    <span className="inline-flex items-center gap-1">
      <Icon name="clock" className="h-3.5 w-3.5" /> {readingTimeOf(post)} min read
    </span>
    {post.comments?.length > 0 && (
      <>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <Icon name="comment" className="h-3.5 w-3.5" /> {post.comments.length}
        </span>
      </>
    )}
  </div>
);

export const FeaturedPostCard = ({ post }) => (
  <Link
    to={postPath(post)}
    className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl md:grid-cols-2"
  >
    <div className="aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[360px]">
      <Cover post={post} />
    </div>
    <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Latest
        </span>
        {post.category && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{post.category}</span>
        )}
      </div>
      <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 group-hover:text-blue-700 sm:text-3xl lg:text-4xl">
        {post.title}
      </h2>
      <p className="line-clamp-3 text-slate-600 sm:text-lg">{excerptOf(post, 220)}</p>
      <Meta post={post} />
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
        Read article <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);

const PostCard = ({ post }) => (
  <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <Link to={postPath(post)} className="relative aspect-[16/9] overflow-hidden" tabIndex={-1} aria-hidden="true">
      <Cover post={post} />
      {post.category && (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 backdrop-blur">
          {post.category}
        </span>
      )}
    </Link>
    <div className="flex flex-1 flex-col gap-3 p-5">
      <h3 className="text-lg font-bold leading-snug text-slate-900">
        <Link to={postPath(post)} className="line-clamp-2 hover:text-blue-700">
          {post.title}
        </Link>
      </h3>
      <p className="line-clamp-3 flex-1 text-sm text-slate-600">{excerptOf(post)}</p>
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
      <Meta post={post} />
    </div>
  </article>
);

export default PostCard;
