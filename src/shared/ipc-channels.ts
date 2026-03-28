export const IpcChannels = {
  PROJECT_ADD_PATH: 'project:add-path',
  PROJECT_SCAN_FOLDER: 'project:scan-folder',
  PROJECT_REMOVE: 'project:remove',
  PROJECT_UPDATE: 'project:update',
  PROJECT_LIST: 'project:list',
  SCRIPT_RUN: 'script:run',
  SCRIPT_STOP: 'script:stop',
  SCRIPT_RESTART: 'script:restart',
  PROCESS_LIST: 'process:list',
  PROCESS_OUTPUT: 'process:output',
  PROCESS_STATUS: 'process:status',
  // Auto-updater
  UPDATER_CHECK: 'updater:check',
  UPDATER_INSTALL: 'updater:install',
  UPDATER_STATUS: 'updater:status'
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
