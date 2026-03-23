import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

const BlogEditor = ({ value, onChange }) => {

const editor = useEditor({
    extensions: [
    StarterKit,
    Link.configure({
        openOnClick: true,
    }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
    onChange(editor.getHTML());
    },
});
useEffect(() => {
if (editor && value) {
    editor.commands.setContent(value);
}
}, [value, editor]);
const addLink = () => {
    const url = prompt("Enter URL");

    if (url) {
    editor.chain().focus().setLink({ href: url }).run();
    }
};

if (!editor) return null;

return (
    <div className="border rounded-lg p-3">

    <div className="flex gap-2 mb-3">

        <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 bg-gray-200 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
        Bold
        </button>

        <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 bg-gray-200 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
        Italic
        </button>

        <button
        type="button"
        onClick={addLink}
        className={`px-3 py-1 bg-gray-200 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
        Link 🔗
        </button>

    </div>

    <EditorContent editor={editor} className="min-h-[200px] prose max-w-none [&_a]:text-blue-600 [&_a]:underline" />

    </div>
);
};

export default BlogEditor;