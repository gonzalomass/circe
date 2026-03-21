import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';
import { IpcChannels } from '../shared/ipc-channels';
import { getProjects, saveProjects, getActiveProjectId, setActiveProjectId } from './store';
import { loadProject, scanDirectory, showProjectPicker } from './project-scanner';
import { processManager } from './process-manager';
import { Project } from '../shared/types';

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Circe',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

function registerIpcHandlers(): void {
  ipcMain.handle(IpcChannels.PROJECT_LIST, () => {
    return {
      projects: getProjects(),
      activeProjectId: getActiveProjectId()
    };
  });

  ipcMain.handle(IpcChannels.PROJECT_ADD_PATH, async () => {
    const project = await showProjectPicker();
    if (!project) return null;

    const projects = getProjects();
    const existing = projects.find((p) => p.path === project.path);
    if (existing) return existing;

    projects.push(project);
    saveProjects(projects);
    setActiveProjectId(project.id);
    return project;
  });

  ipcMain.handle(IpcChannels.PROJECT_SCAN_FOLDER, async () => {
    const { dialog } = await import('electron');
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select a folder to scan for projects'
    });

    if (result.canceled || result.filePaths.length === 0) return [];

    const dirs = await scanDirectory(result.filePaths[0]);
    const newProjects: Project[] = [];

    const existingProjects = getProjects();
    const existingPaths = new Set(existingProjects.map((p) => p.path));

    for (const dir of dirs) {
      if (existingPaths.has(dir)) continue;
      const project = await loadProject(dir);
      if (project) {
        newProjects.push(project);
      }
    }

    if (newProjects.length > 0) {
      const all = [...existingProjects, ...newProjects];
      saveProjects(all);
      if (!getActiveProjectId()) {
        setActiveProjectId(newProjects[0].id);
      }
    }

    return newProjects;
  });

  ipcMain.handle(IpcChannels.PROJECT_REMOVE, (_event, projectId: string) => {
    const projects = getProjects().filter((p) => p.id !== projectId);
    saveProjects(projects);
    if (getActiveProjectId() === projectId) {
      setActiveProjectId(projects.length > 0 ? projects[0].id : null);
    }
    return true;
  });

  ipcMain.handle(
    IpcChannels.SCRIPT_RUN,
    (_event, projectId: string, scriptName: string) => {
      const projects = getProjects();
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error(`Project not found: ${projectId}`);
      return processManager.spawn(projectId, project.path, scriptName);
    }
  );

  ipcMain.handle(IpcChannels.SCRIPT_STOP, async (_event, processId: string) => {
    await processManager.kill(processId);
    return true;
  });

  ipcMain.handle(IpcChannels.SCRIPT_RESTART, async (_event, processId: string) => {
    return processManager.restart(processId);
  });

  ipcMain.handle(IpcChannels.PROCESS_LIST, () => {
    return processManager.getAll();
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await processManager.killAll();
});
