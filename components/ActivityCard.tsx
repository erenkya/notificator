import { Colors, Spacing } from '@/constants/Design';
import { Activity } from '@/src/features/activities/store';
import { Label } from '@/src/features/labels/store';
import { formatDateTime, formatSchedule } from '@/src/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActivityCardProps {
  activity: Activity;
  label?: Label;
  onPress: () => void;
  onDelete?: () => void;
  isLastNode?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, label, onPress, onDelete, isLastNode }) => {
  const labelColor = label?.color || Colors.primary;
  const iconName = (label?.icon || 'briefcase') as keyof typeof Ionicons.glyphMap;
  const dateTime = formatDateTime(activity.time);
  const schedule = formatSchedule(activity.schedule_type);

  return (
    <View style={styles.container}>
      {/* Tree Line (Vertical) */}
      <View style={[styles.treeLine, isLastNode && styles.lastNodeCutoff]} />
      
      {/* Connector (Horizontal) */}
      <View style={styles.treeNodeConnector} />

      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.topRow}>
          <View style={[styles.iconCircle, { backgroundColor: `${labelColor}15` }]}>
            <Ionicons name={iconName} size={16} color={labelColor} />
          </View>
          <View style={styles.textStack}>
            <Text style={styles.title}>{activity.title}</Text>
            {(dateTime || schedule) && (
              <View style={styles.metaRow}>
                {dateTime && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color="#64748B" />
                    <Text style={styles.metaText}>{dateTime}</Text>
                  </View>
                )}
                {schedule && (
                  <View style={styles.metaItem}>
                    <Ionicons name="repeat" size={12} color="#64748B" />
                    <Text style={styles.metaText}>{schedule}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {onDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color="#F43F5E" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: Spacing.xl + 4,
    paddingVertical: 6,
    position: 'relative',
  },
  treeLine: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  lastNodeCutoff: {
    bottom: '50%',
  },
  treeNodeConnector: {
    position: 'absolute',
    left: 20,
    top: '50%',
    width: 16,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStack: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
