import {NewButton} from "../components/buttons";
import { save, message } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { Note } from "../types/WanTypes";
import { ROUTES } from "../constants/routes";
import { useNavigate } from "react-router-dom";

export default function NewProjectView() {
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

  async function handleSaveProject() {
    const filePath = await save({
      defaultPath: "new_project.wan", // this is just a json file but with a custom extension :D
      filters: [{ name: "WanNote Project", extensions: ["wan"] }],
    });

    if (filePath) {
      await writeTextFile(
        filePath,
        JSON.stringify({
          name: "New Project",
          description: "This is a new project created in WanNote.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: [defaultNote],
          path: filePath,
        })
      );
      await message("Project saved successfully!", "Success");

      navigate(ROUTES.PROJECT_VIEW, { state: { projectPath: filePath } });

    } else {
      await message("Project save was cancelled.", "Info");
    }
  }

  return (
    <main className="container mx-auto w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">Create a New Project</h1>
      <p className="mt-4">This is where you can create a new project.</p>
      <NewButton
        onClick={() => handleSaveProject()}
        label="Start New Project"
        className="mt-6"
      />
    </main>
  );
}
