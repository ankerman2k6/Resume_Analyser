import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '../../../core/AppDataContext';
import { StatePanel } from '../../../components/feedback/StatePanel';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';

export function ApplicationsScreen() {
  const { applications } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={applications}
        keyExtractor={(application) => application.id}
        ListHeaderComponent={<View><Text style={styles.title}>Đơn ứng tuyển</Text><Text style={styles.subtitle}>Danh sách được cập nhật sau khi ứng tuyển từ Job Detail.</Text></View>}
        ListEmptyComponent={<StatePanel title="Chưa có đơn ứng tuyển" description="Hãy chọn một việc làm và gửi đơn đầu tiên của bạn." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
            <Text style={styles.company}>{item.company}</Text>
            <Text style={styles.status}>{item.status === 'applied' ? 'Đã ứng tuyển' : 'Đang xem xét'}</Text>
            <Text style={styles.date}>Ngày gửi: {item.appliedAt}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  content: { padding: spacing.md },
  title: { color: colors.light.text.primary, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.light.text.secondary, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm },
  card: { backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, marginBottom: spacing.md, padding: spacing.md },
  jobTitle: { color: colors.light.text.primary, fontSize: 17, fontWeight: '800' },
  company: { color: colors.light.brand.secondary, fontWeight: '700', marginTop: spacing.sm },
  status: { color: colors.light.status.success, fontWeight: '800', marginTop: spacing.md },
  date: { color: colors.light.text.secondary, marginTop: spacing.sm },
});
