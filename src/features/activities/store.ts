import { create } from 'zustand';
import { type SQLiteDatabase } from 'expo-sqlite';

export interface Activity {
  id: number;
  label_id: number;
  title: string;
  notes: string | null;
  schedule_type: string | null; // daily, weekly, monthly, custom
  notification_preference: string | null;
  time: string | null;
}

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActivities: (db: SQLiteDatabase) => Promise<void>;
  fetchActivitiesByLabel: (db: SQLiteDatabase, labelId: number) => Promise<void>;
  addActivity: (
    db: SQLiteDatabase,
    activity: Omit<Activity, 'id'>
  ) => Promise<number | undefined>;
  updateActivity: (
    db: SQLiteDatabase,
    id: number,
    activity: Omit<Activity, 'id'>
  ) => Promise<void>;
  deleteActivity: (db: SQLiteDatabase, id: number) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,

  fetchActivities: async (db: SQLiteDatabase) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.getAllAsync<Activity>('SELECT * FROM activities ORDER BY title ASC');
      set({ activities: result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to fetch activities:', error);
    }
  },

  fetchActivitiesByLabel: async (db: SQLiteDatabase, labelId: number) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.getAllAsync<Activity>(
        'SELECT * FROM activities WHERE label_id = ? ORDER BY title ASC',
        [labelId]
      );
      set({ activities: result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error(`Failed to fetch activities for label ${labelId}:`, error);
    }
  },

  addActivity: async (db: SQLiteDatabase, activity: Omit<Activity, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.runAsync(
        'INSERT INTO activities (label_id, title, notes, schedule_type, notification_preference, time) VALUES (?, ?, ?, ?, ?, ?)',
        [
          activity.label_id,
          activity.title,
          activity.notes,
          activity.schedule_type,
          activity.notification_preference,
          activity.time,
        ]
      );

      const newActivity: Activity = {
        id: result.lastInsertRowId,
        ...activity,
      };

      set((state) => ({
        activities: [...state.activities, newActivity].sort((a, b) => a.title.localeCompare(b.title)),
        isLoading: false,
      }));

      return result.lastInsertRowId;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to add activity:', error);
    }
  },

  updateActivity: async (
    db: SQLiteDatabase,
    id: number,
    activity: Omit<Activity, 'id'>
  ) => {
    set({ isLoading: true, error: null });
    try {
      await db.runAsync(
        'UPDATE activities SET label_id = ?, title = ?, notes = ?, schedule_type = ?, notification_preference = ?, time = ? WHERE id = ?',
        [
          activity.label_id,
          activity.title,
          activity.notes,
          activity.schedule_type,
          activity.notification_preference,
          activity.time,
          id,
        ]
      );

      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? { id, ...activity } : a)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to update activity:', error);
    }
  },

  deleteActivity: async (db: SQLiteDatabase, id: number) => {
    set({ isLoading: true, error: null });
    try {
      await db.runAsync('DELETE FROM activities WHERE id = ?', [id]);

      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to delete activity:', error);
    }
  },
}));
