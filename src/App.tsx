import "./App.css";
import {HashRouter, Routes, Route} from "react-router-dom";
import FirstTimeView from "./views/FirstTimeView";
import NewProjectView from "./views/NewProjectView";
import {ROUTES} from "./constants/routes";
function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path={ROUTES.FIRST_TIME} element={<FirstTimeView />} />
        <Route path={ROUTES.HOME} element={<FirstTimeView />} />
        <Route path={ROUTES.NEW_PROJECT} element={<NewProjectView />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
