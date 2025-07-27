import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import FirstTimeView from "../views/FirstTimeView";
import NewProjectView from "../views/NewProjectView";
import ProjectView from "../views/ProjectView";
import { ROUTES } from "../constants/routes";
import { loadOrCreateSettings, AppSettings, saveSettings } from "../lib/settings";
import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";
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
    setForceRefresh(prev => prev + 1);
  }, []);

  useEffect(() => {
    const setupMenu = async () => {
      const fileSubmenu = await Submenu.new({
        text: "File",
        items: [
          await MenuItem.new({
            id: "open",
            text: "Open an existing project",
            action: async () => {
              const filePath = await open({
                filters: [{ name: "WanNote Project", extensions: ["wan"] }],
              });
              if (filePath) {
                const project: ProjectStructure = JSON.parse(await readTextFile(filePath));
                console.log("Project loaded:", project);
                // Force refresh and navigate
                refreshContent();
                navigate(ROUTES.PROJECT_VIEW, { 
                  state: { projectPath: filePath, timestamp: Date.now() },
                  replace: true 
                });
              } else {
                await message("No project selected.", "Info");
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
          await MenuItem.new({
            id: "save",
            text: "Save the current project",
            // lógica de guardado
          }),
          await MenuItem.new({
            id: "exit",
            text: "Exit",
            // lógica de salida
          }),
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
        items: [aboutSubmenu, fileSubmenu],
      });

      await menu.setAsAppMenu();
    };

    setupMenu();
  }, [navigate, refreshContent]);

  // ✅ Cargar settings y redirigir a proyecto si ya hay uno
  useEffect(() => {
    const init = async () => {
      const loadedSettings = await loadOrCreateSettings();
      setSettings(loadedSettings);
      setIsFirstTime(loadedSettings.firstTimeSetup);
      if (loadedSettings.firstTimeSetup) {
        loadedSettings.firstTimeSetup = false;
        await saveSettings(loadedSettings);
      }
      if (loadedSettings.lastOpenedProject) {
        navigate(ROUTES.PROJECT_VIEW, {
          state: { projectPath: loadedSettings.lastOpenedProject, timestamp: Date.now() },
          replace: true
        });
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
        element={<ProjectView key={location.state?.timestamp || forceRefresh} />} 
      />
    </Routes>
  );
}

export default RouterContent;
