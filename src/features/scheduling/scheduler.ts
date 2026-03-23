import * as Notifications from 'expo-notifications';
import { type SQLiteDatabase } from 'expo-sqlite';
import { addMinutes, addDays, addWeeks, addMonths, setHours, setMinutes, isBefore } from 'date-fns';
import { Activity } from '../activities/store';

/**
 * Calculates the exact trigger Date for an activity based on its schedule and preference.
 */
export function calculateNextTriggerTime(activity: Activity): Date | null {
  if (!activity.schedule_type) return null;

  const now = new Date();
  
  let targetDate = setMinutes(setHours(now, 9), 0);
  if (activity.time) {
    const timeRef = new Date(activity.time);
    targetDate = setMinutes(setHours(now, timeRef.getHours()), timeRef.getMinutes());
  }

  if (activity.schedule_type === 'daily') {
    targetDate = addDays(targetDate, 1);
  } else if (activity.schedule_type === 'weekly') {
    targetDate = addWeeks(targetDate, 1);
  } else if (activity.schedule_type === 'monthly') {
    targetDate = addMonths(targetDate, 1);
  }

  // Handle notification offset
  let offsetMinutes = 0;
  if (activity.notification_preference === '10m') offsetMinutes = 10;
  if (activity.notification_preference === '15m') offsetMinutes = 15;
  if (activity.notification_preference === '30m') offsetMinutes = 30;
  if (activity.notification_preference === '1h') offsetMinutes = 60;
  if (activity.notification_preference === '1d') offsetMinutes = 1440;

  // Subtract offset to get exact alarm trigger time
  const triggerDate = new Date(targetDate.getTime() - offsetMinutes * 60000);

  // If the calculated trigger is somehow in the past and NOT repeating, push it forward 1 day so it doesn't fail immediately
  if (isBefore(triggerDate, now) && !activity.schedule_type) {
    return addDays(triggerDate, 1);
  }

  return triggerDate;
}

/**
 * Schedules a local notification via Expo and saves the tracking info to SQLite.
 */
export async function scheduleActivityNotification(
  db: SQLiteDatabase,
  activity: Activity
): Promise<void> {
  try {
    const triggerDate = calculateNextTriggerTime(activity);
    
    if (!triggerDate) return;

    let trigger: Notifications.NotificationTriggerInput;

    if (activity.schedule_type === 'daily') {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      };
    } else if (activity.schedule_type === 'weekly') {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: triggerDate.getDay() + 1, // 1 is Sunday, 7 is Saturday in Expo
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      };
    } else if (activity.schedule_type === 'monthly') {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        day: triggerDate.getDate(),
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      };
    } else {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      };
    }

    // 1. Fetch Label name
    let labelName = 'Notificator';
    try {
      const labelData = await db.getFirstAsync<{ name: string }>(
        'SELECT name FROM labels WHERE id = ?',
        [activity.label_id]
      );
      if (labelData?.name) {
        labelName = labelData.name;
      }
    } catch (e) {
      console.warn('Failed to fetch label name for notification', e);
    }

    // 2. Schedule with Expo Notifications
    const bodyContent = activity.notes ? `${activity.title}\n${activity.notes}` : activity.title;

    const scheduledNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: labelName,
        body: bodyContent,
        sound: true,
      },
      trigger,
    });

    // 2. Persist tracking in SQLite
    const scheduledTimeInt = triggerDate.getTime();
    
    // Attempt to clear previous notification for this activity in the DB just in case
    await cancelActivityNotification(db, activity.id);

    await db.runAsync(
      'INSERT INTO notifications (activity_id, notification_id, scheduled_time, status) VALUES (?, ?, ?, ?)',
      [activity.id, scheduledNotificationId, scheduledTimeInt, 'PENDING']
    );

    console.log(`Scheduled notification ${scheduledNotificationId} for ${triggerDate.toString()}`);
  } catch (err) {
    console.error('Error scheduling notification', err);
  }
}

/**
 * Cancels an Expo notification by ID and cleans up the SQLite table.
 */
export async function cancelActivityNotification(
  db: SQLiteDatabase,
  activityId: number
): Promise<void> {
  try {
    // 1. Get the current active notification ID for this activity
    const record = await db.getFirstAsync<{ notification_id: string }>(
      'SELECT notification_id FROM notifications WHERE activity_id = ? AND status = ?',
      [activityId, 'PENDING']
    );

    if (record?.notification_id) {
      // 2. Cancel in Expo
      await Notifications.cancelScheduledNotificationAsync(record.notification_id);

      // 3. Mark cancelled in SQLite
      await db.runAsync(
        'UPDATE notifications SET status = ? WHERE notification_id = ?',
        ['CANCELLED', record.notification_id]
      );
      console.log(`Cancelled notification ${record.notification_id}`);
    }
  } catch (err) {
    console.error('Error cancelling notification', err);
  }
}
