import { Spacing, useAppTheme, useTypography } from '@/constants/Design';
import { useTranslations } from '@/src/utils/i18n';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useActivityStore } from '@/src/features/activities/store';
import { useLabelStore } from '@/src/features/labels/store';
import { cancelActivityNotification } from '@/src/features/scheduling/scheduler';
import { formatDateTime, formatSchedule } from '@/src/utils/formatDate';

type Tab = 'labels' | 'activities';

export default function ManageScreen() {
  const Colors = useAppTheme();
  const Typography = useTypography();
  const styles = useStyles(Colors, Typography);

  const t = useTranslations();
  const db = useSQLiteContext();
  const router = useRouter();

  const { activities, fetchActivities, deleteActivity } = useActivityStore();
  const { labels, fetchLabels, deleteLabel } = useLabelStore();

  const [activeTab, setActiveTab] = useState<Tab>('labels');

  useEffect(() => {
    fetchLabels(db);
    fetchActivities(db);
  }, []);

  const getLabelForActivity = (labelId: number) => {
    return labels.find((l) => l.id === labelId);
  };

  const handleDeleteLabel = (labelId: number, labelName: string) => {
    Alert.alert(
      t.deleteLabel || 'Delete Label',
      `${t.deleteLabelWarning}`,
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.delete || 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLabel(db, labelId);
            await fetchActivities(db);
          },
        },
      ]
    );
  };

  const handleDeleteActivity = (activityId: number, activityTitle: string) => {
    Alert.alert(
      t.deleteActivity || 'Delete Activity',
      t.deleteActivityConfirm || `Delete "${activityTitle}"?`,
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.delete || 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelActivityNotification(db, activityId);
            await deleteActivity(db, activityId);
          },
        },
      ]
    );
  };

  const renderLabelItem = ({ item }: { item: typeof labels[0] }) => {
    const labelColor = item.color || Colors.primary;
    const iconName = (item.icon || 'briefcase') as keyof typeof Ionicons.glyphMap;
    const activityCount = activities.filter((a) => a.label_id === item.id).length;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push(`/labels/${item.id}`)}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIcon, { backgroundColor: `${labelColor}15` }]}>
            <Ionicons name={iconName} size={20} color={labelColor} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>
              {activityCount} {activityCount === 1 ? (t.activity || 'activity') : (t.activityPlural || 'activities')}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/labels/${item.id}`)}
          >
            <Ionicons name="pencil" size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteLabel(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderActivityItem = ({ item }: { item: typeof activities[0] }) => {
    const label = getLabelForActivity(item.label_id);
    const labelColor = label?.color || Colors.primary;
    const iconName = (label?.icon || 'briefcase') as keyof typeof Ionicons.glyphMap;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push(`/${item.id}/schedule`)}
          activeOpacity={0.7}
        >
          <View style={[styles.cardIcon, { backgroundColor: `${labelColor}15` }]}>
            <Ionicons name={iconName} size={20} color={labelColor} />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {label?.name || (t.noLabel || 'No label')}
              {formatDateTime(item.time) ? ` · ${formatDateTime(item.time)}` : ''}
              {formatSchedule(item.schedule_type) ? ` · ${formatSchedule(item.schedule_type)}` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/${item.id}/schedule`)}
          >
            <Ionicons name="pencil" size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteActivity(item.id, item.title)}
          >
            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'labels' && styles.tabActive]}
          onPress={() => setActiveTab('labels')}
        >
          <Ionicons
            name="pricetags"
            size={18}
            color={activeTab === 'labels' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'labels' && styles.tabTextActive]}>
            {t.labels || 'Labels'} ({labels.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
          onPress={() => setActiveTab('activities')}
        >
          <Ionicons
            name="list"
            size={18}
            color={activeTab === 'activities' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
            {t.activities || 'Activities'} ({activities.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'labels' ? (
        <FlatList
          data={labels}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLabelItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="pricetags-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>{t.noLabelsYet || 'No labels yet'}</Text>
              <Text style={styles.emptySubtext}>{t.createFirstLabel || 'Create your first label to get started'}</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivityItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="list-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>{t.noActivitiesYet || 'No activities yet'}</Text>
              <Text style={styles.emptySubtext}>{t.createLabelFirst || 'Create a label first, then add activities'}</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          if (activeTab === 'labels') {
            router.push('/labels/new');
          } else {
            if (labels.length === 0) {
              Alert.alert(t.noLabels || 'No Labels', t.pleaseCreateLabelFirst || 'Please create a label first.');
              router.push('/labels/new');
            } else {
              router.push('/new/schedule');
            }
          }
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const useStyles = (Colors: any, Typography: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.border,
  },
  tabText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.textSecondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.body,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...Typography.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 12,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    ...Typography.body,
    fontWeight: '600',
  },
  emptySubtext: {
    ...Typography.secondary,
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
