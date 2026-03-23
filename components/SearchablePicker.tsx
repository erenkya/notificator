import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Design';

interface PickerItem {
  code: string;
  label: string;
}

interface SearchablePickerProps {
  items: PickerItem[];
  selectedValue: string;
  onSelect: (code: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function SearchablePicker({
  items,
  selectedValue,
  onSelect,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  icon = 'chevron-right',
}: SearchablePickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedLabel = items.find((i) => i.code === selectedValue)?.label || placeholder;

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
    );
  }, [search, items]);

  const handleSelect = (code: string) => {
    onSelect(code);
    setVisible(false);
    setSearch('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            selectedValue ? styles.triggerTextSelected : styles.triggerTextPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <MaterialIcons name="unfold-more" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setVisible(false);
                  setSearch('');
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#64748B" />
              </TouchableOpacity>
              <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.code === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.listRow, isSelected && styles.listRowSelected]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.listRowText, isSelected && styles.listRowTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              }
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    paddingHorizontal: 16,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  triggerTextSelected: {
    color: '#0F172A',
  },
  triggerTextPlaceholder: {
    color: '#94A3B8',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  listContent: {
    paddingVertical: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  listRowSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  listRowText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  listRowTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
  },
});
