import { useEffect, useState } from "react";
import { ProjectStructure, Note } from "../types/WanTypes";
import NoteLayout from "./NoteLayout";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { PlusCircleOutlined } from "@ant-design/icons";
import { message } from "@tauri-apps/plugin-dialog";

function ProjectLayout({ project }: { project: ProjectStructure }) {
  const [notes, setNotes] = useState<Note[]>(project.notes || []);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(0);
  const [activeContent, setActiveContent] = useState<string>(notes[0]?.content || "");

  const [projectName, setProjectName] = useState<string>(project.name);
  const [projectDescription, setProjectDescription] = useState<string>(project.description);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const [noteTitle, setNoteTitle] = useState<string>(notes[0]?.title || "");

  useEffect(() => {
    if (notes.length > 0) {
      setActiveNoteIndex(0);
      setActiveContent(notes[0].content);
      setNoteTitle(notes[0].title);
    }
  }, [project]);

  // 🔑 GLOBAL KEYBIND FOR SAVE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const isSaveShortcut =
        (isMac && e.metaKey && e.key === "s") || (!isMac && e.ctrlKey && e.key === "s");

      if (isSaveShortcut) {
        e.preventDefault();
        handleSaveAll();
        message("Project saved successfully via shortcut!", "Success");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeContent, noteTitle, projectName, projectDescription, notes]);

  const handleSaveAll = async () => {
    const updatedNotes = notes.map((note, index) =>
      index === activeNoteIndex
        ? {
            ...note,
            content: activeContent,
            title: noteTitle,
            updatedAt: new Date().toISOString(),
          }
        : note
    );

    const updatedProject: ProjectStructure = {
      ...project,
      name: projectName,
      description: projectDescription,
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    };

    setNotes(updatedNotes);

    try {
      await writeTextFile(updatedProject.path, JSON.stringify(updatedProject, null, 2));
      console.log("Full project saved via shortcut!");
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const handleSwitchNote = async (index: number) => {
    if (activeNoteIndex === index) return;

    await handleSaveAll(); // Save everything before switching
    setActiveNoteIndex(index);
    setActiveContent(notes[index].content);
    setNoteTitle(notes[index].title);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: (notes.length + 1).toString(),
      title: `New Note ${notes.length + 1}`,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      attachments: [],
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setActiveNoteIndex(updatedNotes.length - 1);
    setActiveContent("");
    setNoteTitle(newNote.title);
  };

  return (
    <div className="flex flex-row w-full justify-center items-center h-full">
      <header className="project-header container p-4 h-full w-1/4 self-start place-self-start border-r border-gray-700 pr-4">
        {editingName ? (
          <input
            className="text-2xl font-bold bg-transparent border-b border-gray-500 focus:outline-none w-full"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setEditingName(false)}
            autoFocus
          />
        ) : (
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => setEditingName(true)}
          >
            {projectName}
          </h1>
        )}

        {editingDescription ? (
          <input
            className="bg-transparent border-b border-gray-500 focus:outline-none w-full"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            onBlur={() => setEditingDescription(false)}
            autoFocus
          />
        ) : (
          <p
            className="cursor-pointer text-sm text-gray-400"
            onClick={() => setEditingDescription(true)}
          >
            {projectDescription || <em>No description</em>}
          </p>
        )}

        <small className="block">Project path: {project.path}</small>
        <small>Created at: {new Date(project.createdAt).toLocaleDateString()}</small>
        <small>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</small>

        <ul>
          {notes.map((note, index) => (
            <li
              key={note.id}
              className="my-2 hover:cursor-pointer hover:scale-105 transition-all"
              onClick={() => handleSwitchNote(index)}
            >
              <strong>{note.title}</strong> -{" "}
              {new Date(note.updatedAt).toLocaleDateString()}
            </li>
          ))}
        </ul>

        <span className="flex items-center justify-center gap-x-2 mt-4 hover:scale-105 transition-all cursor-pointer text-blue-500">
          <PlusCircleOutlined onClick={createNewNote} />
          <p>Create New Note</p>
        </span>
      </header>

      <section className="project-notes bg-base-300 h-full w-3/4 flex items-center justify-center">
        {notes[activeNoteIndex] && (
          <NoteLayout
            key={notes[activeNoteIndex].id}
            note={notes[activeNoteIndex]}
            content={activeContent}
            setContent={setActiveContent}
            onSave={() => {}} 
            title={noteTitle}
            setTitle={setNoteTitle}
            projectPath={project.path}
          />
        )}
      </section>
    </div>
  );
}

export default ProjectLayout;
