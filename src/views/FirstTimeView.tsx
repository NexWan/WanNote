import {NewButton, OpenButton} from "../components/buttons";
import {ROUTES} from "../constants/routes";
import { useNavigate } from "react-router";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { open, message } from "@tauri-apps/plugin-dialog";
import { ProjectStructure } from "../types/WanTypes";

export default function FirstTimeView() {
  const navigate = useNavigate();
  const handleNewProjectClick = () => {
    navigate(ROUTES.NEW_PROJECT);
  };
  const handleOpenProjectClick = async () => {
    const filePath = await open({
      filters: [{ name: "WanNote Project", extensions: ["wan"] }],
    });
    if (filePath) {
      const fileContent = await readTextFile(filePath);
      const project: ProjectStructure = JSON.parse(fileContent);
      console.log("Project loaded:", project);
      // Do something with the file content
      navigate(ROUTES.PROJECT_VIEW, { state: { projectPath: filePath } });
    } else {
      await message("No project selected.", "Info");
    }
  };
  return (
    <main className="container mx-auto w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">Welcome to WanNote!</h1>
      <p className="mt-4">This is a simple note-taking application.</p>
      <NewButton
        onClick={handleNewProjectClick}
        label="Create a new project!"
        className="mt-6"
      />
      <p className="mt-4">Or open an existing project:</p>
      <OpenButton
        onClick={handleOpenProjectClick}
        label="Open Project"
        className="mt-2"
      />
    </main>
  );
}
