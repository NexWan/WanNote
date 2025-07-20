import { ProjectStructure } from "../types/WanTypes";

function ProjectLayout({ project }: { project: ProjectStructure }) {
  return (
    <div className="project-layout">
      <header className="project-header">
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        <small>
          Created at: {new Date(project.createdAt).toLocaleDateString()}
        </small>
        <small>
          Last updated: {new Date(project.updatedAt).toLocaleDateString()}
        </small>
      </header>
      <section className="project-notes">
        <h2>Notes</h2>
        {project.notes.length > 0 ? (
          <ul>
            {project.notes.map((note) => (
              <li key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <small>
                  Created at: {new Date(note.createdAt).toLocaleDateString()}
                </small>
                <small>
                  Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notes available.</p>
        )}
      </section>
    </div>
  );
}

export default ProjectLayout;