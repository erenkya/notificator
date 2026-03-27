import { Spacing, useAppTheme, useTypography } from '@/constants/Design';
import { useTranslations } from '@/src/utils/i18n';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Alert } from 'react-native';

import { useActivityStore } from '@/src/features/activities/store';
import { scheduleActivityNotification } from '@/src/features/scheduling/scheduler';
import { useLabelStore } from '@/src/features/labels/store';

import { ActivityCard } from '@/components/ActivityCard';

export default function HistoryScreen() {
  const Colors = useAppTheme();
  const Typography = useTypography();
  const styles = useStyles(Colors, Typography);
  const t = useTranslations();
  const db = useSQLiteContext();

  const { historyActivities, fetchHistoryActivities, deleteActivity, revertActivity } = useActivityStore();
  const { labels, fetchLabels } = useLabelStore();

  useEffect(() => {
    fetchLabels(db);
    fetchHistoryActivities(db);
  }, []);

  const getLabelForActivity = (labelId: number) => {
    return labels.find((l) => l.id === labelId);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      t.deleteActivity || 'Delete Activity', 
      t.deleteActivityConfirm || 'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteActivity(db, id) }
      ]
    );
  };

  const isRevertible = (item: any) => {
    if (!item.time || item.schedule_type) return true;
    return new Date(item.time).getTime() > Date.now();
  };

  const handleRevert = async (item: any) => {
    await revertActivity(db, item.id);
    if (item.notification_preference) {
      await scheduleActivityNotification(db, item);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={Typography.title}>{t.history || 'History'}</Text>
      </View>
      <FlatList
        data={historyActivities}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            label={getLabelForActivity(item.label_id)}
            onDelete={() => handleDelete(item.id)}
            onRevert={isRevertible(item) ? () => handleRevert(item) : undefined}
          />
        )}
        ListEmptyComponent={
           <View style={styles.centered}>
             <Text style={Typography.secondary}>{t.emptyHistory || 'No completed activities yet.'}</Text>
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
  list: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },
});
