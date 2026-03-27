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
  status: string;
}

interface ActivityState {
  activities: Activity[];
  historyActivities: Activity[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActivities: (db: SQLiteDatabase) => Promise<void>;
  fetchHistoryActivities: (db: SQLiteDatabase) => Promise<void>;
  fetchActivitiesByLabel: (db: SQLiteDatabase, labelId: number) => Promise<void>;
  addActivity: (db: SQLiteDatabase, activity: Omit<Activity, 'id' | 'status'>) => Promise<number | undefined>;
  updateActivity: (db: SQLiteDatabase, id: number, activity: Omit<Activity, 'id' | 'status'>) => Promise<void>;
  completeActivity: (db: SQLiteDatabase, id: number) => Promise<void>;
  revertActivity: (db: SQLiteDatabase, id: number) => Promise<void>;
  deleteActivity: (db: SQLiteDatabase, id: number) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  historyActivities: [],
  isLoading: false,
  error: null,

  fetchActivities: async (db: SQLiteDatabase) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.getAllAsync<Activity>("SELECT * FROM activities WHERE status = 'ACTIVE' ORDER BY time IS NULL, time ASC, title ASC");
      set({ activities: result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to fetch activities:', error);
    }
  },

  fetchHistoryActivities: async (db: SQLiteDatabase) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.getAllAsync<Activity>("SELECT * FROM activities WHERE status = 'COMPLETED' ORDER BY time DESC");
      set({ historyActivities: result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to fetch history:', error);
    }
  },

  fetchActivitiesByLabel: async (db: SQLiteDatabase, labelId: number) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.getAllAsync<Activity>(
        "SELECT * FROM activities WHERE label_id = ? AND status = 'ACTIVE' ORDER BY time IS NULL, time ASC, title ASC",
        [labelId]
      );
      set({ activities: result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error(`Failed to fetch activities for label ${labelId}:`, error);
    }
  },

  addActivity: async (db: SQLiteDatabase, activity: Omit<Activity, 'id' | 'status'>) => {
    set({ isLoading: true, error: null });
    try {
      const result = await db.runAsync(
        'INSERT INTO activities (label_id, title, notes, schedule_type, notification_preference, time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          activity.label_id,
          activity.title,
          activity.notes,
          activity.schedule_type,
          activity.notification_preference,
          activity.time,
          'ACTIVE',
        ]
      );

      if (activity.schedule_type && ['daily', 'weekly', 'monthly'].includes(activity.schedule_type)) {
        await db.runAsync(
          'INSERT INTO recurrence_rules (activity_id, frequency, interval) VALUES (?, ?, ?)',
          [result.lastInsertRowId, activity.schedule_type, 1]
        );
      }

      const newActivity: Activity = {
        id: result.lastInsertRowId,
        status: 'ACTIVE',
        ...activity,
      };

      set((state) => {
        const updated = [...state.activities, newActivity];
        updated.sort((a, b) => {
          if (!a.time && !b.time) return a.title.localeCompare(b.title);
          if (!a.time) return 1;
          if (!b.time) return -1;
          const tA = new Date(a.time).getTime();
          const tB = new Date(b.time).getTime();
          return tA === tB ? a.title.localeCompare(b.title) : tA - tB;
        });
        return { activities: updated, isLoading: false };
      });

      return result.lastInsertRowId;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to add activity:', error);
    }
  },

  updateActivity: async (
    db: SQLiteDatabase,
    id: number,
    activity: Omit<Activity, 'id' | 'status'>
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

      await db.runAsync('DELETE FROM recurrence_rules WHERE activity_id = ?', [id]);
      if (activity.schedule_type && ['daily', 'weekly', 'monthly'].includes(activity.schedule_type)) {
        await db.runAsync(
          'INSERT INTO recurrence_rules (activity_id, frequency, interval) VALUES (?, ?, ?)',
          [id, activity.schedule_type, 1]
        );
      }

      set((state) => {
        const newList = state.activities.map((a) => (a.id === id ? { id, ...activity, status: a.status } : a));
        newList.sort((a, b) => {
          if (!a.time && !b.time) return a.title.localeCompare(b.title);
          if (!a.time) return 1;
          if (!b.time) return -1;
          const tA = new Date(a.time).getTime();
          const tB = new Date(b.time).getTime();
          return tA === tB ? a.title.localeCompare(b.title) : tA - tB;
        });
        return { activities: newList, isLoading: false };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to update activity:', error);
    }
  },

  revertActivity: async (db: SQLiteDatabase, id: number) => {
    set({ isLoading: true, error: null });
    try {
      await db.runAsync("UPDATE activities SET status = 'ACTIVE' WHERE id = ?", [id]);
      
      set((state) => {
        const revertedAct = state.historyActivities.find(a => a.id === id);
        const newHistory = state.historyActivities.filter((a) => a.id !== id);
        let newActivities = state.activities;
        
        if (revertedAct) {
          const updatedAct = { ...revertedAct, status: 'ACTIVE' };
          newActivities = [...state.activities, updatedAct];
          newActivities.sort((a, b) => {
            if (!a.time && !b.time) return a.title.localeCompare(b.title);
            if (!a.time) return 1;
            if (!b.time) return -1;
            const tA = new Date(a.time).getTime();
            const tB = new Date(b.time).getTime();
            return tA === tB ? a.title.localeCompare(b.title) : tA - tB;
          });
        }

        return {
          activities: newActivities,
          historyActivities: newHistory,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to revert activity:', error);
    }
  },

  completeActivity: async (db: SQLiteDatabase, id: number) => {
    set({ isLoading: true, error: null });
    try {
      await db.runAsync("UPDATE activities SET status = 'COMPLETED' WHERE id = ?", [id]);
      
      set((state) => {
        const completedAct = state.activities.find(a => a.id === id);
        const newActivities = state.activities.filter((a) => a.id !== id);
        const newHistory = completedAct ? [{ ...completedAct, status: 'COMPLETED' }, ...state.historyActivities] : state.historyActivities;

        return {
          activities: newActivities,
          historyActivities: newHistory,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to complete activity:', error);
    }
  },

  deleteActivity: async (db: SQLiteDatabase, id: number) => {
    set({ isLoading: true, error: null });
    try {
      await db.runAsync('DELETE FROM activities WHERE id = ?', [id]);

      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
        historyActivities: state.historyActivities.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Failed to delete activity:', error);
    }
  },
}));
