import { create } from 'zustand';
import type { Person, PersonWithConnections, GraphData, CreatePersonDTO } from '../types';
import { personApi, relationshipApi, exportApi, importApi, resetApi } from '../api/client';

interface AppState {
  persons: Person[];
  graphData: GraphData;
  selectedPerson: PersonWithConnections | null;
  focusedNodeId: number | null;
  loading: boolean;
  error: string | null;

  fetchPersons: () => Promise<void>;
  fetchGraph: () => Promise<void>;
  addPerson: (dto: CreatePersonDTO) => Promise<Person>;
  removePerson: (id: number) => Promise<void>;
  selectPerson: (id: number | null) => Promise<void>;
  focusNode: (id: number | null) => void;
  addRelationship: (from: number, to: number, type?: string) => Promise<void>;
  removeRelationship: (id: number) => Promise<void>;
  uploadAvatar: (id: number, file: File) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  resetData: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  persons: [],
  graphData: { nodes: [], links: [] },
  selectedPerson: null,
  focusedNodeId: null,
  loading: false,
  error: null,

  fetchPersons: async () => {
    set({ loading: true, error: null });
    try {
      const persons = await personApi.list();
      set({ persons });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchGraph: async () => {
    set({ loading: true, error: null });
    try {
      const graphData = await relationshipApi.getGraph();
      set({ graphData });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addPerson: async (dto) => {
    set({ loading: true, error: null });
    try {
      const person = await personApi.create(dto);
      await get().fetchPersons();
      await get().fetchGraph();
      return person;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  removePerson: async (id) => {
    set({ loading: true, error: null });
    try {
      await personApi.remove(id);
      if (get().selectedPerson?.id === id) {
        set({ selectedPerson: null });
      }
      await get().fetchPersons();
      await get().fetchGraph();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  selectPerson: async (id) => {
    if (id === null) {
      set({ selectedPerson: null });
      return;
    }
    try {
      const person = await personApi.get(id);
      set({ selectedPerson: person });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  focusNode: (id) => set({ focusedNodeId: id }),

  addRelationship: async (from, to, type) => {
    set({ loading: true, error: null });
    try {
      await relationshipApi.create(from, to, type);
      await get().fetchGraph();
      if (get().selectedPerson) {
        await get().selectPerson(get().selectedPerson!.id);
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  removeRelationship: async (id) => {
    set({ loading: true, error: null });
    try {
      await relationshipApi.remove(id);
      await get().fetchGraph();
      if (get().selectedPerson) {
        await get().selectPerson(get().selectedPerson!.id);
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (id, file) => {
    set({ loading: true, error: null });
    try {
      await personApi.uploadAvatar(id, file);
      await get().fetchPersons();
      await get().fetchGraph();
      if (get().selectedPerson?.id === id) {
        await get().selectPerson(id);
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  exportData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await exportApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `人际关系图_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  importData: async (file) => {
    set({ loading: true, error: null });
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importApi.importData(data);
      await get().fetchPersons();
      await get().fetchGraph();
      set({ selectedPerson: null });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  resetData: async () => {
    set({ loading: true, error: null });
    try {
      await resetApi.resetData();
      await get().fetchPersons();
      await get().fetchGraph();
      set({ selectedPerson: null });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
