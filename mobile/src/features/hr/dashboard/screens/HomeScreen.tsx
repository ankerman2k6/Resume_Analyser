import { useEffect, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CandidateTabParamList } from '../../../types/navigation';
import { mockJobs } from '../../../constants/mockData';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { StatePanel } from '../../../components/feedback/StatePanel';

type Props = BottomTabScreenProps<CandidateTabParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <StatePanel title="Đang tải việc làm" description="Đang lấy danh sách vị trí phù hợp..." />;
  }

  if (hasError) {
    return <StatePanel title="Không thể tải dữ liệu" description="Hãy thử lại để tải danh sách việc làm." actionLabel="Thử lại" onAction={() => setHasError(false)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={mockJobs}
        keyExtractor={(job) => job.id}
        ListHeaderComponent={<View><Text style={styles.eyebrow}>DỮ LIỆU DEMO</Text><Text style={styles.title}>Tìm cơ hội tiếp theo</Text><Text style={styles.subtitle}>Chọn một việc làm để mở màn hình chi tiết và truyền `jobId`.</Text></View>}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => navigation.getParent()?.navigate('JobDetail', { jobId: item.id })} style={styles.card}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.company}>{item.company}</Text>
            <Text style={styles.meta}>{item.location} · {item.employmentType}</Text>
            <Text style={styles.salary}>{item.salary}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<StatePanel title="Chưa có việc làm" description="Danh sách demo hiện đang trống." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  content: { padding: spacing.md },
  eyebrow: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: spacing.sm },
  title: { color: colors.light.text.primary, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.light.text.secondary, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm },
  card: { backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, marginBottom: spacing.md, padding: spacing.md },
  jobTitle: { color: colors.light.text.primary, fontSize: 18, fontWeight: '800' },
  company: { color: colors.light.brand.secondary, fontWeight: '700', marginTop: spacing.sm },
  meta: { color: colors.light.text.secondary, marginTop: spacing.sm },
  salary: { color: colors.light.text.primary, fontWeight: '700', marginTop: spacing.md },
});
