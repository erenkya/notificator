import { Colors, Spacing, Typography } from '@/constants/Design';
import { useTranslations } from '@/src/utils/i18n';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useActivityStore } from '@/src/features/activities/store';
import { useLabelStore } from '@/src/features/labels/store';
import { cancelActivityNotification } from '@/src/features/scheduling/scheduler';

import { ActivityCard } from '@/components/ActivityCard';

export default function Dashboard() {
  const t = useTranslations();
  const db = useSQLiteContext();
  const router = useRouter();

  const { activities, fetchActivities, deleteActivity, isLoading: activitiesLoading } = useActivityStore();
  const { labels, fetchLabels, isLoading: labelsLoading } = useLabelStore();

  useEffect(() => {
    fetchLabels(db);
    fetchActivities(db);
  }, []);

  const getLabelForActivity = (labelId: number) => {
    return labels.find((l) => l.id === labelId);
  };

  const handleDeleteActivity = (activityId: number, activityTitle: string) => {
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
  };

  const isLoading = activitiesLoading || labelsLoading;

  // Hierarchical view: Sections are Labels
  const getGroupedActivities = () => {
    const sections: { title: string; color: string; data: typeof activities }[] = [];
    
    // Group by existing labels
    labels.forEach(label => {
      const labelActivities = activities.filter(a => a.label_id === label.id);
      if (labelActivities.length > 0) {
        sections.push({
          title: label.name,
          color: label.color || Colors.primary,
          data: labelActivities,
        });
      }
    });

    return sections;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerIconButton} 
            onPress={() => router.push('/labels/new')}
          >
            <Ionicons name="pricetag-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAddButton} 
            onPress={() => {
              if (labels.length === 0) {
                Alert.alert(t.noLabelsTitle || 'No Labels', t.createLabelFirstPrompt || 'Please create a label first before adding an activity.');
                router.push('/labels/new');
              } else {
                router.push('/new/schedule');
              }
            }}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : labels.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[Typography.secondary, { marginBottom: Spacing.md }]}>
            {t.noLabelsExist || 'No labels exist yet.'}
          </Text>
          <TouchableOpacity 
            style={styles.createLabelBtn} 
            onPress={() => router.push('/labels/new')}
          >
            <Text style={styles.createLabelText}>{t.createLabel || 'Create Label'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={getGroupedActivities()}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section: { title, color } }) => (
            <View style={styles.sectionHeaderWrap}>
               <View style={[styles.sectionBullet, { backgroundColor: color }]} />
               <Text style={styles.sectionHeader}>{title}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => {
            const isLastNode = index === section.data.length - 1;
            return (
              <ActivityCard
                activity={item}
                label={getLabelForActivity(item.label_id)}
                isLastNode={isLastNode}
                onPress={() => router.push(`/${item.id}/schedule`)}
                onDelete={() => handleDeleteActivity(item.id, item.title)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={Typography.secondary}>{t.noActivitiesFirst || 'No activities yet. Create your first one!'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60, // approximate SafeArea top
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerSpacer: {
    width: 40,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  list: {
    padding: 16,
    paddingBottom: 100, // For FAB
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
    marginTop: 24,
  },
  sectionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createLabelBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
});
