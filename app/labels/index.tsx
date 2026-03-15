import { Colors, Spacing, Typography } from '@/constants/Design';
import { useTranslations } from '@/src/utils/i18n';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { FloatingActionButton } from '@/components/FloatingActionButton';
import { LabelCard } from '@/components/LabelCard';
import { useLabelStore } from '@/src/features/labels/store';

export default function LabelsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const t = useTranslations();
  
  const { labels, fetchLabels } = useLabelStore();

  useEffect(() => {
    fetchLabels(db);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={Typography.title}>{t.labels || 'Labels'}</Text>
        <Text style={Typography.secondary}>
          Manage your categories
        </Text>
      </View>

      <FlatList
        data={labels}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LabelCard
            label={item}
            onPress={() => router.push(`/labels/${item.id}`)}
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
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
