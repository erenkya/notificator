import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

interface SettingsState {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'en',
  setLanguage: async (lang: string) => {
    await AsyncStorage.setItem('app_language', lang);
    set({ language: lang });
  },
  loadSettings: async () => {
    const savedLang = await AsyncStorage.getItem('app_language');
    if (savedLang) {
      set({ language: savedLang });
    } else {
      const deviceLang = getLocales()[0]?.languageCode ?? 'en';
      set({ language: deviceLang });
    }
  },
}));
