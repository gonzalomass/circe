import { useCirceStore } from '../store';
import { Project } from '../../shared/types';

export function ProjectSidebar() {
  const { projects, activeProjectId, setActiveProject, addProject, removeProject, setProjects } =
    useCirceStore();

  const handleAddProject = async () => {
    const project = await window.circe.addProject();
    if (project) {
      addProject(project);
      setActiveProject(project.id);
    }
  };

  const handleScanFolder = async () => {
    const newProjects = await window.circe.scanFolder();
    if (newProjects.length > 0) {
      const { projects: all, activeProjectId: newActive } = await window.circe.listProjects();
      setProjects(all);
      setActiveProject(newActive);
    }
  };

  const handleRemove = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const confirmed = confirm(`Remove "${project.name}" from Circe?`);
    if (!confirmed) return;
    await window.circe.removeProject(project.id);
    removeProject(project.id);
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h1 className="text-accent font-bold text-lg tracking-wide">Circe</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {projects.length === 0 ? (
          <div className="px-3 py-8 text-gray-500 text-sm text-center">
            No projects yet. Add one to get started.
          </div>
        ) : (
          <ul>
            {projects.map((project) => (
              <li
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={`group flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                  activeProjectId === project.id
                    ? 'bg-accent/20 border-l-2 border-accent'
                    : 'hover:bg-surface-hover border-l-2 border-transparent'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-100 truncate">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{project.path}</div>
                </div>
                <button
                  onClick={(e) => handleRemove(e, project)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 ml-2 flex-shrink-0 transition-opacity"
                  title="Remove project"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={handleAddProject}
          className="w-full px-3 py-1.5 bg-accent hover:bg-accent-light text-white text-sm rounded transition-colors"
        >
          Add Project
        </button>
        <button
          onClick={handleScanFolder}
          className="w-full px-3 py-1.5 bg-surface-hover hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
        >
          Scan Folder
        </button>
      </div>
    </aside>
  );
}
