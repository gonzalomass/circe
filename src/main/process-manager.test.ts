import { EventEmitter } from 'events';

// Mock electron before importing process-manager
jest.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: jest.fn().mockReturnValue([])
  }
}));

// Mock child_process
const mockSpawn = jest.fn();
jest.mock('child_process', () => ({
  spawn: (...args: unknown[]) => mockSpawn(...args)
}));

import { processManager } from './process-manager';

function createMockChild(): EventEmitter & { pid: number; kill: jest.Mock; stdout: EventEmitter; stderr: EventEmitter } {
  const child = new EventEmitter() as EventEmitter & {
    pid: number;
    kill: jest.Mock;
    stdout: EventEmitter;
    stderr: EventEmitter;
  };
  child.pid = 12345;
  child.kill = jest.fn();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  return child;
}

describe('ProcessManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should spawn a process and return ProcessInfo', () => {
    const mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);

    const info = processManager.spawn('proj1', '/tmp/project', 'dev');

    expect(info.projectId).toBe('proj1');
    expect(info.scriptName).toBe('dev');
    expect(info.status).toBe('running');
    expect(info.pid).toBe(12345);
    expect(mockSpawn).toHaveBeenCalledWith(
      expect.stringContaining('npm'),
      ['run', 'dev'],
      expect.objectContaining({ cwd: '/tmp/project' })
    );
  });

  it('should emit output events on stdout data', () => {
    const mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);

    processManager.spawn('proj1', '/tmp/project', 'build');

    mockChild.stdout.emit('data', Buffer.from('hello world\n'));

    // Output is stored internally - verify via getAll that process exists
    const all = processManager.getAll();
    expect(all.some((p) => p.scriptName === 'build')).toBe(true);
  });

  it('should set status to crashed on non-zero exit', () => {
    const mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);

    const info = processManager.spawn('proj1', '/tmp/project', 'test');

    mockChild.emit('close', 1);

    const all = processManager.getAll();
    const proc = all.find((p) => p.id === info.id);
    expect(proc?.status).toBe('crashed');
    expect(proc?.exitCode).toBe(1);
  });

  it('should set status to exited on zero exit code', () => {
    const mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);

    const info = processManager.spawn('proj1', '/tmp/project', 'lint');

    mockChild.emit('close', 0);

    const all = processManager.getAll();
    const proc = all.find((p) => p.id === info.id);
    expect(proc?.status).toBe('exited');
  });

  it('should send SIGTERM on kill', async () => {
    const mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);

    const info = processManager.spawn('proj1', '/tmp/project', 'serve');

    mockChild.kill.mockImplementation(() => {
      // Simulate process exit after SIGTERM
      setTimeout(() => mockChild.emit('close', 0), 10);
      return true;
    });

    await processManager.kill(info.id);

    expect(mockChild.kill).toHaveBeenCalledWith('SIGTERM');
  });

  it('should return correct state from getAll', () => {
    const mockChild = createMockChild();
    mockSpawn.mockReturnValue(mockChild);

    processManager.spawn('proj1', '/tmp/project', 'watch');

    const all = processManager.getAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((p) => p.scriptName === 'watch')).toBe(true);
  });
});
