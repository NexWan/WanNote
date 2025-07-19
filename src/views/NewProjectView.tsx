import NewButton from "../components/buttons";

export default function NewProjectView() {
  return (
    <main className="container mx-auto w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">Create a New Project</h1>
      <p className="mt-4">This is where you can create a new project.</p>
      <NewButton
        onClick={() => alert("New project button clicked!")}
        label="Start New Project"
        className="mt-6"
      />
    </main>
  );
}
