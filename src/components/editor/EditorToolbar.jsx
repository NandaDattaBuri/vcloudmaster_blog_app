import Icon from '../ui/Icon';

const Btn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()} // keep editor selection
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={`flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm font-semibold transition ${
      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    } disabled:cursor-not-allowed disabled:opacity-30`}
  >
    {children}
  </button>
);

const Divider = () => <span className="mx-1 h-6 w-px bg-slate-200" />;

const EditorToolbar = ({ editor, onPickImage, onImageUrl }) => {
  if (!editor) return null;
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (leave empty to remove)', previous);
    if (url === null) return;
    if (url.trim() === '') {
      chain().extendMarkRange('link').unsetLink().run();
    } else {
      chain().extendMarkRange('link').setLink({ href: url.trim() }).run();
    }
  };

  const setAltText = () => {
    const alt = window.prompt('Describe this image (alt text)', editor.getAttributes('image').alt || '');
    if (alt !== null) chain().updateAttributes('image', { alt }).run();
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur">
      <Btn title="Undo" onClick={() => chain().undo().run()} disabled={!editor.can().undo()}>↶</Btn>
      <Btn title="Redo" onClick={() => chain().redo().run()} disabled={!editor.can().redo()}>↷</Btn>
      <Divider />
      <Btn title="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}>H2</Btn>
      <Btn title="Subheading" active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}>H3</Btn>
      <Btn title="Small heading" active={editor.isActive('heading', { level: 4 })} onClick={() => chain().toggleHeading({ level: 4 }).run()}>H4</Btn>
      <Divider />
      <Btn title="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}><b>B</b></Btn>
      <Btn title="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}><i className="font-serif">I</i></Btn>
      <Btn title="Underline" active={editor.isActive('underline')} onClick={() => chain().toggleUnderline().run()}><u>U</u></Btn>
      <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()}><s>S</s></Btn>
      <Btn title="Inline code" active={editor.isActive('code')} onClick={() => chain().toggleCode().run()}>{'</>'}</Btn>
      <Btn title="Link" active={editor.isActive('link')} onClick={setLink}><Icon name="link" className="h-4 w-4" /></Btn>
      <Divider />
      <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}>•≡</Btn>
      <Btn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}>1≡</Btn>
      <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}>❝</Btn>
      <Btn title="Code block" active={editor.isActive('codeBlock')} onClick={() => chain().toggleCodeBlock().run()}>{'{ }'}</Btn>
      <Btn title="Divider" onClick={() => chain().setHorizontalRule().run()}>―</Btn>
      <Divider />
      <Btn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => chain().setTextAlign('left').run()}>⇤</Btn>
      <Btn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => chain().setTextAlign('center').run()}>↔</Btn>
      <Btn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => chain().setTextAlign('right').run()}>⇥</Btn>
      <Divider />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onPickImage}
        className="flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-sm font-medium text-white hover:bg-blue-700"
        title="Upload image at cursor"
      >
        <Icon name="image" className="h-4 w-4" />
        <span className="hidden sm:inline">Image</span>
      </button>
      <Btn title="Insert image from URL" onClick={onImageUrl}><Icon name="link" className="h-4 w-4" /><span className="ml-0.5 text-xs">URL</span></Btn>
      {editor.isActive('image') && (
        <>
          <Btn title="Edit alt text" onClick={setAltText}><span className="text-xs">Alt</span></Btn>
          <Btn title="Remove image" onClick={() => chain().deleteSelection().run()}><Icon name="trash" className="h-4 w-4" /></Btn>
        </>
      )}
    </div>
  );
};

export default EditorToolbar;
