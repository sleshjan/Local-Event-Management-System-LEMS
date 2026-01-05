import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, label, placeholder, error }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list',
    'link'
  ];

  const handleChange = (content) => {
    // If the editor is empty, Quill sometimes returns "<p><br></p>"
    // We treat this as an empty string for validation consistency
    const cleanContent = content === '<p><br></p>' ? '' : content;
    onChange(cleanContent);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-gray-700 text-sm font-medium">
          {label}
        </label>
      )}
      <div className={`prose-sm bg-purple-50 rounded-xl overflow-hidden border ${error ? 'border-red-500' : 'border-transparent'} focus-within:ring-2 focus-within:ring-purple-500 transition-all`}>
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-white"
          style={{ height: 'auto', minHeight: '150px' }}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      <style>{`
        .quill {
          display: flex;
          flex-direction: column;
        }
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .ql-editor {
          min-height: 150px;
          color: #111827;
        }
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
