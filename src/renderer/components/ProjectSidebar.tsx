import { useState } from 'react';
import { useCirceStore } from '../store';
import { Project } from '../../shared/types';
import circeLogo from '../../../public/c-logo.png';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CirceSignil() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {/* Outer ring */}
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeOpacity="0.6"
        strokeDasharray="3 2"
      />
      {/* Inner ring */}
      <circle cx="14" cy="14" r="8" stroke="#06b6d4" strokeWidth="0.75" strokeOpacity="0.4" />
      {/* Center star/wand */}
      <circle cx="14" cy="14" r="2" fill="#06b6d4" />
      {/* Radial spokes */}
      <line
        x1="14"
        y1="2"
        x2="14"
        y2="6"
        stroke="#06b6d4"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="22"
        x2="14"
        y2="26"
        stroke="#06b6d4"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="14"
        x2="6"
        y2="14"
        stroke="#06b6d4"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="14"
        x2="26"
        y2="14"
        stroke="#06b6d4"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      {/* Diagonal spokes (lighter) */}
      <line
        x1="5.5"
        y1="5.5"
        x2="8.3"
        y2="8.3"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <line
        x1="19.7"
        y1="19.7"
        x2="22.5"
        y2="22.5"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <line
        x1="22.5"
        y1="5.5"
        x2="19.7"
        y2="8.3"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <line
        x1="5.5"
        y1="22.5"
        x2="8.3"
        y2="19.7"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProjectSidebar() {
  const { projects, activeProjectId, setActiveProject, addProject, removeProject, setProjects } =
    useCirceStore();
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState('');

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
    const confirmed = confirm(`Remove "${project.label ?? project.name}" from Circe?`);
    if (!confirmed) return;
    await window.circe.removeProject(project.id);
    removeProject(project.id);
  };

  const startEditLabel = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingLabelId(project.id);
    setLabelDraft(project.label ?? project.name);
  };

  const saveLabel = (projectId: string) => {
    const trimmed = labelDraft.trim();
    setProjects(
      projects.map((p) => (p.id === projectId ? { ...p, label: trimmed || undefined } : p))
    );
    setEditingLabelId(null);
  };

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Header — left padding accounts for macOS traffic light buttons (hiddenInset) */}
      <div
        className="flex items-center gap-2.5"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingLeft: '80px',
          paddingRight: '16px',
          paddingTop: '12px',
          paddingBottom: '12px',
          WebkitAppRegion: 'drag' as React.CSSProperties['WebkitAppRegion']
        }}
      >
        <div
          style={{ WebkitAppRegion: 'no-drag' as React.CSSProperties['WebkitAppRegion'] }}
          className="flex items-center gap-2.5"
        >
          <img
            src={circeLogo}
            alt="Circe"
            style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div className="text-sm font-semibold text-text-primary tracking-wide">Circe</div>
            <div className="text-xs text-text-tertiary" style={{ fontSize: '0.65rem' }}>
              Script Manager
            </div>
          </div>
        </div>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {projects.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <div className="text-text-tertiary text-xs leading-relaxed">
              No projects yet.
              <br />
              Add one to get started.
            </div>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {projects.map((project) => {
              const displayName = project.label ?? project.name;
              const isActive = activeProjectId === project.id;
              return (
                <li
                  key={project.id}
                  onClick={() => setActiveProject(project.id)}
                  className="group cursor-pointer transition-all duration-150"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(6,182,212,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(6,182,212,0.25)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      {editingLabelId === project.id ? (
                        <input
                          autoFocus
                          value={labelDraft}
                          onChange={(e) => setLabelDraft(e.target.value)}
                          onBlur={() => saveLabel(project.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveLabel(project.id);
                            if (e.key === 'Escape') setEditingLabelId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="glass-input w-full py-0.5 text-xs"
                          placeholder="Project label..."
                        />
                      ) : (
                        <div
                          className={`text-xs font-medium truncate ${isActive ? 'text-accent' : 'text-text-primary'}`}
                          onDoubleClick={(e) => startEditLabel(e, project)}
                          title="Double-click to set label"
                        >
                          {displayName}
                        </div>
                      )}
                      <div
                        className="text-text-tertiary truncate mt-0.5"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {project.label ? project.name : project.path.split('/').slice(-2).join('/')}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemove(e, project)}
                      className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 flex-shrink-0 transition-opacity text-sm leading-none mt-0.5"
                      title="Remove project"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={handleAddProject} className="btn-primary w-full py-2 text-xs">
          + Add Project
        </button>
        <button onClick={handleScanFolder} className="btn-ghost w-full py-2 text-xs">
          Scan Folder
        </button>
      </div>
    </aside>
  );
}
