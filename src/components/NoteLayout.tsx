import { useState } from 'react';
import { Note } from '../types/WanTypes';
import ReactMarkdown from 'react-markdown';
import { SaveButton } from './buttons';

type Props = {
  note: Note;
  onSave: (updatedNote: Note) => void;
};

function NoteLayout({ note, onSave }: Props) {
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    const updatedNote: Note = {
      ...note,
      content,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedNote);
    console.log('Note saved:', updatedNote);
  };

  return (
    <div className="note-layout my-6">
      <header className="note-header mb-2">
        <h2 className="text-xl font-semibold">{note.title}</h2>
        <small className="block">Created at: {new Date(note.createdAt).toLocaleDateString()}</small>
        <small className="block">Last updated: {new Date(note.updatedAt).toLocaleDateString()}</small>
      </header>
      <section className="note-content">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 p-2 border border-gray-600 rounded bg-[#0f172a] text-white font-mono resize-y"
        />
        <div className="markdown-preview mt-4 p-4 border-t border-gray-700 prose prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </section>
      <footer className="note-footer mt-2">
        <SaveButton onClick={handleSave} label="Save Note" className="mt-2" />
      </footer>
    </div>
  );
}

export default NoteLayout;
