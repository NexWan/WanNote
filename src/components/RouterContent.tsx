import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import FirstTimeView from "../views/FirstTimeView";
import NewProjectView from "../views/NewProjectView";
import ProjectView from "../views/ProjectView";
import { ROUTES } from "../constants/routes";
import {
  loadOrCreateSettings,
  AppSettings,
  saveSettings,
} from "../lib/settings";
import { Menu, MenuItem, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu";
import { message, open } from "@tauri-apps/plugin-dialog";
import { ProjectStructure } from "../types/WanTypes";
import { readTextFile } from "@tauri-apps/plugin-fs";

function RouterContent() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [forceRefresh, setForceRefresh] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Force refresh function to trigger re-renders
  const refreshContent = useCallback(() => {
    setForceRefresh((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const setupMenu = async () => {
      const editSubmenu = await Submenu.new({
        text: "Edit",
        items: [
          await PredefinedMenuItem.new({ item: "Undo" }),
          await PredefinedMenuItem.new({ item: "Redo" }),
          await PredefinedMenuItem.new({ item: "Separator" }),
          await PredefinedMenuItem.new({ item: "Cut" }),
          await PredefinedMenuItem.new({ item: "Copy" }),
          await PredefinedMenuItem.new({ item: "Paste" }),
          await PredefinedMenuItem.new({ item: "SelectAll" }),
        ],
      });
      const fileSubmenu = await Submenu.new({
        text: "File",
        items: [
          await MenuItem.new({
            id: "open",
            text: "Open an existing project",
            action: async () => {
              try {
                const filePath = await open({
                  filters: [{ name: "WanNote Project", extensions: ["wan"] }],
                });

                if (filePath) {
                  try {
                    const fileContent = await readTextFile(filePath);

                    // Validate that file content is not empty
                    if (!fileContent.trim()) {
                      await message(
                        "The selected file is empty or corrupted.",
                        "Error"
                      );
                      return;
                    }

                    // Parse JSON with error handling
                    const project: ProjectStructure = JSON.parse(fileContent);

                    // Basic validation of project structure
                    if (!project.name || !project.path) {
                      await message("Invalid project file format.", "Error");
                      return;
                    }

                    console.log("Project loaded:", project);

                    // Update settings with last opened project
                    if (settings) {
                      const updatedSettings = {
                        ...settings,
                        lastOpenedProject: filePath,
                      };
                      await saveSettings(updatedSettings);
                      setSettings(updatedSettings);
                    }

                    // Force refresh and navigate
                    refreshContent();
                    navigate(ROUTES.PROJECT_VIEW, {
                      state: { projectPath: filePath, timestamp: Date.now() },
                      replace: true,
                    });
                  } catch (parseError) {
                    console.error("Error parsing project file:", parseError);
                    await message(
                      `Failed to open project file. The file may be corrupted or in an invalid format.\n\nError: ${
                        parseError instanceof Error
                          ? parseError.message
                          : "Unknown error"
                      }`,
                      "Error"
                    );
                  }
                } else {
                  await message("No project selected.", "Info");
                }
              } catch (fileError) {
                console.error("Error reading file:", fileError);
                await message(
                  `Failed to read the project file.\n\nError: ${
                    fileError instanceof Error
                      ? fileError.message
                      : "Unknown error"
                  }`,
                  "Error"
                );
              }
            },
          }),
          await MenuItem.new({
            id: "new",
            text: "Create a new project",
            action: () => {
              refreshContent();
              navigate(ROUTES.NEW_PROJECT, { replace: true });
            },
          }),
          await PredefinedMenuItem.new({ item: "Quit" }),
        ],
      });

      const aboutSubmenu = await Submenu.new({
        text: "About",
        items: [
          await MenuItem.new({
            id: "about",
            text: "About WanNote",
            // lógica sobre la app
          }),
          await MenuItem.new({
            id: "help",
            text: "Help",
            // lógica de ayuda
          }),
        ],
      });

      const menu = await Menu.new({
        items: [aboutSubmenu, fileSubmenu, editSubmenu],
      });

      await menu.setAsAppMenu();
    };

    setupMenu();
  }, [navigate, refreshContent, settings]);

  useEffect(() => {
    const init = async () => {
      try {
        const loadedSettings = await loadOrCreateSettings();
        setSettings(loadedSettings);
        setIsFirstTime(loadedSettings.firstTimeSetup);

        if (loadedSettings.firstTimeSetup) {
          loadedSettings.firstTimeSetup = false;
          await saveSettings(loadedSettings);
        }

        if (loadedSettings.lastOpenedProject) {
          try {
            // Validate that the last opened project still exists and is valid
            const fileContent = await readTextFile(
              loadedSettings.lastOpenedProject
            );
            const project: ProjectStructure = JSON.parse(fileContent);

            if (project.name && project.path) {
              navigate(ROUTES.PROJECT_VIEW, {
                state: {
                  projectPath: loadedSettings.lastOpenedProject,
                  timestamp: Date.now(),
                },
                replace: true,
              });
            }
          } catch (error) {
            console.warn("Last opened project is invalid or missing:", error);
            // Clear the invalid last opened project
            const updatedSettings = {
              ...loadedSettings,
              lastOpenedProject: undefined,
            };
            await saveSettings(updatedSettings);
            setSettings(updatedSettings);
          }
        }
      } catch (error) {
        console.error("Error initializing settings:", error);
        // Fallback to default settings if all else fails
        setSettings({
          firstTimeSetup: true,
          theme: "night",
          font: "Fredoka",
        });
        setIsFirstTime(true);
      }
    };

    init();
  }, [navigate]);

  // Add effect to handle location changes
  useEffect(() => {
    // This will trigger when location changes
    console.log("Route changed:", location.pathname, location.state);
  }, [location.pathname, location.state]);

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <Routes key={forceRefresh}>
      <Route
        path={ROUTES.HOME}
        element={isFirstTime ? <FirstTimeView /> : <NewProjectView />}
      />
      <Route path={ROUTES.NEW_PROJECT} element={<NewProjectView />} />
      <Route
        path={ROUTES.PROJECT_VIEW}
        element={
          <ProjectView key={location.state?.timestamp || forceRefresh} />
        }
      />
    </Routes>
  );
}

export default RouterContent;
