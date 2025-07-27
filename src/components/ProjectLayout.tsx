import { useEffect, useState } from "react";
import { ProjectStructure, Note } from "../types/WanTypes";
import NoteLayout from "./NoteLayout";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { PlusCircleOutlined } from "@ant-design/icons";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { webviewWindow } from "@tauri-apps/api";
import Popup from "./Popup";
import { AnimationType } from "./Popup";
import { CloseRequestedEvent } from "@tauri-apps/api/window";

function ProjectLayout({ project }: { project: ProjectStructure }) {
  const [notes, setNotes] = useState<Note[]>(project.notes || []);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(0);
  const [activeContent, setActiveContent] = useState<string>(
    notes[0]?.content || ""
  );

  const [projectName, setProjectName] = useState<string>(project.name);
  const [projectDescription, setProjectDescription] = useState<string>(
    project.description
  );
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const [noteTitle, setNoteTitle] = useState<string>(notes[0]?.title || "");

  const [visibleHeader, setVisibleHeader] = useState(true);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupProps, setPopupProps] = useState<{
    name?: string;
    title?: string;
    content: string;
    closePopup: () => void;
    width?: string;
    height?: string;
    showCloseButton?: boolean;
    animationType: AnimationType;
    animationDuration?: number;
  } | null>(null);

  useEffect(() => {
    const appWindow = webviewWindow.getCurrentWebviewWindow();

    const unsubscribe = appWindow.onCloseRequested(
      async (event: CloseRequestedEvent) => {
        event.preventDefault(); // Prevent the default close action

        const answer = await ask(
          "Do you want to save changes before closing?",
          {
            title: "WanNote",
            kind: "warning",
            okLabel: "Save and Close",
            cancelLabel: "Close without Saving",
          }
        );
        console.log("User response:", answer);

        if (answer === true) {
          // User chose "Save and Close"
          await handleSaveAll();
          appWindow.destroy();
        } else if (answer === false) {
          // User chose "Close without Saving"
          appWindow.destroy();
        }
        // If answer is null (cancelled), do nothing - window stays open
      }
    );

    return () => {
      unsubscribe.then((unsub) => unsub());
    };
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      setActiveNoteIndex(0);
      setActiveContent(notes[0].content);
      setNoteTitle(notes[0].title);
    }
  }, [project]);

  // 🔑 GLOBAL KEYBIND FOR SAVE
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const isSaveShortcut =
        (isMac && e.metaKey && e.key === "s") ||
        (!isMac && e.ctrlKey && e.key === "s");
      const isCloseShortcut =
        (isMac && e.metaKey && e.key === "q") ||
        (!isMac && e.ctrlKey && e.key === "q"); 
      if (isSaveShortcut) {
        e.preventDefault();
        handleSaveAll();
      }
      if (isCloseShortcut) {
        e.preventDefault();
        await webviewWindow.getCurrentWebviewWindow().close();
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
      await writeTextFile(
        updatedProject.path,
        JSON.stringify(updatedProject, null, 2)
      );
      setPopupProps({
        name: "Success! ",
        title: "Project Saved",
        content: `Project "${projectName}" has been saved successfully.`,
        closePopup: () => setPopupProps(null),
        animationType: AnimationType.FADE,
        animationDuration: 5000,
      });
      setPopupVisible(true);
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
    <div className="flex flex-row w-full justify-center items-center h-full relative">
      <button
        onClick={() => setVisibleHeader(!visibleHeader)}
        className={`fixed bottom-4 z-10 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 border border-gray-600 ${
          visibleHeader ? "left-4" : "left-4"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              visibleHeader ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">
            {visibleHeader ? "Hide" : "Show"} Details
          </span>
        </span>
      </button>

      <header
        className={`project-header container p-4 h-full border-r border-gray-700 pr-4 transition-all duration-500 ease-in-out overflow-hidden ${
          visibleHeader
            ? "w-1/4 opacity-100 transform translate-x-0"
            : "w-0 opacity-0 transform -translate-x-full"
        }`}
      >
        <div
          className={`transition-opacity duration-300 ${
            visibleHeader ? "opacity-100" : "opacity-0"
          }`}
        >
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
          <small>
            Created at: {new Date(project.createdAt).toLocaleDateString()}
          </small>
          <small>
            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
          </small>

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
        </div>
      </header>

      <section
        className={`project-notes bg-base-300 h-full flex items-center justify-center transition-all duration-500 ease-in-out ${
          visibleHeader ? "w-3/4" : "w-full"
        }`}
      >
        {notes[activeNoteIndex] && (
          <NoteLayout
            key={notes[activeNoteIndex].id}
            note={notes[activeNoteIndex]}
            content={activeContent}
            setContent={setActiveContent}
            onSave={handleSaveAll}
            title={noteTitle}
            setTitle={setNoteTitle}
            projectPath={project.path}
          />
        )}
      </section>
      {popupVisible && popupProps && (
        <Popup
          name={popupProps.name}
          title={popupProps.title}
          content={popupProps.content}
          closePopup={popupProps.closePopup}
          width={popupProps.width || "w-96"}
          height={popupProps.height || "h-auto"}
          showCloseButton={popupProps.showCloseButton || true}
          animationType={popupProps.animationType || AnimationType.FADE}
          animationDuration={popupProps.animationDuration || 5000}
        />
      )}
    </div>
  );
}

export default ProjectLayout;
