import * as fs from 'fs/promises';
import * as path from 'path';
import { dialog } from 'electron';
import { Project, Script } from '../shared/types';

export async function scanDirectory(dirPath: string, maxDepth = 3): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentPath: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    const hasPackageJson = entries.some(
      (e) => e.isFile() && e.name === 'package.json'
    );

    if (hasPackageJson) {
      results.push(currentPath);
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      await walk(path.join(currentPath, entry.name), depth + 1);
    }
  }

  await walk(dirPath, 0);
  return results;
}

export async function loadProject(dirPath: string): Promise<Project | null> {
  const pkgPath = path.join(dirPath, 'package.json');

  let content: string;
  try {
    content = await fs.readFile(pkgPath, 'utf-8');
  } catch {
    return null;
  }

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(content);
  } catch {
    return null;
  }

  const scripts: Script[] = [];
  const rawScripts = pkg.scripts as Record<string, string> | undefined;
  if (rawScripts && typeof rawScripts === 'object') {
    for (const [name, command] of Object.entries(rawScripts)) {
      if (typeof command === 'string') {
        scripts.push({ name, command });
      }
    }
  }

  const name = (pkg.name as string) || path.basename(dirPath);
  const description = (pkg.description as string) || undefined;
  const id = Buffer.from(dirPath).toString('base64url');

  return { id, name, path: dirPath, scripts, description };
}

export async function showProjectPicker(): Promise<Project | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select a project folder'
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return loadProject(result.filePaths[0]);
}
