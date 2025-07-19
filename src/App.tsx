import { HashRouter, Routes, Route } from "react-router-dom";
import FirstTimeView from "./views/FirstTimeView";
import NewProjectView from "./views/NewProjectView";
import { ROUTES } from "./constants/routes";
import { useEffect, useState } from "react";
import { loadOrCreateSettings, AppSettings } from "./lib/settings";

function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const loadedSettings = await loadOrCreateSettings();
      setSettings(loadedSettings);
      setIsFirstTime(loadedSettings.firstTimeSetup);
    };

    init();
  }, []);

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={isFirstTime ? <FirstTimeView /> : <NewProjectView />}
        />
        <Route path={ROUTES.NEW_PROJECT} element={<NewProjectView />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
