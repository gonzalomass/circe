export const IpcChannels = {
  PROJECT_ADD_PATH: 'project:add-path',
  PROJECT_SCAN_FOLDER: 'project:scan-folder',
  PROJECT_REMOVE: 'project:remove',
  PROJECT_LIST: 'project:list',
  SCRIPT_RUN: 'script:run',
  SCRIPT_STOP: 'script:stop',
  SCRIPT_RESTART: 'script:restart',
  PROCESS_LIST: 'process:list',
  PROCESS_OUTPUT: 'process:output',
  PROCESS_STATUS: 'process:status'
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
