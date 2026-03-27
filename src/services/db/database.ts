import { type SQLiteDatabase } from 'expo-sqlite';

export async function initDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      notes TEXT,
      schedule_type TEXT, -- daily, weekly, monthly, custom
      notification_preference TEXT,
      time TEXT, -- store ISO time string
      status TEXT DEFAULT 'ACTIVE'
    );


    CREATE TABLE IF NOT EXISTS recurrence_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
      frequency TEXT, -- daily, weekly, monthly
      interval INTEGER,
      day_of_week TEXT,
      day_of_month INTEGER
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
      notification_id TEXT UNIQUE,
      scheduled_time INTEGER, -- stores timestamp
      status TEXT -- PENDING, COMPLETED, CANCELLED
    );
  `);

  // Safe migration for existing DB. Ignored if columns already exist.
  try {
    await db.execAsync('ALTER TABLE activities ADD COLUMN time TEXT;');
  } catch (error) {
    // Ignore duplicate column error
  }

  try {
    await db.execAsync('ALTER TABLE labels ADD COLUMN icon TEXT;');
  } catch (error) {
    // Ignore duplicate column error
  }

  try {
    await db.execAsync("ALTER TABLE activities ADD COLUMN status TEXT DEFAULT 'ACTIVE';");
  } catch (error) {
    // Ignore duplicate column error
  }
}
