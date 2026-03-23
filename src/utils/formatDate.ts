import { useSettingsStore } from '../features/settings/store';
import { useTranslations } from './i18n';

/**
 * Format an ISO time string into a short, readable date & time.
 * e.g. "Mar 23, 3:30 PM" or translated equivalents
 */
export function formatDateTime(isoString: string | null | undefined): string | null {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) return `${timeStr}`;
    if (isTomorrow) return `${timeStr}`;

    const monthDay = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    if (date.getFullYear() !== now.getFullYear()) {
      return `${monthDay} ${date.getFullYear()}, ${timeStr}`;
    }

    return `${monthDay}, ${timeStr}`;
  } catch {
    return null;
  }
}

/**
 * Format schedule type into a readable string.
 */
export function formatSchedule(type: string | null | undefined): string | null {
  if (!type || type === 'never') return null;
  const map: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    custom: 'Custom',
  };
  return map[type] || type;
}
