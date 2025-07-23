import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FirstTimeView from "../views/FirstTimeView";
import NewProjectView from "../views/NewProjectView";
import ProjectView from "../views/ProjectView";
import { ROUTES } from "../constants/routes";
import { loadOrCreateSettings, AppSettings, saveSettings } from "../lib/settings";

function RouterContent() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const loadedSettings = await loadOrCreateSettings();
      setSettings(loadedSettings);
      setIsFirstTime(loadedSettings.firstTimeSetup);
      if (loadedSettings.firstTimeSetup) {
        loadedSettings.firstTimeSetup = false;
        await saveSettings(loadedSettings);
      }
      console.log("Settings loaded:", loadedSettings);
      if (loadedSettings.lastOpenedProject) {
        navigate(ROUTES.PROJECT_VIEW, {
          state: { projectPath: loadedSettings.lastOpenedProject },
        });
      }
    };

    init();
  }, []);

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path={ROUTES.HOME}
        element={isFirstTime ? <FirstTimeView /> : <NewProjectView />}
      />
      <Route path={ROUTES.NEW_PROJECT} element={<NewProjectView />} />
      <Route path={ROUTES.PROJECT_VIEW} element={<ProjectView />} />
    </Routes>
  );
}

export default RouterContent;
