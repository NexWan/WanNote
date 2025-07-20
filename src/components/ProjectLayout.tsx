import { useEffect, useState } from "react";
import { ProjectStructure, Note } from "../types/WanTypes";
import NoteLayout from "./NoteLayout";
import { writeTextFile } from "@tauri-apps/plugin-fs";

function ProjectLayout({ project }: { project: ProjectStructure }) {
  const [notes, setNotes] = useState(project.notes || []);

  useEffect(() => {
    console.log(`Project ${project.name} loaded with ${project.notes.length} notes.`);
  }, [project]);

  const updateNote = async (updatedNote: Note) => {
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );

    setNotes(updatedNotes);

    const updatedProject: ProjectStructure = {
      ...project,
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    };

    try {
      await writeTextFile(updatedProject.path, JSON.stringify(updatedProject, null, 2));
      console.log("Project saved to disk!");
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  return (
    <div className="project-layout">
      <header className="project-header">
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        <small>Created at: {new Date(project.createdAt).toLocaleDateString()}</small>
        <small>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</small>
      </header>
      <section className="project-notes">
        {notes.length > 0 ? (
          notes.map((note) => (
            <NoteLayout key={note.id} note={note} onSave={updateNote} />
          ))
        ) : (
          <p>No notes available in this project.</p>
        )}
      </section>
    </div>
  );
}

export default ProjectLayout;
