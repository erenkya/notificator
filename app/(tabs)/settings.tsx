import { Colors, Spacing, Typography } from '@/constants/Design';
import { useSettingsStore } from '@/src/features/settings/store';
import { useTranslations } from '@/src/utils/i18n';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Turkish (Türkçe)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'it', label: 'Italian (Italiano)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
];

export default function SettingsScreen() {
  const { language, setLanguage } = useSettingsStore();
  const t = useTranslations();
  const router = useRouter();

  const handleLanguageChange = async (code: string) => {
    try {
      await setLanguage(code);
    } catch (err) {
      Alert.alert('Error', 'Failed to change language');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.language || 'Language'}</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>{t.done || 'Done'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Language Selection Block */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>{t.selectAppLanguage || 'Select App Language'}</Text>
          <View style={styles.cardGroup}>
            {LANGUAGES.map((lang, index) => {
              const isSelected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langRow, 
                    index < LANGUAGES.length - 1 && styles.borderBottom
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.langRowLeft}>
                    <View style={[styles.iconWrap, isSelected ? styles.iconWrapActive : styles.iconWrapInactive]}>
                      <MaterialIcons 
                        name="language" 
                        size={20} 
                        color={isSelected ? Colors.primary : '#64748B'} 
                      />
                    </View>
                    <Text style={[styles.langText, isSelected && styles.langTextActive]}>{lang.label}</Text>
                  </View>
                  
                  {isSelected && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} style={{marginTop: 2}} />
          <Text style={styles.infoText}>
            {t.infoLanguageChange || 'Changing the language will update all labels, notifications, and menus within the Notificator app. Some regional date formats may also adjust.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F8', // background-light
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(246, 246, 248, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // hover handled by TouchableOpacity
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  doneBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B', // slate-500
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  langRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', // slate-100
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // primary/10
  },
  iconWrapInactive: {
    backgroundColor: '#F1F5F9', // slate-100
  },
  langText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155', // slate-700
  },
  langTextActive: {
    color: '#0F172A', // slate-900 (slightly darker when active based on HTML)
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.05)', // primary/5
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)', // primary/20
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#475569', // slate-600
  },
});
