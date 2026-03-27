import { useColorScheme } from 'react-native';

export const lightColors = {
  primary: '#6366F1',
  background: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  accent: '#22C55E',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

export const darkColors = {
  primary: '#818CF8', 
  background: '#0F172A',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#4ADE80',
  border: '#1E293B',
  white: '#1E293B',
};

export const Colors = lightColors;

import { useSettingsStore } from '@/src/features/settings/store';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore(s => s.themeMode);
  
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  return isDark ? darkColors : lightColors;
}

export const Spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

export function useTypography() {
  const colors = useAppTheme();
  return {
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.textPrimary,
    },
    header: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    body: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    secondary: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  };
}
