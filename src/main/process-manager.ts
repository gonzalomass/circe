import { ChildProcess, spawn } from 'child_process';
import { BrowserWindow } from 'electron';
import { ProcessInfo, OutputLine } from '../shared/types';
import { IpcChannels } from '../shared/ipc-channels';

const MAX_LINES = 10_000;

interface ManagedProcess {
  info: ProcessInfo;
  child: ChildProcess;
  output: OutputLine[];
  projectPath: string;
  lineCounter: number;
}

class ProcessManager {
  private processes = new Map<string, ManagedProcess>();

  spawn(projectId: string, projectPath: string, scriptName: string): ProcessInfo {
    const processId = `${projectId}:${scriptName}:${Date.now()}`;
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    const child = spawn(npmCmd, ['run', scriptName], {
      cwd: projectPath,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });

    const info: ProcessInfo = {
      id: processId,
      projectId,
      scriptName,
      status: 'running',
      pid: child.pid,
      startedAt: Date.now()
    };

    const managed: ManagedProcess = {
      info,
      child,
      output: [],
      projectPath,
      lineCounter: 0
    };

    this.processes.set(processId, managed);
    this.emitStatus(info);
    this.emitSystemLine(managed, `Started "npm run ${scriptName}" (PID: ${child.pid})`);

    child.stdout?.on('data', (data: Buffer) => {
      this.handleOutput(managed, data.toString(), 'stdout');
    });

    child.stderr?.on('data', (data: Buffer) => {
      this.handleOutput(managed, data.toString(), 'stderr');
    });

    child.on('close', (code) => {
      managed.info.exitCode = code ?? undefined;
      managed.info.status = code === 0 ? 'exited' : 'crashed';
      managed.info.pid = undefined;
      this.emitStatus(managed.info);
      this.emitSystemLine(managed, `Process exited with code ${code}`);
    });

    child.on('error', (err) => {
      managed.info.status = 'crashed';
      managed.info.pid = undefined;
      this.emitStatus(managed.info);
      this.emitSystemLine(managed, `Process error: ${err.message}`);
    });

    return info;
  }

  async kill(processId: string): Promise<void> {
    const managed = this.processes.get(processId);
    if (!managed || managed.info.status !== 'running') return;

    managed.info.status = 'stopping';
    this.emitStatus(managed.info);

    const child = managed.child;

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch {
          // already dead
        }
      }, 3000);

      child.on('close', () => {
        clearTimeout(timeout);
        resolve();
      });

      try {
        child.kill('SIGTERM');
      } catch {
        clearTimeout(timeout);
        resolve();
      }
    });
  }

  async restart(processId: string): Promise<ProcessInfo | null> {
    const managed = this.processes.get(processId);
    if (!managed) return null;

    const { projectId, scriptName, projectPath } = {
      projectId: managed.info.projectId,
      scriptName: managed.info.scriptName,
      projectPath: managed.projectPath
    };

    await this.kill(processId);
    return this.spawn(projectId, projectPath, scriptName);
  }

  getAll(): ProcessInfo[] {
    return Array.from(this.processes.values()).map((m) => ({ ...m.info }));
  }

  getOutput(processId: string): OutputLine[] {
    const managed = this.processes.get(processId);
    return managed ? [...managed.output] : [];
  }

  async killAll(): Promise<void> {
    const running = Array.from(this.processes.values()).filter(
      (m) => m.info.status === 'running'
    );
    await Promise.all(running.map((m) => this.kill(m.info.id)));
  }

  private handleOutput(
    managed: ManagedProcess,
    text: string,
    type: 'stdout' | 'stderr'
  ): void {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line === '' && lines.length > 1) continue;
      const outputLine: OutputLine = {
        id: ++managed.lineCounter,
        processId: managed.info.id,
        text: line,
        type,
        timestamp: Date.now()
      };
      managed.output.push(outputLine);
      if (managed.output.length > MAX_LINES) {
        managed.output.shift();
      }
      this.emitOutput(outputLine);
    }
  }

  private emitSystemLine(managed: ManagedProcess, text: string): void {
    const outputLine: OutputLine = {
      id: ++managed.lineCounter,
      processId: managed.info.id,
      text,
      type: 'system',
      timestamp: Date.now()
    };
    managed.output.push(outputLine);
    this.emitOutput(outputLine);
  }

  private emitOutput(line: OutputLine): void {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannels.PROCESS_OUTPUT, line);
    }
  }

  private emitStatus(info: ProcessInfo): void {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IpcChannels.PROCESS_STATUS, { ...info });
    }
  }
}

export const processManager = new ProcessManager();
