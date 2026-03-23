import { Colors, Spacing, Typography } from '@/constants/Design';
import { Label } from '@/src/features/labels/store';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LabelCardProps {
  label: Label;
  onPress: () => void;
  onDelete?: () => void;
}

export const LabelCard: React.FC<LabelCardProps> = ({ label, onPress, onDelete }) => {
  const labelColor = label.color || Colors.primary;
  const iconName = (label.icon || 'briefcase') as keyof typeof Ionicons.glyphMap;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${labelColor}20` }]}>
        <Ionicons name={iconName} size={20} color={labelColor} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{label.name}</Text>
        {label.notes ? <Text style={styles.notes} numberOfLines={1}>{label.notes}</Text> : null}
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color="#F43F5E" />
        </TouchableOpacity>
      )}
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...Typography.header,
  },
  notes: {
    ...Typography.secondary,
    marginTop: 2,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
