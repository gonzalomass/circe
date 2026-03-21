import { useCirceStore } from '../store';

export function ProjectTabs() {
  const { projects, activeProjectId, setActiveProject, processes } = useCirceStore();

  if (projects.length <= 1) return null;

  const runningCountByProject = (projectId: string): number => {
    return Object.values(processes).filter(
      (p) => p.projectId === projectId && p.status === 'running'
    ).length;
  };

  return (
    <div className="flex items-center bg-surface border-b border-border overflow-x-auto">
      {projects.map((project) => {
        const isActive = activeProjectId === project.id;
        const runningCount = runningCountByProject(project.id);

        return (
          <button
            key={project.id}
            onClick={() => setActiveProject(project.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? 'border-accent text-white bg-bg'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
            }`}
          >
            <span>{project.name}</span>
            {runningCount > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <span className="pulse-dot" />
                <span className="text-green-400">{runningCount}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
