import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const TextEditor = ({ value, onChange, name }) => {
  const [editorValue, setEditorValue] = useState(value || "");

  // Sync editor when editing existing blog
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value || "");
    }
  }, [value]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "color",
    "background",
    "link",
  ];

  const handleChange = (html) => {
    setEditorValue(html);
    // Create a synthetic event-like object
    onChange({
      target: {
        name: name,
        value: html
      }
    });
  };

  return (
    <div className="rounded-lg">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        className="min-h-[250px]"
      />
    </div>
  );
};

export default TextEditor;