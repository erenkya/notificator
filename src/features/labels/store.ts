import { create } from 'zustand';
import { type SQLiteDatabase } from 'expo-sqlite';

export interface Label {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
  notes: string | null;
}

interface LabelState {
  labels: Label[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLabels: (db: SQLiteDatabase) => Promise<void>;
  addLabel: (
    db: SQLiteDatabase,
    label: Omit<Label, 'id'>
  ) => Promise<number | undefined>;
  updateLabel: (
    db: SQLiteDatabase,
    id: number,
    label: Omit<Label, 'id'>
  ) => Promise<void>;
  deleteLabel: (db: SQLiteDatabase, id: number) => Promise<void>;
}

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  isLoading: false,
  error: null,

  fetchLabels: async (db: SQLiteDatabase) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.getAllAsync<Label>('SELECT * FROM labels ORDER BY name ASC');
      set({ labels: result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to fetch labels:', error);
    }
  },

  addLabel: async (db: SQLiteDatabase, label: Omit<Label, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.runAsync(
        'INSERT INTO labels (name, color, icon, notes) VALUES (?, ?, ?, ?)',
        [label.name, label.color, label.icon, label.notes]
      );
      
      const newLabel: Label = {
        id: result.lastInsertRowId,
        ...label,
      };

      set((state) => ({
        labels: [...state.labels, newLabel].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));

      return result.lastInsertRowId;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to add label:', error);
    }
  },

  updateLabel: async (db: SQLiteDatabase, id: number, label: Omit<Label, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      await db.runAsync(
        'UPDATE labels SET name = ?, color = ?, icon = ?, notes = ? WHERE id = ?',
        [label.name, label.color, label.icon, label.notes, id]
      );

      set((state) => ({
        labels: state.labels.map((l) => (l.id === id ? { id, ...label } : l)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to update label:', error);
    }
  },

  deleteLabel: async (db: SQLiteDatabase, id: number) => {
    set({ isLoading: true, error: null });
    try {
      await db.runAsync('DELETE FROM labels WHERE id = ?', [id]);

      set((state) => ({
        labels: state.labels.filter((l) => l.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to delete label:', error);
    }
  },
}));
