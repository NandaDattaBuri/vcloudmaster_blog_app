import { useState } from 'react';
import Icon from '../ui/Icon';
import { likePost, dislikePost } from '../../api/posts';
import { errorMessage } from '../../api/client';
import { useToast } from '../ui/Toast';

const storageKey = (postId) => `vote:${postId}`;

const readVote = (postId) => {
  try {
    return localStorage.getItem(storageKey(postId));
  } catch {
    return null;
  }
};

const Reactions = ({ post, onChange }) => {
  const toast = useToast();
  const [vote, setVote] = useState(() => readVote(post._id));
  const [busy, setBusy] = useState(false);

  const react = async (type) => {
    if (busy || vote === type) return;
    setBusy(true);
    try {
      const { likes, dislikes } = await (type === 'like' ? likePost : dislikePost)(post._id);
      onChange({ likes, dislikes });
      setVote(type);
      try {
        localStorage.setItem(storageKey(post._id), type);
      } catch {
        // ignore
      }
    } catch (error) {
      const message = errorMessage(error, 'Could not save your reaction');
      // Server already has this visitor's vote
      if (error.response?.status === 400) setVote(type);
      toast.info(message);
    } finally {
      setBusy(false);
    }
  };

  const base = 'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => react('like')}
        disabled={busy}
        aria-pressed={vote === 'like'}
        className={`${base} ${vote === 'like' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600'}`}
      >
        <Icon name="heart" className="h-4 w-4" fill={vote === 'like' ? 'currentColor' : 'none'} />
        {post.likes || 0}
      </button>
      <button
        type="button"
        onClick={() => react('dislike')}
        disabled={busy}
        aria-pressed={vote === 'dislike'}
        aria-label="Dislike"
        className={`${base} ${vote === 'dislike' ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-slate-200 text-slate-600 hover:text-slate-900'}`}
      >
        <Icon name="thumbDown" className="h-4 w-4" />
        {post.dislikes || 0}
      </button>
    </div>
  );
};

export default Reactions;
