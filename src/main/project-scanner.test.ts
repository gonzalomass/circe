import * as fs from 'fs/promises';
import * as path from 'path';

// Mock electron dialog
jest.mock('electron', () => ({
  dialog: {
    showOpenDialog: jest.fn()
  }
}));

jest.mock('fs/promises');

const mockReaddir = fs.readdir as jest.MockedFunction<typeof fs.readdir>;
const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;

import { scanDirectory, loadProject } from './project-scanner';

describe('project-scanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadProject', () => {
    it('should parse a valid package.json correctly', async () => {
      const pkgJson = JSON.stringify({
        name: 'my-app',
        description: 'Test app',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          test: 'jest'
        }
      });

      mockReadFile.mockResolvedValue(pkgJson);

      const project = await loadProject('/tmp/my-app');

      expect(project).not.toBeNull();
      expect(project!.name).toBe('my-app');
      expect(project!.description).toBe('Test app');
      expect(project!.scripts).toHaveLength(3);
      expect(project!.scripts[0]).toEqual({ name: 'dev', command: 'vite' });
      expect(project!.path).toBe('/tmp/my-app');
    });

    it('should return empty scripts array when no scripts in package.json', async () => {
      const pkgJson = JSON.stringify({ name: 'no-scripts' });
      mockReadFile.mockResolvedValue(pkgJson);

      const project = await loadProject('/tmp/no-scripts');

      expect(project).not.toBeNull();
      expect(project!.scripts).toHaveLength(0);
    });

    it('should return null for non-existent package.json', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      const project = await loadProject('/tmp/nonexistent');
      expect(project).toBeNull();
    });

    it('should return null for invalid JSON', async () => {
      mockReadFile.mockResolvedValue('not valid json {{{');

      const project = await loadProject('/tmp/bad-json');
      expect(project).toBeNull();
    });

    it('should use directory basename when name is missing', async () => {
      const pkgJson = JSON.stringify({ scripts: { dev: 'vite' } });
      mockReadFile.mockResolvedValue(pkgJson);

      const project = await loadProject('/tmp/my-folder');

      expect(project).not.toBeNull();
      expect(project!.name).toBe('my-folder');
    });
  });

  describe('scanDirectory', () => {
    it('should exclude node_modules directories', async () => {
      mockReaddir.mockImplementation(async (dirPath) => {
        const dir = dirPath.toString();
        if (dir === '/root') {
          return [
            { name: 'package.json', isFile: () => true, isDirectory: () => false },
            { name: 'node_modules', isFile: () => false, isDirectory: () => true },
            { name: 'subdir', isFile: () => false, isDirectory: () => true }
          ] as unknown as Awaited<ReturnType<typeof fs.readdir>>;
        }
        if (dir === path.join('/root', 'subdir')) {
          return [
            { name: 'package.json', isFile: () => true, isDirectory: () => false }
          ] as unknown as Awaited<ReturnType<typeof fs.readdir>>;
        }
        return [] as unknown as Awaited<ReturnType<typeof fs.readdir>>;
      });

      const results = await scanDirectory('/root');

      expect(results).toContain('/root');
      expect(results).toContain(path.join('/root', 'subdir'));
      expect(results).not.toContain(path.join('/root', 'node_modules'));
    });

    it('should respect max depth', async () => {
      mockReaddir.mockImplementation(async (dirPath) => {
        const dir = dirPath.toString();
        if (dir === '/root') {
          return [
            { name: 'level1', isFile: () => false, isDirectory: () => true }
          ] as unknown as Awaited<ReturnType<typeof fs.readdir>>;
        }
        if (dir === path.join('/root', 'level1')) {
          return [
            { name: 'level2', isFile: () => false, isDirectory: () => true }
          ] as unknown as Awaited<ReturnType<typeof fs.readdir>>;
        }
        if (dir === path.join('/root', 'level1', 'level2')) {
          return [
            { name: 'package.json', isFile: () => true, isDirectory: () => false }
          ] as unknown as Awaited<ReturnType<typeof fs.readdir>>;
        }
        return [] as unknown as Awaited<ReturnType<typeof fs.readdir>>;
      });

      // maxDepth=1 should NOT reach level2
      const results = await scanDirectory('/root', 1);
      expect(results).not.toContain(path.join('/root', 'level1', 'level2'));
    });
  });
});
