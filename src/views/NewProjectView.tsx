import {NewButton} from "../components/buttons";
import { save, message } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { Note, ProjectStructure } from "../types/WanTypes";
import { ROUTES } from "../constants/routes";
import { useNavigate } from "react-router-dom";
import DialogProject from "../components/DialogProject";
import { useState } from "react";

export default function NewProjectView() {
  const [showDialog, setShowDialog] = useState(false);

  const defaultNote: Note = {
    id: "1",
    title: "Welcome Note",
    content: "# This is your first note in WanNote!", // <- This is a markdown content
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["welcome", "first"],
    attachments: [],
  };

  const navigate = useNavigate();

  async function handleSaveProject(project: ProjectStructure) {
    console.log("Saving project:", project);
    if (project) {
      project.notes = [defaultNote]; // Add default note to the project
      try {
        await writeTextFile(project.path, JSON.stringify(project, null, 2));
        console.log("Project saved successfully!");
        message("Project created successfully!", "Success");
        navigate(ROUTES.PROJECT_VIEW, { state: { projectPath: project.path } });
      } catch (error) {
        console.error("Error saving project:", error);
        message("Failed to create project.", "Error");
      }
    }
     // navigate(ROUTES.PROJECT_VIEW, { state: { projectPath: filePath } });
  }

  return (
    <main className="container mx-auto w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">Create a New Project</h1>
      <p className="mt-4">This is where you can create a new project.</p>
      <NewButton
        onClick={() => setShowDialog(true)}
        label="Start New Project"
        className="mt-6"
      />
      {showDialog && (
        <DialogProject
          onClose={() => setShowDialog(false)}
          onSave={handleSaveProject }
        />
      )}
    </main>
  );
}
