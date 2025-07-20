import {NewButton} from "../components/buttons";
import {ROUTES} from "../constants/routes";
import { useNavigate } from "react-router";

export default function FirstTimeView() {
  const navigate = useNavigate();
  const handleNewProjectClick = () => {
    navigate(ROUTES.NEW_PROJECT);
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
    </main>
  );
}
