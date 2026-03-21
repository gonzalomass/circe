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
    <div className="flex items-center h-9 px-2 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {projects.map((project) => {
        const isActive = activeProjectId === project.id;
        const runningCount = runningCountByProject(project.id);
        return (
          <div
            key={project.id}
            onClick={() => setActiveProject(project.id)}
            className={`group flex items-center gap-1.5 px-3 py-1 text-xs whitespace-nowrap mx-0.5 my-1 cursor-pointer transition-all duration-150`}
            style={{
              borderRadius: '5px',
              border: isActive ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
              background: isActive ? 'rgba(6,182,212,0.08)' : 'transparent',
              color: isActive ? '#06b6d4' : 'rgba(255,255,255,0.55)',
            }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.92)'; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
          >
            <span className="font-medium">{project.label ?? project.name}</span>
            {runningCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="pulse-dot" />
                <span className="text-status-online text-[10px] font-medium">{runningCount}</span>
              </span>
            )}
            <button
              onClick={(e) => handleClose(e, project.id, project.name)}
              className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-opacity ml-0.5 text-sm leading-none"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
