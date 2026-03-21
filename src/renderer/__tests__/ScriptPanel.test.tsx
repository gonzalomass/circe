import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScriptPanel } from '../components/ScriptPanel';
import { useCirceStore } from '../store';

const mockCirce = {
  runScript: jest.fn(),
  stopScript: jest.fn(),
  restartScript: jest.fn()
};

beforeAll(() => {
  (window as unknown as { circe: typeof mockCirce }).circe = mockCirce as unknown as typeof window.circe;
});

describe('ScriptPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCirceStore.setState({
      projects: [],
      activeProjectId: null,
      processes: {},
      outputs: {}
    });
  });

  it('shows empty state when no project selected', () => {
    render(<ScriptPanel />);
    expect(screen.getByText(/select a project/i)).toBeInTheDocument();
  });

  it('renders scripts from active project', () => {
    useCirceStore.setState({
      projects: [
        {
          id: '1',
          name: 'My App',
          path: '/tmp/app',
          scripts: [
            { name: 'dev', command: 'vite' },
            { name: 'build', command: 'vite build' },
            { name: 'test', command: 'jest' }
          ]
        }
      ],
      activeProjectId: '1'
    });

    render(<ScriptPanel />);
    expect(screen.getByText('dev')).toBeInTheDocument();
    expect(screen.getByText('build')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('triggers runScript on Run button click', async () => {
    mockCirce.runScript.mockResolvedValue({
      id: 'proc1',
      projectId: '1',
      scriptName: 'dev',
      status: 'running',
      pid: 1234
    });

    useCirceStore.setState({
      projects: [
        {
          id: '1',
          name: 'My App',
          path: '/tmp/app',
          scripts: [{ name: 'dev', command: 'vite' }]
        }
      ],
      activeProjectId: '1'
    });

    render(<ScriptPanel />);
    fireEvent.click(screen.getByText('Run'));

    expect(mockCirce.runScript).toHaveBeenCalledWith('1', 'dev');
  });

  it('shows status badge when process is running', () => {
    useCirceStore.setState({
      projects: [
        {
          id: '1',
          name: 'My App',
          path: '/tmp/app',
          scripts: [{ name: 'dev', command: 'vite' }]
        }
      ],
      activeProjectId: '1',
      processes: {
        proc1: {
          id: 'proc1',
          projectId: '1',
          scriptName: 'dev',
          status: 'running',
          pid: 1234
        }
      }
    });

    render(<ScriptPanel />);
    expect(screen.getByText('running')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.getByText('Restart')).toBeInTheDocument();
  });
});
