import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ProjectStructure } from "../types/WanTypes";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { message } from "@tauri-apps/plugin-dialog";
import ProjectLayout from "../components/ProjectLayout";
import { loadOrCreateSettings, saveSettings, AppSettings } from "../lib/settings";


export default function ProjectView() {
    const location = useLocation();
    const [project, setProject] = useState<ProjectStructure | null>(null);

    useEffect(() => {
        const loadProject = async () => {
            const state = location.state as { projectPath: string };

            if(!state?.projectPath) {
                console.error("No project path provided in state.");
                return;
            }

            try {
                const content = await readTextFile(state.projectPath);
                const projectData: ProjectStructure = JSON.parse(content);
                setProject(projectData);
            }catch (error) {
                await message("Failed to load project: " + error, "Error");
                console.error("Error loading project:", error);
            }

            // Save the last opened project path in settings
            const settings = await loadOrCreateSettings();
            settings.lastOpenedProject = state.projectPath;
            await saveSettings(settings);
        }

        loadProject();
    }, [location.state]);

    if (!project) {
        return <div>Loading project...</div>;
    }

    return (
        <main className="w-full h-full flex flex-col items-center justify-center">
            <ProjectLayout project={project} />
        </main>
    );
}