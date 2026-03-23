import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

interface SettingsState {
  language: string;
  timezone: string;
  country: string;
  hasCompletedOnboarding: boolean;
  setLanguage: (lang: string) => Promise<void>;
  setTimezoneAndCountry: (tz: string, country: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'en',
  timezone: getLocales()[0]?.regionCode || 'US', // default
  country: getLocales()[0]?.regionCode || 'US',
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

  completeOnboarding: async () => {
    await AsyncStorage.setItem('app_onboarding_completed', 'true');
    set({ hasCompletedOnboarding: true });
  },

  loadSettings: async () => {
    const savedLang = await AsyncStorage.getItem('app_language');
    const savedTz = await AsyncStorage.getItem('app_timezone');
    const savedCountry = await AsyncStorage.getItem('app_country');
    const hasCompleted = await AsyncStorage.getItem('app_onboarding_completed');

    const deviceLang = getLocales()[0]?.languageCode ?? 'en';
    const deviceRegion = getLocales()[0]?.regionCode ?? 'US';

    set({ 
      language: savedLang || deviceLang,
      timezone: savedTz || Intl.DateTimeFormat().resolvedOptions().timeZone,
      country: savedCountry || deviceRegion,
      hasCompletedOnboarding: hasCompleted === 'true'
    });
  },
}));
