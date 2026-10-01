import { useState } from 'react';
import { addComment } from '../../api/posts';
import { errorMessage } from '../../api/client';
import { timeAgo } from '../../utils/content';
import { useToast } from '../ui/Toast';

const EMPTY = { name: '', email: '', comment: '' };
const MAX_LENGTH = 2000;

const Avatar = ({ name }) => {
  const initials = (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
      {initials}
    </div>
  );
};

const CommentSection = ({ postId, comments, onChange }) => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await addComment(postId, form);
      onChange(data.comments);
      setForm(EMPTY);
      toast.success('Thanks! Your comment was posted.');
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to post comment'));
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';

  return (
    <section id="comments" className="scroll-mt-24">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Comments <span className="text-slate-400">({comments.length})</span>
      </h2>

      <form onSubmit={submit} className="mb-10 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" value={form.name} onChange={update} placeholder="Your name" required maxLength={100} className={input} />
          <input name="email" type="email" value={form.email} onChange={update} placeholder="Your email (not published)" required className={input} />
        </div>
        <textarea
          name="comment"
          value={form.comment}
          onChange={update}
          placeholder="Share your thoughts…"
          required
          rows={4}
          maxLength={MAX_LENGTH}
          className={input}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{form.comment.length}/{MAX_LENGTH}</span>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="text-center text-slate-500">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <ul className="space-y-6">
          {sorted.map((comment) => (
            <li key={comment._id} className="flex gap-4">
              <Avatar name={comment.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-slate-900">{comment.name}</span>
                  <time className="text-xs text-slate-400" dateTime={comment.createdAt}>
                    {timeAgo(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-line break-words text-slate-700">{comment.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CommentSection;
