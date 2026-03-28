import { create } from 'zustand';
import { Project, ProcessInfo, OutputLine } from '../../shared/types';

interface CirceStore {
  projects: Project[];
  activeProjectId: string | null;
  processes: Record<string, ProcessInfo>;
  outputs: Record<string, OutputLine[]>;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  setActiveProject: (projectId: string | null) => void;
  updateProcess: (info: ProcessInfo) => void;
  appendOutput: (line: OutputLine) => void;
  clearOutput: (processId: string) => void;
}

export const useCirceStore = create<CirceStore>((set) => ({
  projects: [],
  activeProjectId: null,
  processes: {},
  outputs: {},

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({
      projects: state.projects.some((p) => p.id === project.id)
        ? state.projects
        : [...state.projects, project]
    })),

  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId
    })),

  reorderProjects: (fromIndex, toIndex) =>
    set((state) => {
      const updated = [...state.projects];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { projects: updated };
    }),

  setActiveProject: (projectId) => set({ activeProjectId: projectId }),

  updateProcess: (info) =>
    set((state) => ({
      processes: { ...state.processes, [info.id]: info }
    })),

  appendOutput: (line) =>
    set((state) => {
      const existing = state.outputs[line.processId] || [];
      const updated = [...existing, line];
      // Keep last 10k lines
      const trimmed = updated.length > 10_000 ? updated.slice(-10_000) : updated;
      return { outputs: { ...state.outputs, [line.processId]: trimmed } };
    }),

  clearOutput: (processId) =>
    set((state) => ({
      outputs: { ...state.outputs, [processId]: [] }
    }))
}));
