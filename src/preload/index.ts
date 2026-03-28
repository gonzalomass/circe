import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from '../shared/ipc-channels';
import type { Project, ProcessInfo, OutputLine } from '../shared/types';
import type { UpdateStatus } from '../main/updater';

export interface CirceAPI {
  // Projects
  listProjects(): Promise<{ projects: Project[]; activeProjectId: string | null }>;
  addProject(): Promise<Project | null>;
  scanFolder(): Promise<Project[]>;
  removeProject(projectId: string): Promise<boolean>;
  updateProject(projectId: string, updates: Partial<Pick<Project, 'label'>>): Promise<Project | null>;

  // Scripts
  runScript(projectId: string, scriptName: string): Promise<ProcessInfo>;
  stopScript(processId: string): Promise<boolean>;
  restartScript(processId: string): Promise<ProcessInfo | null>;

  // Processes
  listProcesses(): Promise<ProcessInfo[]>;

  // Auto-updater
  checkForUpdates(): Promise<UpdateStatus>;
  installUpdate(): Promise<void>;

  // Events
  onProcessOutput(callback: (line: OutputLine) => void): () => void;
  onProcessStatus(callback: (info: ProcessInfo) => void): () => void;
  onUpdateStatus(callback: (status: UpdateStatus) => void): () => void;
}

const api: CirceAPI = {
  listProjects: () => ipcRenderer.invoke(IpcChannels.PROJECT_LIST),
  addProject: () => ipcRenderer.invoke(IpcChannels.PROJECT_ADD_PATH),
  scanFolder: () => ipcRenderer.invoke(IpcChannels.PROJECT_SCAN_FOLDER),
  removeProject: (projectId) => ipcRenderer.invoke(IpcChannels.PROJECT_REMOVE, projectId),
  updateProject: (projectId, updates) =>
    ipcRenderer.invoke(IpcChannels.PROJECT_UPDATE, projectId, updates),

  runScript: (projectId, scriptName) =>
    ipcRenderer.invoke(IpcChannels.SCRIPT_RUN, projectId, scriptName),
  stopScript: (processId) => ipcRenderer.invoke(IpcChannels.SCRIPT_STOP, processId),
  restartScript: (processId) => ipcRenderer.invoke(IpcChannels.SCRIPT_RESTART, processId),

  listProcesses: () => ipcRenderer.invoke(IpcChannels.PROCESS_LIST),

  checkForUpdates: () => ipcRenderer.invoke(IpcChannels.UPDATER_CHECK),
  installUpdate: () => ipcRenderer.invoke(IpcChannels.UPDATER_INSTALL),

  onProcessOutput: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, line: OutputLine) => callback(line);
    ipcRenderer.on(IpcChannels.PROCESS_OUTPUT, handler);
    return () => ipcRenderer.removeListener(IpcChannels.PROCESS_OUTPUT, handler);
  },

  onProcessStatus: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, info: ProcessInfo) => callback(info);
    ipcRenderer.on(IpcChannels.PROCESS_STATUS, handler);
    return () => ipcRenderer.removeListener(IpcChannels.PROCESS_STATUS, handler);
  },

  onUpdateStatus: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, status: UpdateStatus) => callback(status);
    ipcRenderer.on(IpcChannels.UPDATER_STATUS, handler);
    return () => ipcRenderer.removeListener(IpcChannels.UPDATER_STATUS, handler);
  }
};

contextBridge.exposeInMainWorld('circe', api);

declare global {
  interface Window {
    circe: CirceAPI;
  }
}
