import { useCirceStore } from '../store';
import { Script, ProcessInfo } from '../../shared/types';

function StatusBadge({ status }: { status: ProcessInfo['status'] }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === 'running' && <span className="pulse-dot" />}
      {status}
    </span>
  );
}

function groupByPrefix(scripts: Script[]): Map<string, Script[]> {
  if (scripts.length <= 8) return new Map([['', scripts]]);

  const groups = new Map<string, Script[]>();
  for (const script of scripts) {
    const colonIdx = script.name.indexOf(':');
    const prefix = colonIdx > 0 ? script.name.substring(0, colonIdx) : '';
    const existing = groups.get(prefix) || [];
    existing.push(script);
    groups.set(prefix, existing);
  }
  return groups;
}

export function ScriptPanel() {
  const { projects, activeProjectId, processes, updateProcess } = useCirceStore();
  const activeProject = projects.find((p) => p.id === activeProjectId);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        Select a project to view its scripts
      </div>
    );
  }

  const getProcessForScript = (scriptName: string): ProcessInfo | undefined => {
    return Object.values(processes).find(
      (p) =>
        p.projectId === activeProject.id &&
        p.scriptName === scriptName &&
        (p.status === 'running' || p.status === 'stopping')
    );
  };

  const handleRun = async (scriptName: string) => {
    const info = await window.circe.runScript(activeProject.id, scriptName);
    updateProcess(info);
  };

  const handleStop = async (processId: string) => {
    await window.circe.stopScript(processId);
  };

  const handleRestart = async (processId: string) => {
    const info = await window.circe.restartScript(processId);
    if (info) updateProcess(info);
  };

  const grouped = groupByPrefix(activeProject.scripts);

  if (activeProject.scripts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-tertiary">
        No scripts found in this project
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Scripts &mdash; {activeProject.name}
      </h2>

      {Array.from(grouped.entries()).map(([prefix, scripts]) => (
        <div key={prefix} className="mb-4">
          {prefix && (
            <h3 className="text-xs text-text-tertiary uppercase tracking-wider mb-1 ml-1">
              {prefix}
            </h3>
          )}
          <div className="space-y-1.5">
            {scripts.map((script) => {
              const proc = getProcessForScript(script.name);
              const isRunning = proc?.status === 'running';
              const isStopping = proc?.status === 'stopping';

              return (
                <div
                  key={script.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 group cursor-default"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{script.name}</span>
                      {proc && <StatusBadge status={proc.status} />}
                    </div>
                    <div className="text-xs text-text-tertiary truncate font-mono mt-0.5">
                      {script.command}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    {!isRunning && !isStopping && (
                      <button
                        onClick={() => handleRun(script.name)}
                        className="btn-primary px-2.5 py-1 text-xs"
                        title="Run"
                      >
                        Run
                      </button>
                    )}
                    {isRunning && proc && (
                      <>
                        <button
                          onClick={() => handleStop(proc.id)}
                          className="btn-ghost px-2.5 py-1 text-xs"
                          title="Stop"
                        >
                          Stop
                        </button>
                        <button
                          onClick={() => handleRestart(proc.id)}
                          className="btn-ghost px-2.5 py-1 text-xs"
                          title="Restart"
                        >
                          Restart
                        </button>
                      </>
                    )}
                    {isStopping && (
                      <span className="text-xs text-status-busy">Stopping...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
