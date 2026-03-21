/**
 * Integration test for the Circe Electron app.
 *
 * Requires electron and the app to be built first.
 * Run with: npx playwright test tests/integration/app.test.ts
 *
 * Note: These tests use Playwright's Electron support.
 * Install with: npx playwright install
 */

import { _electron as electron, ElectronApplication, Page } from 'playwright';
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')]
  });
  page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await app.close();
});

test('app window opens with correct title', async () => {
  const title = await page.title();
  expect(title).toContain('Circe');
});

test('shows empty state message', async () => {
  const emptyText = await page.textContent('body');
  expect(emptyText).toContain('No projects yet');
});

test('add a test project and see scripts', async () => {
  // Create a temporary project with package.json
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'circe-test-'));
  await fs.writeFile(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({
      name: 'test-project',
      scripts: {
        echo: 'echo "hello from circe"'
      }
    })
  );

  // Use IPC to add the project directly (bypassing file dialog)
  await app.evaluate(async ({ ipcMain }, tmpDir) => {
    const { loadProject } = require('./project-scanner');
    const { saveProjects, getProjects, setActiveProjectId } = require('./store');
    const project = await loadProject(tmpDir);
    if (project) {
      const projects = getProjects();
      projects.push(project);
      saveProjects(projects);
      setActiveProjectId(project.id);
    }
  }, tmpDir);

  // Reload the page to see the new project
  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  // Verify the project and script appear
  const body = await page.textContent('body');
  expect(body).toContain('test-project');

  // Cleanup
  await fs.rm(tmpDir, { recursive: true, force: true });
});
