import { useCirceStore } from '../store';

export function ProjectTabs() {
  const { projects, activeProjectId, setActiveProject, removeProject, processes } =
    useCirceStore();

  if (projects.length <= 1) return null;

  const runningCountByProject = (projectId: string): number => {
    return Object.values(processes).filter(
      (p) => p.projectId === projectId && p.status === 'running'
    ).length;
  };

  const handleClose = async (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.stopPropagation();
    const runningCount = runningCountByProject(projectId);
    if (runningCount > 0) {
      const confirmed = confirm(
        `"${projectName}" has ${runningCount} running script${runningCount > 1 ? 's' : ''}. Close anyway?`
      );
      if (!confirmed) return;
    }
    await window.circe.removeProject(projectId);
    removeProject(projectId);
  };

  return (
    <div className="flex items-center bg-surface border-b border-border overflow-x-auto">
      {projects.map((project) => {
        const isActive = activeProjectId === project.id;
        const runningCount = runningCountByProject(project.id);

        return (
          <div
            key={project.id}
            className={`group flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              isActive
                ? 'border-accent text-white bg-bg'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
            }`}
            onClick={() => setActiveProject(project.id)}
          >
            <span>{project.name}</span>
            {runningCount > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <span className="pulse-dot" />
                <span className="text-green-400">{runningCount}</span>
              </span>
            )}
            <button
              onClick={(e) => handleClose(e, project.id, project.name)}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity text-xs leading-none ml-0.5"
              title="Close tab"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
