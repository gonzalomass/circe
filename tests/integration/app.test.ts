/**
 * Integration tests for the Circe Electron app.
 *
 * Prerequisites:
 *   1. Build the app: npm run build
 *   2. Run: npx playwright test tests/integration/app.test.ts
 *
 * Uses Playwright's Electron driver. Spectron is deprecated — this is the
 * recommended approach for Electron integration testing as of 2024+.
 */

import { _electron as electron, ElectronApplication, Page } from 'playwright';
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

let app: ElectronApplication;
let page: Page;
let tmpDir: string;

test.beforeAll(async () => {
  // Ensure app is built before running
  app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });

  page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  // Give the renderer a moment to initialize IPC listeners
  await page.waitForTimeout(500);
});

test.afterAll(async () => {
  if (tmpDir) {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
  await app.close().catch(() => {});
});

test('app window opens and shows Circe branding', async () => {
  const title = await page.title();
  expect(title).toBe('Circe');

  // Sidebar header should show "Circe"
  const header = await page.locator('h1').first().textContent();
  expect(header).toContain('Circe');
});

test('shows empty state when no projects loaded', async () => {
  const body = await page.textContent('body');
  expect(body).toContain('No projects yet');
});

test('add test project via IPC and see scripts', async () => {
  // Create a temp project with a known script
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'circe-test-'));
  await fs.writeFile(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({
      name: 'circe-test-project',
      version: '1.0.0',
      description: 'Integration test project',
      scripts: {
        echo: 'echo "hello from circe integration test"',
        noop: 'node -e "process.exit(0)"'
      }
    })
  );

  // Inject project via Electron main process evaluation
  // This simulates what IPC does without requiring the file dialog
  await app.evaluate(
    async ({ ipcMain }, { projectPath }) => {
      // Fire the PROJECT_ADD_PATH handler logic directly
      const { loadProject } = require(
        require('path').join(__dirname, 'project-scanner')
      );
      const { getProjects, saveProjects, setActiveProjectId } = require(
        require('path').join(__dirname, 'store')
      );

      const project = await loadProject(projectPath);
      if (project) {
        const projects = getProjects();
        if (!projects.find((p: { path: string }) => p.path === project.path)) {
          projects.push(project);
          saveProjects(projects);
        }
        setActiveProjectId(project.id);
      }
    },
    { projectPath: tmpDir }
  );

  // Reload renderer to pick up persisted state
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Project name should appear in sidebar
  const sidebar = await page.textContent('aside');
  expect(sidebar).toContain('circe-test-project');

  // Script panel should show scripts
  const body = await page.textContent('body');
  expect(body).toContain('echo');
  expect(body).toContain('noop');
});

test('run script and see output stream', async () => {
  // Click the Run button for the "noop" script (exits cleanly)
  const runButton = page.locator('button', { hasText: 'Run' }).first();
  await expect(runButton).toBeVisible({ timeout: 5000 });
  await runButton.click();

  // Wait for the process to appear in the output console
  // The system line "Started npm run..." should appear
  await expect(
    page.locator('.font-mono').filter({ hasText: 'Started' })
  ).toBeVisible({ timeout: 10_000 });
});

test('process exits cleanly', async () => {
  // Wait for the "exited" status badge to appear
  await expect(
    page.locator('.status-exited')
  ).toBeVisible({ timeout: 10_000 });
});
