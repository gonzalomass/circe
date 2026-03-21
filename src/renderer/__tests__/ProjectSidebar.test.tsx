import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectSidebar } from '../components/ProjectSidebar';
import { useCirceStore } from '../store';

// Mock window.circe
const mockCirce = {
  addProject: jest.fn(),
  scanFolder: jest.fn(),
  removeProject: jest.fn(),
  listProjects: jest.fn()
};

beforeAll(() => {
  (window as unknown as { circe: typeof mockCirce }).circe = mockCirce;
});

describe('ProjectSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCirceStore.setState({
      projects: [],
      activeProjectId: null,
      processes: {},
      outputs: {}
    });
  });

  it('renders empty state when no projects', () => {
    render(<ProjectSidebar />);
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
  });

  it('renders project list', () => {
    useCirceStore.setState({
      projects: [
        { id: '1', name: 'Project A', path: '/tmp/a', scripts: [] },
        { id: '2', name: 'Project B', path: '/tmp/b', scripts: [] }
      ]
    });

    render(<ProjectSidebar />);
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
  });

  it('calls addProject on Add Project button click', async () => {
    mockCirce.addProject.mockResolvedValue({
      id: '3',
      name: 'New Project',
      path: '/tmp/new',
      scripts: []
    });

    render(<ProjectSidebar />);
    fireEvent.click(screen.getByText('Add Project'));

    expect(mockCirce.addProject).toHaveBeenCalled();
  });

  it('shows remove button on hover', () => {
    useCirceStore.setState({
      projects: [{ id: '1', name: 'Project A', path: '/tmp/a', scripts: [] }]
    });

    render(<ProjectSidebar />);
    const removeBtn = screen.getByTitle('Remove project');
    expect(removeBtn).toBeInTheDocument();
  });
});
