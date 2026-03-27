import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

interface SettingsState {
  language: string;
  timezone: string;
  country: string;
  themeMode: 'system' | 'light' | 'dark';
  hasCompletedOnboarding: boolean;
  setLanguage: (lang: string) => Promise<void>;
  setTimezoneAndCountry: (tz: string, country: string) => Promise<void>;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'en',
  timezone: getLocales()[0]?.regionCode || 'US', // default
  country: getLocales()[0]?.regionCode || 'US',
  themeMode: 'system',
  hasCompletedOnboarding: false,
  
  setLanguage: async (lang: string) => {
    await AsyncStorage.setItem('app_language', lang);
    set({ language: lang });
  },

  setTimezoneAndCountry: async (tz: string, country: string) => {
    await AsyncStorage.setItem('app_timezone', tz);
    await AsyncStorage.setItem('app_country', country);
    set({ timezone: tz, country: country });
  },

  setThemeMode: async (mode: 'system' | 'light' | 'dark') => {
    await AsyncStorage.setItem('app_theme_mode', mode);
    set({ themeMode: mode });
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem('app_onboarding_completed', 'true');
    set({ hasCompletedOnboarding: true });
  },

  loadSettings: async () => {
    const savedLang = await AsyncStorage.getItem('app_language');
    const savedTz = await AsyncStorage.getItem('app_timezone');
    const savedCountry = await AsyncStorage.getItem('app_country');
    const savedThemeMode = (await AsyncStorage.getItem('app_theme_mode')) as 'system' | 'light' | 'dark' | null;
    const hasCompleted = await AsyncStorage.getItem('app_onboarding_completed');

    const deviceLang = getLocales()[0]?.languageCode ?? 'en';
    const deviceRegion = getLocales()[0]?.regionCode ?? 'US';

    set({ 
      language: savedLang || deviceLang,
      timezone: savedTz || Intl.DateTimeFormat().resolvedOptions().timeZone,
      country: savedCountry || deviceRegion,
      themeMode: savedThemeMode || 'system',
      hasCompletedOnboarding: hasCompleted === 'true'
    });
  },
}));
