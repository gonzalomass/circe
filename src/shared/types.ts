export interface Project {
  id: string;
  name: string;
  path: string;
  scripts: Script[];
  description?: string;
}

export interface Script {
  name: string;
  command: string;
}

export interface ProcessInfo {
  id: string;
  projectId: string;
  scriptName: string;
  status: 'idle' | 'running' | 'stopping' | 'crashed' | 'exited';
  pid?: number;
  startedAt?: number;
  exitCode?: number;
}

export interface OutputLine {
  id: number;
  processId: string;
  text: string;
  type: 'stdout' | 'stderr' | 'system';
  timestamp: number;
  html?: string;
}
