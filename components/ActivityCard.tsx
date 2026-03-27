import { Spacing, useAppTheme, useTypography } from '@/constants/Design';
import { Activity } from '@/src/features/activities/store';
import { Label } from '@/src/features/labels/store';
import { formatDateTime, formatSchedule } from '@/src/utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSettingsStore } from '@/src/features/settings/store';

interface ActivityCardProps {
  activity: Activity;
  label?: Label;
  onPress?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onRevert?: () => void;
  isLastNode?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, label, onPress, onDelete, onComplete, onRevert, isLastNode }) => {
  const Colors = useAppTheme();
  const Typography = useTypography();
  const styles = useStyles(Colors, Typography);
  const { language } = useSettingsStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = () => {
    if (!onComplete) return;

    if (isCompleting) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsCompleting(false);
      return;
    }

    setIsCompleting(true);
    timeoutRef.current = setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const handleRevertVisual = () => {
    if (!onRevert) return;
    
    if (isCompleting) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsCompleting(false);
      return;
    }

    setIsCompleting(true);
    timeoutRef.current = setTimeout(() => {
      onRevert();
    }, 3000);
  };

  // High contrast fallback override for dark modes
  const circleBorder = Colors.textSecondary;

  const labelColor = label?.color || Colors.primary;
  const iconName = (label?.icon || 'briefcase') as keyof typeof Ionicons.glyphMap;
  const dateTime = formatDateTime(activity.time, language);
  const schedule = formatSchedule(activity.schedule_type);

  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <View style={styles.rightAction}>
        <TouchableOpacity style={styles.actionBtnRight} onPress={onDelete}>
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View 
      style={styles.container}
      exiting={FadeOut.duration(350)}
      layout={LinearTransition.springify().damping(14).stiffness(150)}
    >
      {/* Tree Line (Vertical) */}
      <View style={[styles.treeLine, isLastNode && styles.lastNodeCutoff]} />
      
      {/* Connector (Horizontal) */}
      <View style={styles.treeNodeConnector} />

      <Swipeable
        renderRightActions={renderRightActions}
        containerStyle={styles.swipeContainer}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={onPress}
          activeOpacity={0.7}
          disabled={!onPress}
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
                      <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{dateTime}</Text>
                    </View>
                  )}
                  {schedule && (
                    <View style={styles.metaItem}>
                      <Ionicons name="repeat" size={12} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{schedule}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            {onComplete && !onRevert && (
              <TouchableOpacity 
                style={styles.completeBtn} 
                onPress={handleComplete}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {isCompleting ? (
                  <View style={[styles.circleCheckFilled, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                ) : (
                  <View style={[styles.circleCheck, { borderColor: circleBorder }]} />
                )}
              </TouchableOpacity>
            )}

            {onRevert && (
              <TouchableOpacity 
                style={styles.completeBtn} 
                onPress={handleRevertVisual}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {!isCompleting ? (
                  <View style={[styles.circleCheckFilled, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                ) : (
                  <View style={[styles.circleCheck, { borderColor: circleBorder }]} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
};

const useStyles = (Colors: any, Typography: any) => StyleSheet.create({
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
    backgroundColor: Colors.border,
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
    backgroundColor: Colors.border,
  },
  swipeContainer: {
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
    backgroundColor: '#F43F5E',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionBtnRight: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.textSecondary,
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
    ...Typography.body,
    fontWeight: '600',
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
    ...Typography.secondary,
    fontSize: 11,
    fontWeight: '500',
  },
  completeBtn: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  circleCheckFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
