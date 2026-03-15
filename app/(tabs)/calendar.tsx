import { Colors, Spacing, Typography } from '@/constants/Design';
import { useTranslations } from '@/src/utils/i18n';
import { isToday, isTomorrow } from 'date-fns';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { Activity, useActivityStore } from '@/src/features/activities/store';
import { useLabelStore } from '@/src/features/labels/store';
import { calculateNextTriggerTime } from '@/src/features/scheduling/scheduler';

import { ActivityCard } from '@/components/ActivityCard';
import { useRouter } from 'expo-router';

interface Section {
  title: string;
  data: Activity[];
}

export default function CalendarScreen() {
  const t = useTranslations();
  const db = useSQLiteContext();
  const router = useRouter();

  const { activities, fetchActivities } = useActivityStore();
  const { labels, fetchLabels } = useLabelStore();

  useEffect(() => {
    fetchLabels(db);
    fetchActivities(db);
  }, []);

  const getLabelForActivity = (labelId: number) => {
    return labels.find((l) => l.id === labelId);
  };

  // Process activities to group them by calculated timeline target
  const getGroupedActivities = (): Section[] => {
    const today: Activity[] = [];
    const tomorrow: Activity[] = [];
    const upcoming: Activity[] = [];
    const unscheduled: Activity[] = [];

    activities.forEach(act => {
      const trigger = calculateNextTriggerTime(act);
      if (!trigger) {
        unscheduled.push(act);
      } else if (isToday(trigger)) {
        today.push(act);
      } else if (isTomorrow(trigger)) {
        tomorrow.push(act);
      } else {
        upcoming.push(act);
      }
    });

    const sections: Section[] = [];
    if (today.length) sections.push({ title: 'Today', data: today });
    if (tomorrow.length) sections.push({ title: 'Tomorrow', data: tomorrow });
    if (upcoming.length) sections.push({ title: 'Upcoming', data: upcoming });
    if (unscheduled.length) sections.push({ title: 'Unscheduled', data: unscheduled });

    return sections;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={Typography.title}>{t.calendar || 'Calendar'}</Text>
        <Text style={Typography.secondary}>Upcoming Reminders</Text>
      </View>

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
          />
        )}
        ListEmptyComponent={
           <View style={styles.centered}>
             <Text style={Typography.secondary}>Your calendar is wonderfully empty.</Text>
           </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.xl + 20,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
