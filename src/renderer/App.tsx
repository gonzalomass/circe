import { useEffect } from 'react';
import { useCirceStore } from './store';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ProjectTabs } from './components/ProjectTabs';
import { ScriptPanel } from './components/ScriptPanel';
import { OutputConsole } from './components/OutputConsole';
import { UpdateNotification } from './components/UpdateNotification';

export default function App() {
  const { setProjects, setActiveProject, updateProcess, appendOutput } = useCirceStore();

  useEffect(() => {
    async function init() {
      const { projects, activeProjectId } = await window.circe.listProjects();
      setProjects(projects);
      setActiveProject(activeProjectId);

      const processes = await window.circe.listProcesses();
      for (const p of processes) {
        updateProcess(p);
      }
    }
    init();
  }, [setProjects, setActiveProject, updateProcess]);

  useEffect(() => {
    const unsubOutput = window.circe.onProcessOutput((line) => {
      appendOutput(line);
    });
    const unsubStatus = window.circe.onProcessStatus((info) => {
      updateProcess(info);
    });

    return () => {
      unsubOutput();
      unsubStatus();
    };
  }, [appendOutput, updateProcess]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <ProjectSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <ProjectTabs />
        <ScriptPanel />
        <OutputConsole />
      </div>
      <UpdateNotification />
    </div>
  );
}
