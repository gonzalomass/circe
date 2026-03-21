# Circe

Desktop Node.js script manager built with Electron + React + Vite + TypeScript.

Run, monitor, and manage npm scripts across multiple projects from a single interface.

## Features

- Add projects by folder or scan directories for package.json files
- Run/stop/restart npm scripts with one click
- Real-time output streaming with ANSI color support
- Virtual scrolling for large outputs (10k+ lines)
- Search/filter output
- Dark theme with purple accent
- Persistent project list across sessions

## Setup

```bash
nvm use 20
npm install
```

## Development

```bash
npm run dev         # Start Electron + Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Testing

```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
```

## Building Distributables

```bash
npm run package     # Build .dmg (macOS), .exe (Windows), .AppImage (Linux)
```

## Project Structure

```
src/
  main/               # Electron main process
    index.ts           # App entry, BrowserWindow, IPC handlers
    project-scanner.ts # Scan dirs for package.json, parse scripts
    process-manager.ts # Spawn/kill npm scripts, stream output
    store.ts           # electron-store persistence
  preload/
    index.ts           # contextBridge typed API
  renderer/            # React + Vite
    App.tsx
    store/index.ts     # Zustand store
    components/
      ProjectSidebar.tsx
      ProjectTabs.tsx
      ScriptPanel.tsx
      OutputConsole.tsx
  shared/
    types.ts           # Project, Script, ProcessInfo, OutputLine
    ipc-channels.ts    # Typed IPC channel names
```

## Tech Stack

- **Electron 28** — desktop shell
- **React 18** — UI
- **Vite 5 + electron-vite** — build tooling
- **Zustand** — state management
- **Tailwind CSS 3** — styling
- **react-virtuoso** — virtual scrolling for output
- **ansi-to-html** — ANSI color rendering
- **electron-store** — persistent settings
- **Jest + Testing Library** — unit tests
- **Playwright** — integration tests
