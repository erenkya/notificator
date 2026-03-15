import { Colors, Spacing, Typography } from '@/constants/Design';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const db = useSQLiteContext();
  const router = useRouter();
  const t = useTranslations();

  const { activities, addActivity, updateActivity, deleteActivity } = useActivityStore();
  const { labels, fetchLabels } = useLabelStore();

  const [title, setTitle] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null);
  
  const [isScheduled, setIsScheduled] = useState(true); // Default matching UI
  const [notifPref, setNotifPref] = useState<string>('15m');
  const [notifEnabled, setNotifEnabled] = useState(true);
  
  const [date, setDate] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchLabels(db);
    requestNotificationPermissions();

    if (!isNew) {
      const existing = activities.find((a) => a.id.toString() === id);
      if (existing) {
        setTitle(existing.title);
        setSelectedLabel(existing.label_id);
        
        if (existing.time) {
          setDate(new Date(existing.time));
          setIsScheduled(true);
        } else {
          setIsScheduled(false);
        }
        
        if (existing.notification_preference) {
          setNotifEnabled(true);
          setNotifPref(existing.notification_preference);
        } else {
          setNotifEnabled(false);
        }
      }
    } else if (labels.length > 0) {
      setSelectedLabel(labels[0].id);
    }
  }, [id, activities, labels]);

  const handleSave = async () => {
    if (!title.trim() || !selectedLabel) {
      Alert.alert(t.missingInfo || 'Missing Info', t.titleAndLabelRequired || 'A title and label are required.');
      return;
    }

    const payload = {
      label_id: selectedLabel,
      title: title.trim(),
      notes: null,
      schedule_type: isScheduled ? 'daily' : null,
      notification_preference: (isScheduled && notifEnabled) ? notifPref : null,
      time: isScheduled ? date.toISOString() : null,
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
      if (payload.schedule_type && payload.notification_preference) {
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
      // Very simple cycle for Android without adding extra modal UI
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

  const currentLabelText = labels.find(l => l.id === selectedLabel)?.name || t.categoryLabel || 'Category Label';
  
  const displayNotifPref = () => {
    switch (notifPref) {
      case 'at-time': return 'At time of event';
      case '5m': return '5 minutes before';
      case '15m': return '15 minutes before';
      case '1h': return '1 hour before';
      case '1d': return '1 day before';
      default: return notifPref;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header removed as per UX update. Modal can be dragged down. */}
      {/* Title moved to content area */}

      <ScrollView style={styles.contentWrap} contentContainerStyle={styles.content}>
        
        {/* Large Header Title */}
        <Text style={styles.pageTitle}>
          {isNew ? (t.newActivity || 'New Activity') : (t.editActivity || 'Edit Activity')}
        </Text>
        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.activityTitle || 'Activity Title'}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.inputLarge}
              value={title}
              onChangeText={setTitle}
              placeholder={t.activityTitlePlaceholder || 'What needs to be done?'}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
        
        {/* Label Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.categoryLabel || 'Category Label'}</Text>
          <TouchableOpacity style={styles.selectBox} onPress={handleLabelSelect} activeOpacity={0.7}>
            <View style={styles.selectBoxLeft}>
              <MaterialIcons name="work" size={20} color="#8B5CF6" />
              <Text style={styles.selectBoxText}>{currentLabelText}</Text>
            </View>
            <MaterialIcons name="unfold-more" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Schedule */}
        <View style={styles.scheduleRow}>
          <Text style={styles.sectionLabel}>{t.schedule || 'Schedule'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Automatic detection</Text>
          </View>
        </View>

        <View style={styles.dateTimeGrid}>
          <View style={styles.dateTimeCol}>
            <Text style={styles.dateTimeLabel}>Date</Text>
            <TouchableOpacity style={styles.dateTimeBtn} activeOpacity={0.7}>
              <Text style={styles.dateTimeBtnText}>
                {date.toLocaleDateString()}
              </Text>
              <MaterialIcons name="calendar-today" size={18} color="#94A3B8" style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          </View>
          <View style={styles.dateTimeCol}>
            <Text style={styles.dateTimeLabel}>Time</Text>
            <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
              <Text style={styles.dateTimeBtnText}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <MaterialIcons name="access-time" size={18} color="#94A3B8" style={{marginLeft: 'auto'}} />
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
          />
        )}

        {/* Native Inline Date Picker replacing HTML calendar */}
        <View style={styles.calendarWrap}>
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={(event, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
            themeVariant="light"
            accentColor={Colors.primary}
          />
        </View>

        {/* Notification Alert */}
        <View style={styles.notifSection}>
          <View style={styles.notifHeaderRow}>
            <View>
              <Text style={styles.notifTitle}>{t.remindMe || 'Notification Alert'}</Text>
              <Text style={styles.notifSubtitle}>Notify me before the activity starts</Text>
            </View>
            <Switch 
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              trackColor={{ false: '#E2E8F0', true: Colors.primary }}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
          
          {notifEnabled && (
            <TouchableOpacity style={styles.selectBox} onPress={handleNotifSelect} activeOpacity={0.7}>
              <Text style={styles.selectBoxText}>{displayNotifPref()}</Text>
              <MaterialIcons name="expand-more" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons at the Bottom */}
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

      {/* Footer */}
      <View style={styles.footer}>
        <MaterialIcons name="lock" size={14} color="#94A3B8" />
        <Text style={styles.footerText}>End-to-end encrypted notification service</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8', // background-light
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B', // slate-500
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrap: {
    backgroundColor: '#F1F5F9', // slate-100
    borderRadius: 12,
  },
  inputLarge: {
    minHeight: 56,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#0F172A',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9', // slate-100
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
    fontSize: 16,
    color: '#0F172A',
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
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginLeft: 4,
  },
  dateTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateTimeBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  calendarWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 32,
    marginTop: 8,
  },
  notifSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  notifSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F43F5E',
  },
});
