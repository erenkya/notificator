import { Colors, Spacing, Typography } from '@/constants/Design';
import { Activity } from '@/src/features/activities/store';
import { Label } from '@/src/features/labels/store';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActivityCardProps {
  activity: Activity;
  label?: Label;
  onPress: () => void;
  isLastNode?: boolean; // Used to cut off the tree-line on the very last node
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, label, onPress, isLastNode }) => {
  return (
    <View style={styles.container}>
      {/* Tree Line (Vertical) */}
      <View style={[styles.treeLine, isLastNode && styles.lastNodeCutoff]} />
      
      {/* Connector (Horizontal) */}
      <View style={styles.treeNodeConnector} />

      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.contentRow}>
          <View style={styles.textStack}>
            <Text style={styles.title}>{activity.title}</Text>
            {activity.notes ? (
              <Text style={styles.notes} numberOfLines={1}>
                {activity.notes}
              </Text>
            ) : null}
          </View>

          {/* Schedule/Notification Badge */}
          {(activity.schedule_type || activity.notification_preference) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {activity.time ? activity.time : (activity.schedule_type || 'SCH')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: Spacing.xl + 4, // 36px total
    paddingVertical: 8,
    position: 'relative',
  },
  treeLine: {
    position: 'absolute',
    left: 20, // 1.25rem = 20px
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E2E8F0', // slate-200
  },
  lastNodeCutoff: {
    bottom: '50%', // Cuts the vertical line halfway through the last node
  },
  treeNodeConnector: {
    position: 'absolute',
    left: 20,
    top: '50%',
    width: 16, // 1rem approx mapping the 0.75rem + extra visual length 
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200
    borderRadius: 12, // rounded-xl
    padding: 12, // p-3
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textStack: {
    flexDirection: 'column',
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500', // font-medium
    color: '#1E293B', // slate-800
  },
  notes: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#F1F5F9', // slate-100
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4, // rounded
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700', // font-bold
    color: '#64748B', // slate-500
    textTransform: 'uppercase',
  },
});
