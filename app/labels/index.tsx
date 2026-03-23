import { Colors, Spacing, Typography } from '@/constants/Design';
import { useTranslations } from '@/src/utils/i18n';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FloatingActionButton } from '@/components/FloatingActionButton';
import { LabelCard } from '@/components/LabelCard';
import { useLabelStore } from '@/src/features/labels/store';

export default function LabelsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const t = useTranslations();
  
  const { labels, fetchLabels, deleteLabel } = useLabelStore();

  useEffect(() => {
    fetchLabels(db);
  }, []);

  const handleDeleteLabel = (labelId: number, labelName: string) => {
    Alert.alert(
      'Delete Label',
      `Are you sure you want to delete "${labelName}"? This will also delete ALL activities in this label.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLabel(db, labelId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={labels}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LabelCard
            label={item}
            onPress={() => router.push(`/labels/${item.id}`)}
            onDelete={() => handleDeleteLabel(item.id, item.name)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={Typography.secondary}>No labels yet.</Text>
          </View>
        }
      />

      <FloatingActionButton onPress={() => router.push('/labels/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.xl + 20,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
});
