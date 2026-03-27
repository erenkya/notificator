import { Spacing, useAppTheme, useTypography } from '@/constants/Design';
import { useTranslations } from '@/src/utils/i18n';
import { isToday, isTomorrow } from 'date-fns';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Activity, useActivityStore } from '@/src/features/activities/store';
import { useLabelStore } from '@/src/features/labels/store';
import { calculateNextTriggerTime, cancelActivityNotification } from '@/src/features/scheduling/scheduler';

import { ActivityCard } from '@/components/ActivityCard';
import { useRouter } from 'expo-router';

interface Section {
  title: string;
  data: Activity[];
}

export default function CalendarScreen() {
  const Colors = useAppTheme();
  const Typography = useTypography();
  const styles = useStyles(Colors, Typography);
  const t = useTranslations();
  const db = useSQLiteContext();
  const router = useRouter();

  const { activities, fetchActivities, completeActivity, deleteActivity } = useActivityStore();
  const { labels, fetchLabels } = useLabelStore();

  useEffect(() => {
    fetchLabels(db);
    fetchActivities(db);
  }, []);

  const getLabelForActivity = (labelId: number) => {
    return labels.find((l) => l.id === labelId);
  };

  const handleCompleteActivity = async (activityId: number) => {
    await cancelActivityNotification(db, activityId);
    await completeActivity(db, activityId);
  };

  const handleDeleteActivity = (activityId: number, activityTitle: string) => {
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        t.deleteActivity || 'Delete Activity',
        t.deleteActivityConfirm || `Are you sure you want to delete "${activityTitle}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await cancelActivityNotification(db, activityId);
              await deleteActivity(db, activityId);
            },
          },
        ]
      );
    });
  };

  // Process activities to group them by calculated timeline target
  const getGroupedActivities = (): Section[] => {
    const today: { act: Activity, trigger: Date }[] = [];
    const tomorrow: { act: Activity, trigger: Date }[] = [];
    const upcoming: { act: Activity, trigger: Date }[] = [];
    const unscheduled: Activity[] = [];

    activities.forEach(act => {
      const trigger = calculateNextTriggerTime(act);
      if (!trigger) {
        unscheduled.push(act);
      } else if (isToday(trigger)) {
        today.push({ act, trigger });
      } else if (isTomorrow(trigger)) {
        tomorrow.push({ act, trigger });
      } else {
        upcoming.push({ act, trigger });
      }
    });

    today.sort((a, b) => a.trigger.getTime() - b.trigger.getTime());
    tomorrow.sort((a, b) => a.trigger.getTime() - b.trigger.getTime());
    upcoming.sort((a, b) => a.trigger.getTime() - b.trigger.getTime());

    const sections: Section[] = [];
    if (today.length) sections.push({ title: t.today || 'Today', data: today.map(x => x.act) });
    if (tomorrow.length) sections.push({ title: t.tomorrow || 'Tomorrow', data: tomorrow.map(x => x.act) });
    if (upcoming.length) sections.push({ title: t.upcoming || 'Upcoming', data: upcoming.map(x => x.act) });
    if (unscheduled.length) sections.push({ title: t.unscheduled || 'Unscheduled', data: unscheduled });

    return sections;
  };

  return (
    <View style={styles.container}>

      <SectionList
        sections={getGroupedActivities()}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            label={getLabelForActivity(item.label_id)}
            onPress={() => router.push(`/${item.id}/schedule`)}
            onDelete={() => handleDeleteActivity(item.id, item.title)}
            onComplete={() => handleCompleteActivity(item.id)}
          />
        )}
        ListEmptyComponent={
           <View style={styles.centered}>
             <Text style={Typography.secondary}>{t.emptyCalendar || 'Your calendar is wonderfully empty.'}</Text>
           </View>
        }
      />
    </View>
  );
}

const useStyles = (Colors: any, Typography: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.xl + 20,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sectionHeader: {
    ...Typography.header,
    color: Colors.textSecondary,
    fontSize: 14,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },
});
