import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/Design';
import { useSettingsStore } from '@/src/features/settings/store';
import { MaterialIcons } from '@expo/vector-icons';
import { getLocales } from 'expo-localization';
import { useTranslations } from '@/src/utils/i18n';

export default function OnboardingScreen() {
  const router = useRouter();
  const t = useTranslations();
  const { timezone, country, setTimezoneAndCountry, completeOnboarding } = useSettingsStore();

  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Auto-detect defaults on mount
    const deviceRegion = getLocales()[0]?.regionCode || 'US';
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
    setSelectedCountry(deviceRegion);
    setSelectedTimezone(deviceTimezone);
  }, []);

  const handleFinish = async () => {
    await setTimezoneAndCountry(selectedTimezone, selectedCountry);
    await completeOnboarding();
    // Redirect to main tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim }}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="public" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{t.onboardingTitle || 'Welcome to Notificator'}</Text>
          <Text style={styles.subtitle}>{t.onboardingSubtitle || "Let's set up your time preferences for precise scheduling."}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.yourCountry || 'Your Country Code'}</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="flag" size={24} color="#64748B" />
            <Text style={styles.inputText}>{selectedCountry}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t.yourTimezone || 'Your Timezone'}</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="access-time" size={24} color="#64748B" />
            <Text style={styles.inputText}>{selectedTimezone}</Text>
          </View>
        </View>

        <Text style={styles.description}>
          {t.onboardingDescription || 'These will be used to ensure your recurring tasks and notifications are perfectly synchronized to your local time.'}
        </Text>
      </Animated.ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleFinish} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{t.getStarted || 'Get Started'}</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
