import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { mockJobs } from '../../../constants/mockData';
import { useAppData } from '../../../core/AppDataContext';
import { colors } from '../../../theme';
import { spacing } from '../../../theme/spacing';
import { StatePanel } from '../../../components/feedback/StatePanel';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

export function JobDetailScreen({ navigation, route }: Props) {
  const job = mockJobs.find((item) => item.id === route.params.jobId);
  const { applyToJob, hasApplied } = useAppData();

  if (!job) return <StatePanel title="Không tìm thấy việc làm" description="Job không tồn tại hoặc đã được gỡ khỏi danh sách." actionLabel="Quay lại" onAction={() => navigation.goBack()} />;

  const applied = hasApplied(job.id);
  const handleApply = () => {
    applyToJob({ id: `application-${job.id}`, jobId: job.id, jobTitle: job.title, company: job.company, status: 'applied', appliedAt: '2026-10-27' });
    Alert.alert('Đã cập nhật', 'Đơn ứng tuyển đã được thêm vào danh sách.', [
      { text: 'Xem đơn', onPress: () => navigation.navigate('CandidateTabs', { screen: 'Applications' }) },
      { text: 'Ở lại' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.company}</Text>
        <Text style={styles.meta}>{job.location} · {job.employmentType}</Text>
        <View style={styles.section}><Text style={styles.sectionTitle}>Mức lương</Text><Text style={styles.body}>{job.salary}</Text></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Mô tả</Text><Text style={styles.body}>{job.description}</Text></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Kỹ năng</Text><Text style={styles.body}>{job.skills.join(' · ')}</Text></View>
        <Pressable accessibilityRole="button" disabled={applied} onPress={handleApply} style={[styles.button, applied && styles.buttonDisabled]}>
          <Text style={styles.buttonText}>{applied ? 'Đã ứng tuyển' : 'Ứng tuyển vị trí này'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  content: { padding: spacing.lg },
  title: { color: colors.light.text.primary, fontSize: 28, fontWeight: '800' },
  company: { color: colors.light.brand.secondary, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
  meta: { color: colors.light.text.secondary, marginTop: spacing.sm },
  section: { borderTopColor: colors.light.border.subtle, borderTopWidth: 1, marginTop: spacing.lg, paddingTop: spacing.md },
  sectionTitle: { color: colors.light.text.primary, fontSize: 16, fontWeight: '800' },
  body: { color: colors.light.text.secondary, fontSize: 15, lineHeight: 23, marginTop: spacing.sm },
  button: { alignItems: 'center', backgroundColor: colors.light.brand.primary, borderRadius: 8, marginTop: spacing.xl, padding: 14 },
  buttonDisabled: { backgroundColor: colors.light.status.success },
  buttonText: { color: colors.light.text.inverse, fontWeight: '800' },
});
