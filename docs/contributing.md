# Contributing

## Development Setup

```bash
git clone <repo-url>
cd circe
nvm use 20
npm install
npm run dev
```

## Commit Format

Use conventional commits:

```
feat: add new feature
fix: resolve bug in process manager
refactor: simplify IPC handler registration
test: add tests for project scanner
docs: update architecture diagram
```

## Code Style

- TypeScript strict mode — no `any`
- Prettier for formatting (`npm run format`)
- ESLint for linting (`npm run lint`)
- Use `path.join()` for all file paths (no hardcoded slashes)

## Testing

All PRs must include tests for new functionality.

```bash
npm test          # run all tests
npm run test:watch # watch mode during development
```

### Test structure

- `src/main/*.test.ts` — main process unit tests (Jest, node environment)
- `src/renderer/__tests__/*.test.tsx` — React component tests (Jest, jsdom)
- `tests/integration/` — Playwright end-to-end tests

## Project Conventions

- IPC channels defined in `src/shared/ipc-channels.ts` — add new channels there
- Types shared between main/renderer go in `src/shared/types.ts`
- Windows compatibility: use `npm.cmd` on win32, `npm` elsewhere
- Output buffer: max 10,000 lines per process (circular)
