import { Colors, Spacing, Typography } from '@/constants/Design';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLabelStore } from '@/src/features/labels/store';
import { useTranslations } from '@/src/utils/i18n';

const PALETTE = [
  '#6366F1', // Indigo (Primary)
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#0EA5E9', // Sky
  '#8B5CF6', // Violet
  '#64748B', // Slate
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#4F46E5', // Indigo-600
  '#84CC16', // Lime
];

export default function LabelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const db = useSQLiteContext();
  const router = useRouter();
  const t = useTranslations();

  const { labels, addLabel, updateLabel, deleteLabel } = useLabelStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);

  useEffect(() => {
    if (!isNew) {
      const existing = labels.find((l) => l.id.toString() === id);
      if (existing) {
        setName(existing.name);
        setColor(existing.color || PALETTE[0]);
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
      notes: null, // Removing notes to match HTML simplicity
      color,
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
      Alert.alert(t.delete || 'Delete Label', t.deleteLabelWarning || 'This will also delete ALL activities in this label. Are you sure?', [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        { 
          text: t.delete || 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteLabel(db, Number(id));
            router.push('/labels'); // Route fully back to list, as related activities auto-cascade
          }
        }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background Dim (Simulating Bottom Sheet from modal route) */}
      <View style={styles.sheetContainer}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Large Header Title */}
          <Text style={styles.pageTitle}>
            {isNew ? (t.createNewLabel || 'Create New Label') : (t.editLabel || 'Edit Label')}
          </Text>

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

          {/* Color Picker UI */}
          <View style={styles.inputGroup}>
            <View style={styles.colorHeader}>
              <Text style={styles.label}>{t.selectIconColor || 'Select Icon Color'}</Text>
              <Text style={styles.presetText}>{PALETTE.length} {t.presets || 'presets'}</Text>
            </View>
            
            <View style={styles.colorGrid}>
              {PALETTE.map((hex) => {
                const isSelected = color === hex;
                return (
                  <TouchableOpacity
                    key={hex}
                    activeOpacity={0.8}
                    onPress={() => setColor(hex)}
                    style={[
                      styles.colorWrap,
                      { backgroundColor: `${hex}26` }, // 15% opacity hex
                      isSelected ? { borderColor: hex } : { borderColor: 'transparent' }
                    ]}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: hex }]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{isNew ? (t.createLabel || 'Create Label') : (t.saveLabel || 'Save Label')}</Text>
              {isNew && <Ionicons name="add-circle" size={20} color={Colors.white} />}
            </TouchableOpacity>

            {!isNew && (
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>{t.delete || 'Delete'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00000000', // transparent for modal bg
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 32,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',  // slate-500
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  colorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  actions: {
    marginTop: 32,
    gap: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
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
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F43F5E',
  },
});
