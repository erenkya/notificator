import { Colors, Spacing, Typography } from '@/constants/Design';
import { Label } from '@/src/features/labels/store';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface LabelCardProps {
  label: Label;
  onPress: () => void;
}

export const LabelCard: React.FC<LabelCardProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: label.color || Colors.primary, borderLeftWidth: 4 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.title}>{label.name}</Text>
      {label.notes ? <Text style={styles.notes} numberOfLines={1}>{label.notes}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...Typography.header,
  },
  notes: {
    ...Typography.secondary,
    marginTop: Spacing.xs,
  },
});
