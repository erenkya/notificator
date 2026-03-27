import { useSettingsStore } from '../features/settings/store';
import { useTranslations } from './i18n';

/**
 * Format an ISO time string into a short, readable date & time.
 * e.g. "Mar 23, 3:30 PM" or translated equivalents
 */
export function formatDateTime(isoString: string | null | undefined, locale: string = 'en'): string | null {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    const now = new Date();

    const timeStr = date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
    const monthDay = date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });

    if (date.getFullYear() !== now.getFullYear()) {
      return `${monthDay} ${date.getFullYear()} - ${timeStr}`;
    }

    return `${monthDay} - ${timeStr}`;
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
