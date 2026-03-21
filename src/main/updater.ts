import { autoUpdater, UpdateInfo } from 'electron-updater';
import { app, BrowserWindow, ipcMain } from 'electron';
import { IpcChannels } from '../shared/ipc-channels';

export type UpdateStatus =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available'; version: string; releaseNotes?: string }
  | { type: 'not-available' }
  | { type: 'downloading'; percent: number }
  | { type: 'ready'; version: string }
  | { type: 'error'; message: string };

let currentStatus: UpdateStatus = { type: 'idle' };

function broadcast(win: BrowserWindow | null, status: UpdateStatus): void {
  currentStatus = status;
  win?.webContents.send(IpcChannels.UPDATER_STATUS, status);
}

export function initUpdater(getMainWindow: () => BrowserWindow | null): void {
  // In dev, disable auto-update checks entirely
  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = false;
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Feed URL is picked up automatically from package.json `build.publish`
  // or from electron-builder publish config (GitHub provider)

  autoUpdater.on('checking-for-update', () => {
    broadcast(getMainWindow(), { type: 'checking' });
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    const notes =
      typeof info.releaseNotes === 'string'
        ? info.releaseNotes
        : Array.isArray(info.releaseNotes)
          ? info.releaseNotes.map((n) => (typeof n === 'string' ? n : n.note ?? '')).join('\n')
          : undefined;

    broadcast(getMainWindow(), {
      type: 'available',
      version: info.version,
      releaseNotes: notes
    });
  });

  autoUpdater.on('update-not-available', () => {
    broadcast(getMainWindow(), { type: 'not-available' });
  });

  autoUpdater.on('download-progress', (progress) => {
    broadcast(getMainWindow(), {
      type: 'downloading',
      percent: Math.round(progress.percent)
    });
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    broadcast(getMainWindow(), {
      type: 'ready',
      version: info.version
    });
  });

  autoUpdater.on('error', (err: Error) => {
    broadcast(getMainWindow(), {
      type: 'error',
      message: err.message
    });
  });
}

export function registerUpdaterIpc(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IpcChannels.UPDATER_CHECK, async () => {
    if (!app.isPackaged) {
      return { type: 'not-available' };
    }
    try {
      await autoUpdater.checkForUpdates();
    } catch (e) {
      const err = e as Error;
      broadcast(getMainWindow(), { type: 'error', message: err.message });
    }
    return currentStatus;
  });

  ipcMain.handle(IpcChannels.UPDATER_INSTALL, () => {
    autoUpdater.quitAndInstall(false, true);
  });
}


