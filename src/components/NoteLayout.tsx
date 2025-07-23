import { useState } from 'react';
import { Note } from '../types/WanTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SaveButton } from './buttons';

type Props = {
  note: Note;
  content: string;
  setContent: (val: string) => void;
  onSave: (updatedNote: Note) => void;
  title: string;
  setTitle: (val: string) => void;
};

function NoteLayout({ note, content, setContent, onSave, title, setTitle }: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const insertTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const before = content.substring(0, selectionStart);
      const after = content.substring(selectionEnd);
      const updatedContent = `${before}  ${after}`;
      setContent(updatedContent);

      setTimeout(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  const handleSave = () => {
    const updatedNote: Note = {
      ...note,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedNote);
    console.log('Note saved:', updatedNote);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    if (title.trim() === "") {
      setTitle("Untitled Note");
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="note-layout bg-base-300 my-6 w-full p-4 h-full flex flex-col items-center justify-between">
      <header className="note-header mb-2 container">
        {isEditingTitle ? (
          <input
            type="text"
            className="text-xl font-semibold bg-transparent border-b border-gray-500 focus:outline-none w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h2
            className="text-xl font-semibold cursor-pointer"
            onClick={handleTitleClick}
            title="Click to edit title"
          >
            {title}
          </h2>
        )}
        <small className="block">Created at: {new Date(note.createdAt).toLocaleDateString()}</small>
        <small className="block">Last updated: {new Date(note.updatedAt).toLocaleDateString()}</small>
      </header>

      <section className="note-content flex flex-row items-center justify-between w-full h-full">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={insertTab}
          className="w-1/2 h-auto min-h-full p-2 border border-gray-600 outline-none active:focus:outline-none rounded bg-[#0f172a] text-white font-mono resize-y"
        />
        <div className="markdown-preview min-h-full w-1/2 mt-4 p-4 border-l border-gray-700 prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </section>

      <footer className="note-footer mt-2 self-start bottom-0">
        <SaveButton onClick={handleSave} label="Save Note" className="mt-2" />
      </footer>
    </div>
  );
}

export default NoteLayout;
