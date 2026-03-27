import { Spacing, useAppTheme, useTypography } from '@/constants/Design';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Switch, Platform, ActionSheetIOS } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { useActivityStore } from '@/src/features/activities/store';
import { useLabelStore, Label } from '@/src/features/labels/store';
import { requestNotificationPermissions } from '@/src/features/notifications/service';
import { cancelActivityNotification, scheduleActivityNotification } from '@/src/features/scheduling/scheduler';
import { useTranslations } from '@/src/utils/i18n';

export default function ScheduleScreen() {
  const Colors = useAppTheme();
  const Typography = useTypography();
  const styles = useStyles(Colors, Typography);

  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const db = useSQLiteContext();
  const router = useRouter();
  const t = useTranslations();

  const { activities, addActivity, updateActivity, deleteActivity } = useActivityStore();
  const { labels, fetchLabels } = useLabelStore();

  const [title, setTitle] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);
  
  const [repeat, setRepeat] = useState<string>('never');
  const [notifPref, setNotifPref] = useState<string>('15m');
  const [notifEnabled, setNotifEnabled] = useState(true);
  
  const [date, setDate] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const hasInitialized = React.useRef(false);

  useEffect(() => {
    fetchLabels(db);
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!isNew && activities.length > 0 && !hasInitialized.current) {
      const existing = activities.find((a) => a.id.toString() === id);
      if (existing) {
        hasInitialized.current = true;
        setTitle(existing.title);
        setSelectedLabel(existing.label_id);
        
        if (existing.time) {
          setDate(new Date(existing.time));
        }
        
        if (existing.schedule_type) {
          setRepeat(existing.schedule_type);
        } else {
          setRepeat('never');
        }
        
        if (existing.notification_preference) {
          setNotifEnabled(true);
          setNotifPref(existing.notification_preference);
        } else {
          setNotifEnabled(false);
        }
      }
    }
  }, [id, activities]);

  useEffect(() => {
    if (isNew && labels.length > 0 && selectedLabel === null) {
      setSelectedLabel(labels[0].id);
    }
  }, [labels]);

  const handleSave = async () => {
    if (!title.trim() || !selectedLabel) {
      Alert.alert(t.missingInfo || 'Missing Info', t.titleAndLabelRequired || 'A title and label are required.');
      return;
    }

    const payload = {
      label_id: selectedLabel,
      title: title.trim(),
      notes: null,
      schedule_type: repeat === 'never' ? null : repeat,
      notification_preference: notifEnabled ? notifPref : null,
      time: date.toISOString(),
    };

    let savedActivityId: number | undefined;

    if (isNew) {
      savedActivityId = await addActivity(db, payload);
    } else {
      await updateActivity(db, Number(id), payload);
      savedActivityId = Number(id);
    }

    if (savedActivityId) {
      const activityToSchedule = { id: savedActivityId, ...payload };
      if (payload.notification_preference) {
        await scheduleActivityNotification(db, activityToSchedule as any);
      } else {
        await cancelActivityNotification(db, savedActivityId);
      }
    }

    router.back();
  };

  const handleDelete = async () => {
    if (!isNew) {
      await cancelActivityNotification(db, Number(id));
      await deleteActivity(db, Number(id));
      router.back();
    }
  };

  const handleLabelSelect = () => {
    if (labels.length === 0) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...labels.map(l => l.name)],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setSelectedLabel(labels[buttonIndex - 1].id);
          }
        }
      );
    } else {
      const currentIndex = labels.findIndex(l => l.id === selectedLabel);
      const nextIndex = (currentIndex + 1) % labels.length;
      setSelectedLabel(labels[nextIndex].id);
    }
  };

  const handleNotifSelect = () => {
    const options = ['at-time', '5m', '15m', '1h', '1d'];
    const displayOptions = ['At time of event', '5 minutes before', '15 minutes before', '1 hour before', '1 day before'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...displayOptions],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setNotifPref(options[buttonIndex - 1]);
          }
        }
      );
    } else {
      const currentIndex = options.indexOf(notifPref);
      const nextIndex = (currentIndex + 1) % options.length;
      setNotifPref(options[nextIndex]);
    }
  };

  const currentLabel = labels.find(l => l.id === selectedLabel);
  const currentLabelText = currentLabel?.name || t.categoryLabel || 'Category Label';
  const currentLabelIcon = (currentLabel?.icon || 'briefcase') as keyof typeof Ionicons.glyphMap;
  const currentLabelColor = currentLabel?.color || Colors.primary;
  
  const displayNotifPref = () => {
    switch (notifPref) {
      case 'at-time': return t.atTimeOfEvent || 'At time of event';
      case '5m': return t.minutesBefore5 || '5 minutes before';
      case '15m': return t.minutesBefore15 || '15 minutes before';
      case '1h': return t.hourBefore1 || '1 hour before';
      case '1d': return t.dayBefore1 || '1 day before';
      default: return notifPref;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentWrap} contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.activityTitle || 'Activity Title'}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.inputLarge}
              value={title}
              onChangeText={setTitle}
              placeholder={t.activityTitlePlaceholder || 'What needs to be done?'}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.categoryLabel || 'Category Label'}</Text>
          <TouchableOpacity style={styles.selectBox} onPress={handleLabelSelect} activeOpacity={0.7}>
            <View style={styles.selectBoxLeft}>
              <Ionicons name={currentLabelIcon} size={20} color={currentLabelColor} />
              <Text style={styles.selectBoxText}>{currentLabelText}</Text>
            </View>
            <MaterialIcons name="unfold-more" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleRow}>
          <Text style={styles.sectionLabel}>{t.schedule || 'Schedule'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t.automaticDetection || 'Automatic detection'}</Text>
          </View>
        </View>

        <View style={styles.dateTimeGrid}>
          <View style={styles.dateTimeCol}>
            <Text style={styles.dateTimeLabel}>{t.date || 'Date'}</Text>
            <TouchableOpacity style={styles.dateTimeBtn} activeOpacity={0.7}>
              <View style={{ width: 18 }} />
              <Text style={styles.dateTimeBtnText}>
                {date.toLocaleDateString()}
              </Text>
              <MaterialIcons name="calendar-today" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.dateTimeCol}>
            <Text style={styles.dateTimeLabel}>{t.time || 'Time'}</Text>
            <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
              <View style={{ width: 18 }} />
              <Text style={styles.dateTimeBtnText}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <MaterialIcons name="access-time" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
            themeVariant={Colors.background === '#0F172A' ? 'dark' : 'light'}
          />
        )}

        <View style={styles.calendarWrap}>
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={(event, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
            themeVariant={Colors.background === '#0F172A' ? 'dark' : 'light'}
            accentColor={Colors.primary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.repeat || 'Repeat'}</Text>
          <View style={styles.repeatRow}>
            {['never', 'daily', 'weekdays', 'weekends', 'weekly', 'monthly'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.repeatBtn, repeat === option && styles.repeatBtnActive]}
                onPress={() => setRepeat(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.repeatBtnText, repeat === option && styles.repeatBtnTextActive]}>
                  {t[option] ? t[option] : option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.notifSection}>
          <View style={styles.notifHeaderRow}>
            <View>
              <Text style={styles.notifTitle}>{t.remindMe || 'Notification Alert'}</Text>
              <Text style={styles.notifSubtitle}>{t.notifyMeBefore || 'Notify me before the activity starts'}</Text>
            </View>
            <Switch 
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              ios_backgroundColor={Colors.border}
            />
          </View>
          
          {notifEnabled && (
            <TouchableOpacity style={styles.selectBox} onPress={handleNotifSelect} activeOpacity={0.7}>
              <Text style={styles.selectBoxText}>{displayNotifPref()}</Text>
              <MaterialIcons name="expand-more" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primarySaveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.primarySaveBtnText}>{t.save || 'Save'}</Text>
          </TouchableOpacity>

          {!isNew && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#F43F5E" />
              <Text style={styles.deleteBtnText}>{t.deleteActivity || 'Delete Activity'}</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <MaterialIcons name="lock" size={14} color={Colors.textSecondary} />
        <Text style={styles.footerText}>{t.endToEndEncrypted || 'End-to-end encrypted notification service'}</Text>
      </View>
    </View>
  );
}

const useStyles = (Colors: any, Typography: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pageTitle: {
    ...Typography.title,
    marginBottom: 32,
    marginTop: 16,
  },
  contentWrap: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    ...Typography.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrap: {
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  inputLarge: {
    minHeight: 56,
    paddingHorizontal: 16,
    ...Typography.body,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  selectBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectBoxText: {
    ...Typography.body,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  dateTimeGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dateTimeCol: {
    flex: 1,
    gap: 8,
  },
  dateTimeLabel: {
    ...Typography.secondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateTimeBtnText: {
    flex: 1,
    textAlign: 'center',
    ...Typography.body,
    fontWeight: '500',
  },
  calendarWrap: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 32,
    marginTop: 8,
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '30%',
  },
  repeatBtnActive: {
    backgroundColor: Colors.primary,
  },
  repeatBtnText: {
    ...Typography.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  repeatBtnTextActive: {
    color: '#ffffff',
  },
  notifSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notifTitle: {
    ...Typography.body,
    fontWeight: '600',
  },
  notifSubtitle: {
    ...Typography.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    ...Typography.secondary,
    fontSize: 12,
  },
  bottomActions: {
    marginTop: 40,
    gap: 16,
  },
  primarySaveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primarySaveBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#FEF2F2',
  },
  deleteBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#F43F5E',
    textAlign: 'center',
  },
});
