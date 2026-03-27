import { Spacing, useAppTheme, useTypography } from '@/constants/Design';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLabelStore } from '@/src/features/labels/store';
import { useTranslations } from '@/src/utils/i18n';

const PALETTE = [
  '#6366F1', '#F43F5E', '#F59E0B', '#10B981',
  '#0EA5E9', '#8B5CF6', '#64748B', '#EC4899',
  '#14B8A6', '#F97316', '#4F46E5', '#84CC16',
];

const ICON_OPTIONS: { name: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { name: 'briefcase', label: 'Work' },
  { name: 'home', label: 'Home' },
  { name: 'person', label: 'Personal' },
  { name: 'fitness', label: 'Fitness' },
  { name: 'heart', label: 'Health' },
  { name: 'school', label: 'Education' },
  { name: 'cart', label: 'Shopping' },
  { name: 'restaurant', label: 'Food' },
  { name: 'car', label: 'Travel' },
  { name: 'musical-notes', label: 'Music' },
  { name: 'game-controller', label: 'Gaming' },
  { name: 'code-slash', label: 'Coding' },
  { name: 'book', label: 'Reading' },
  { name: 'call', label: 'Calls' },
  { name: 'mail', label: 'Mail' },
  { name: 'cash', label: 'Finance' },
  { name: 'calendar', label: 'Calendar' },
  { name: 'star', label: 'Priority' },
  { name: 'flag', label: 'Goals' },
  { name: 'alarm', label: 'Reminder' },
  { name: 'paw', label: 'Pets' },
  { name: 'leaf', label: 'Nature' },
  { name: 'airplane', label: 'Flight' },
  { name: 'bed', label: 'Sleep' },
  { name: 'barbell', label: 'Gym' },
  { name: 'camera', label: 'Photo' },
  { name: 'film', label: 'Movies' },
  { name: 'gift', label: 'Gifts' },
  { name: 'medkit', label: 'Medical' },
  { name: 'bulb', label: 'Ideas' },
  { name: 'construct', label: 'Tools' },
  { name: 'globe', label: 'Web' },
  { name: 'chatbubbles', label: 'Chat' },
  { name: 'megaphone', label: 'Announce' },
  { name: 'rocket', label: 'Launch' },
  { name: 'trophy', label: 'Achievement' },
];

export default function LabelDetailScreen() {
  const Colors = useAppTheme();
  const Typography = useTypography();
  const styles = useStyles(Colors, Typography);

  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const db = useSQLiteContext();
  const router = useRouter();
  const t = useTranslations();

  const { labels, addLabel, updateLabel, deleteLabel } = useLabelStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [icon, setIcon] = useState<string>('briefcase');

  useEffect(() => {
    if (!isNew) {
      const existing = labels.find((l) => l.id.toString() === id);
      if (existing) {
        setName(existing.name);
        setColor(existing.color || PALETTE[0]);
        setIcon(existing.icon || 'briefcase');
      }
    }
  }, [id, labels]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a name for the label.');
      return;
    }

    const payload = {
      name: name.trim(),
      notes: null,
      color,
      icon,
    };

    if (isNew) {
      await addLabel(db, payload);
    } else {
      await updateLabel(db, Number(id), payload);
    }
    router.back();
  };

  const handleDelete = async () => {
    if (!isNew) {
      Alert.alert(
        t.delete || 'Delete Label',
        t.deleteLabelWarning || 'This will also delete ALL activities in this label. Are you sure?',
        [
          { text: t.cancel || 'Cancel', style: 'cancel' },
          {
            text: t.delete || 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteLabel(db, Number(id));
              router.back();
            },
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.sheetContainer}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {/* Top bar with delete button for edit mode */}
        <View style={styles.topBar}>
          <View style={{ width: 36 }} />
          <View style={[styles.previewCircle, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          {!isNew ? (
            <TouchableOpacity style={styles.topDeleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#F43F5E" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Label Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.labelName || 'Label Name'}</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t.labelNamePlaceholder || 'e.g. Work, Urgent, Personal'}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Color Picker - compact row */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.selectIconColor || 'Color'}</Text>
            <View style={styles.colorRow}>
              {PALETTE.map((hex) => {
                const isSelected = color === hex;
                return (
                  <TouchableOpacity
                    key={hex}
                    activeOpacity={0.8}
                    onPress={() => setColor(hex)}
                    style={[
                      styles.colorWrap,
                      { backgroundColor: `${hex}26` },
                      isSelected ? { borderColor: hex } : { borderColor: 'transparent' },
                    ]}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: hex }]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Icon Picker - compact grid */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{'Icon'}</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((opt) => {
                const isSelected = icon === opt.name;
                return (
                  <TouchableOpacity
                    key={opt.name}
                    activeOpacity={0.7}
                    onPress={() => setIcon(opt.name)}
                    style={[
                      styles.iconWrap,
                      isSelected && { backgroundColor: `${color}18`, borderColor: color },
                    ]}
                  >
                    <Ionicons
                      name={opt.name as any}
                      size={20}
                      color={isSelected ? color : '#94A3B8'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </ScrollView>

        {/* Save Button - pinned at bottom */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>
              {isNew ? (t.createLabel || 'Create Label') : (t.saveLabel || 'Save Label')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = (Colors: any, Typography: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  previewCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...Typography.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  textInput: {
    height: 48,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    ...Typography.body,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: Colors.white,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
});
