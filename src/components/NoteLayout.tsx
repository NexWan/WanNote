import {Note} from '../types/WanTypes';
import ReactMarkdown from 'react-markdown';

function NoteLayout({ note }: { note: Note }) {

    return (
        <div className="note-layout">
            <header className="note-header">
                <h1>{note.title}</h1>
                <small>Created at: {new Date(note.createdAt).toLocaleDateString()}</small>
                <small>Last updated: {new Date(note.updatedAt).toLocaleDateString()}</small>
            </header>
            <section className="note-content">
                {/* Text area to input note content */}
                <textarea value={note.content} />
                {/* Markdown renderizer */}
                <ReactMarkdown>{note.content}</ReactMarkdown>
            </section>
        </div>
    );
}

export default NoteLayout;
