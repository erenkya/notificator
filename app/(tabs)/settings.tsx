import { Spacing, useAppTheme, useTypography } from '@/constants/Design';
import { useSettingsStore } from '@/src/features/settings/store';
import { useTranslations } from '@/src/utils/i18n';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View, SafeAreaView, Switch } from 'react-native';

import { SearchablePicker } from '@/components/SearchablePicker';
import { COUNTRIES, getTimezones } from '@/src/data/localeData';
import { useMemo } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Turkish (Türkçe)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'it', label: 'Italian (Italiano)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
];

export default function SettingsScreen() {
  const Colors = useAppTheme();
  const Typography = useTypography();
  const styles = useStyles(Colors, Typography);
  
  const { language, setLanguage, country, timezone, setTimezoneAndCountry, themeMode, setThemeMode } = useSettingsStore();
  const t = useTranslations();

  const timezones = useMemo(() => getTimezones(), []);

  const handleLanguageChange = async (code: string) => {
    await setLanguage(code);
  };

  const handleCountryChange = async (code: string) => {
    await setTimezoneAndCountry(timezone, code);
  };

  const handleTimezoneChange = async (code: string) => {
    await setTimezoneAndCountry(code, country);
  };

  const handleThemeToggle = async (isDark: boolean) => {
    await setThemeMode(isDark ? 'dark' : 'light');
  };

  const isDarkEnabled = themeMode === 'dark';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
        {/* Dark Mode Toggle */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t.appearance || 'Appearance'}</Text>
          <View style={styles.switchRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="moon-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.switchText}>{t.darkMode || 'Dark Mode'}</Text>
            </View>
            <Switch
              value={isDarkEnabled}
              onValueChange={handleThemeToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t.selectAppLanguage || 'App Language'}</Text>
          <SearchablePicker
            items={LANGUAGES}
            selectedValue={language}
            onSelect={handleLanguageChange}
            placeholder={t.selectLanguage || 'Select language...'}
            searchPlaceholder={t.searchLanguages || 'Search languages...'}
          />
        </View>

        {/* Country */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t.country || 'Country'}</Text>
          <SearchablePicker
            items={COUNTRIES}
            selectedValue={country}
            onSelect={handleCountryChange}
            placeholder={t.selectCountry || 'Select country...'}
            searchPlaceholder={t.searchCountries || 'Search countries...'}
          />
        </View>

        {/* Timezone */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t.timezone || 'Timezone'}</Text>
          <SearchablePicker
            items={timezones}
            selectedValue={timezone}
            onSelect={handleTimezoneChange}
            placeholder={t.selectTimezone || 'Select timezone...'}
            searchPlaceholder={t.searchTimezones || 'Search timezones...'}
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            {t.infoLanguageChange || 'Changing the language will update all labels, notifications, and menus within the Notificator app. Some regional date formats may also adjust.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = (Colors: any, Typography: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionLabel: {
    ...Typography.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchText: {
    ...Typography.body,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    ...Typography.secondary,
    lineHeight: 18,
  },
});
