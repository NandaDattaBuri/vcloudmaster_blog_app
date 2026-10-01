import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import EditorToolbar from './EditorToolbar';
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '../../config';
import { imageWidth, lowResolutionMessage, MIN_CONTENT_WIDTH } from '../../utils/image';

const imageFiles = (fileList) =>
  [...(fileList || [])].filter((file) => file.type.startsWith('image/'));

// Copying from Word, Google Docs, Outlook, web pages etc. puts the formatted
// text AND a picture of the selection on the clipboard. Only treat a paste as
// an image upload when it carries no real text (screenshots, "Copy image").
const pastedImageFiles = (clipboard) => {
  const files = imageFiles(clipboard?.files);
  if (!files.length) return [];
  if (clipboard.getData('text/plain').trim()) return [];
  const html = clipboard.getData('text/html');
  if (html && new DOMParser().parseFromString(html, 'text/html').body.textContent.trim()) return [];
  return files;
};

/**
 * Rich text editor with inline image support. Images can be added anywhere in
 * the article from the toolbar, by pasting, or by dragging files onto the text.
 * Each image is uploaded through `onUploadImage(file) => Promise<url>`.
 */
const RichTextEditor = ({ initialContent = '', onChange, onUploadImage, onError, onWarning, placeholder }) => {
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const insertRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image.configure({ allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Tell your story…' }),
    ],
    content: initialContent,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class:
          'tiptap prose prose-slate prose-lg max-w-none min-h-[420px] px-5 py-6 focus:outline-none sm:px-8',
      },
      handlePaste: (view, event) => {
        const files = pastedImageFiles(event.clipboardData);
        if (!files.length) return false; // normal rich-text paste
        event.preventDefault();
        insertRef.current(files);
        return true;
      },
      handleDrop: (view, event, slice, moved) => {
        const files = imageFiles(event.dataTransfer?.files);
        if (moved || !files.length) return false;
        event.preventDefault();
        setDragging(false);
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        insertRef.current(files, coords?.pos);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => onChange?.(current.isEmpty ? '' : current.getHTML()),
  });

  const insertImages = async (files, position) => {
    if (!editor) return;
    let pos = position;
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        onError?.(`${file.name}: only JPEG, PNG, GIF, WebP or AVIF images are supported`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        onError?.(`${file.name} is larger than 4MB`);
        continue;
      }
      const width = await imageWidth(file);
      if (width && width < MIN_CONTENT_WIDTH) onWarning?.(lowResolutionMessage(file, width, 'image'));
      setUploading((n) => n + 1);
      try {
        const src = await onUploadImage(file);
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        const at = pos ?? editor.state.selection.to;
        editor.chain().focus().insertContentAt(at, [
          { type: 'image', attrs: { src, alt } },
          { type: 'paragraph' },
        ]).run();
        // Next image (multi-file drop) goes after this one
        pos = pos === undefined ? undefined : editor.state.selection.to;
      } catch (error) {
        onError?.(error?.response?.data?.message || `Failed to upload ${file.name}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };
  insertRef.current = insertImages;

  const addImageFromUrl = () => {
    const url = window.prompt('Image URL (https://…)');
    if (!url) return;
    if (!/^https?:\/\//i.test(url.trim())) {
      onError?.('Please enter a valid http(s) image URL');
      return;
    }
    editor.chain().focus().setImage({ src: url.trim(), alt: '' }).run();
  };

  return (
    <div
      className={`relative rounded-xl border bg-white shadow-sm transition ${
        dragging ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-200'
      }`}
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes('Files')) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
      }}
      onDrop={() => setDragging(false)}
    >
      <EditorToolbar
        editor={editor}
        onPickImage={() => fileInputRef.current?.click()}
        onImageUrl={addImageFromUrl}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          insertImages(imageFiles(e.target.files));
          e.target.value = '';
        }}
      />

      <EditorContent editor={editor} />

      {dragging && (
        <div className="pointer-events-none absolute inset-0 top-12 flex items-center justify-center rounded-b-xl bg-blue-50/70">
          <p className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow">
            Drop images to insert them here
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
        <span>
          {uploading > 0 ? (
            <span className="inline-flex items-center gap-2 font-medium text-blue-600">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              Uploading {uploading} image{uploading > 1 ? 's' : ''}…
            </span>
          ) : (
            'Tip: paste or drag images straight into the text'
          )}
        </span>
        {editor && (
          <span>
            {editor.getText().split(/\s+/).filter(Boolean).length} words
          </span>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
