import { useRef, useState } from 'react';
import Icon from '../ui/Icon';
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '../../config';
import { imageWidth, lowResolutionMessage, MIN_COVER_WIDTH } from '../../utils/image';

/**
 * value: { file: File|null, preview?: string, url: string }  (url is the current/remote image)
 * An empty value means "no cover image".
 */
const CoverImagePicker = ({ value, onChange, onError, onWarning }) => {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const preview = value.preview || value.url;

  const pickFile = (file) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      onError('Cover must be a JPEG, PNG, GIF, WebP or AVIF image');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError('Cover image must be smaller than 4MB');
      return;
    }
    if (value.preview) URL.revokeObjectURL(value.preview);
    onChange({ file, preview: URL.createObjectURL(file), url: '' });
    imageWidth(file).then((width) => {
      if (width && width < MIN_COVER_WIDTH) onWarning?.(lowResolutionMessage(file, width, 'cover'));
    });
  };

  const applyUrl = () => {
    const url = urlDraft.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) {
      onError('Please enter a valid http(s) image URL');
      return;
    }
    onChange({ file: null, url });
    setUrlDraft('');
  };

  if (preview) {
    return (
      <div className="space-y-3">
        <div className="group relative overflow-hidden rounded-lg border border-slate-200">
          <img src={preview} alt="Cover preview" className="aspect-[16/9] w-full bg-slate-100 object-contain" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange({ file: null, url: '' })}
            className="flex-1 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            pickFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        {['upload', 'url'].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`rounded-md py-1.5 ${mode === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {option === 'upload' ? 'Upload' : 'From URL'}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pickFile(e.dataTransfer.files?.[0]);
          }}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600"
        >
          <Icon name="upload" className="h-6 w-6" />
          <span className="text-sm font-medium">Click or drop an image</span>
          <span className="text-xs">JPEG, PNG, WebP, GIF · max 4MB</span>
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyUrl();
              }
            }}
            placeholder="https://…"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Use
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default CoverImagePicker;
