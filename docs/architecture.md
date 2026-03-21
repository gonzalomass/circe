# Architecture

## IPC Channels

| Channel              | Direction        | Payload                  | Response                |
|---------------------|------------------|--------------------------|-------------------------|
| project:add-path    | renderer -> main | —                        | Project \| null         |
| project:scan-folder | renderer -> main | —                        | Project[]               |
| project:remove      | renderer -> main | projectId: string        | boolean                 |
| project:list        | renderer -> main | —                        | { projects, activeId }  |
| script:run          | renderer -> main | projectId, scriptName    | ProcessInfo             |
| script:stop         | renderer -> main | processId: string        | boolean                 |
| script:restart      | renderer -> main | processId: string        | ProcessInfo \| null     |
| process:list        | renderer -> main | —                        | ProcessInfo[]           |
| process:output      | main -> renderer | OutputLine               | — (event)               |
| process:status      | main -> renderer | ProcessInfo              | — (event)               |

## Process Lifecycle

```
           spawn()
  idle ──────────> running
                     │
          ┌──────────┼──────────┐
          │          │          │
        exit(0)   exit(n)   error
          │          │          │
          v          v          v
        exited    crashed    crashed
          │          │          │
          └──────────┴──────────┘
                     │
               restart() ──> running
```

### Kill sequence

1. Send SIGTERM
2. Wait 3 seconds
3. If still alive, send SIGKILL

## State Shape (Zustand)

```typescript
{
  projects: Project[]           // all tracked projects
  activeProjectId: string|null  // currently selected
  processes: Record<string, ProcessInfo>  // keyed by process ID
  outputs: Record<string, OutputLine[]>   // keyed by process ID, max 10k lines
}
```

## Data Flow

1. User clicks "Run" on a script
2. Renderer calls `window.circe.runScript(projectId, scriptName)`
3. Preload forwards via `ipcRenderer.invoke('script:run', ...)`
4. Main process handler calls `processManager.spawn()`
5. ProcessManager spawns `npm run <script>` via child_process
6. stdout/stderr data emitted to all windows via `webContents.send('process:output', line)`
7. Renderer listens via `window.circe.onProcessOutput()`, appends to Zustand store
8. OutputConsole re-renders with virtual scrolling via react-virtuoso
