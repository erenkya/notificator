import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Redirect } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../src/features/settings/store';
import { initDatabase } from '../src/services/db/database';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loadSettings, hasCompletedOnboarding } = useSettingsStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadSettings();
      setIsReady(true);
    })();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="notificator.db" onInit={initDatabase}>
        {!hasCompletedOnboarding && <Redirect href="/onboarding" />}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="[id]/schedule" options={{ presentation: 'modal' }} />
          <Stack.Screen name="labels/index" options={{ presentation: 'modal' }} />
          <Stack.Screen name="labels/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
