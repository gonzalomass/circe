import Store from 'electron-store';
import { Project } from '../shared/types';

interface StoreSchema {
  projects: Project[];
  activeProjectId: string | null;
}

const store = new Store<StoreSchema>({
  defaults: {
    projects: [],
    activeProjectId: null
  }
});

export function getProjects(): Project[] {
  return store.get('projects');
}

export function saveProjects(projects: Project[]): void {
  store.set('projects', projects);
}

export function getActiveProjectId(): string | null {
  return store.get('activeProjectId');
}

export function setActiveProjectId(id: string | null): void {
  store.set('activeProjectId', id);
}

export default store;
