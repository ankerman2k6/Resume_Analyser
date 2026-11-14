import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hrApi, type Overview, type StatusStats } from '../../api/hrApi';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { HrTabParamList } from '../../../../types/navigation';

type DashboardData = { overview: Overview; applications: StatusStats; interviews: StatusStats };
type IconName = ComponentProps<typeof Ionicons>['name'];

const numberFormatter = new Intl.NumberFormat('vi-VN');
const statusLabels: Record<string, string> = {
  applied: 'Đã nộp', pending: 'Chờ xử lý', reviewing: 'Đang xem xét',
  shortlisted: 'Qua sơ tuyển', interview: 'Phỏng vấn', interviewed: 'Đã phỏng vấn',
  offered: 'Đã đề nghị', hired: 'Đã tuyển', rejected: 'Từ chối',
  withdrawn: 'Đã rút', scheduled: 'Đã lên lịch',
  completed: 'Hoàn tất', cancelled: 'Đã hủy',
};

function formatStatus(status: string) {
  return statusLabels[status.toLowerCase()] ?? status.replace(/[_-]/g, ' ');
}

export function HrDashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<HrTabParamList>>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const load = useCallback(async (refresh = false) => {
    const id = ++requestId.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [overview, applications, interviews] = await Promise.all([
        hrApi.overview(), hrApi.applicationStats(), hrApi.interviewStats(),
      ]);
      if (id === requestId.current) setData({ overview, applications, interviews });
    } catch (requestError) {
      if (id === requestId.current) {
        setError(requestError instanceof Error ? requestError.message : 'Không tải được dữ liệu tổng quan.');
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void load();
    return () => { requestId.current += 1; };
  }, [load]));

  const overview = data?.overview;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>KONEK</Text>
        <Text style={styles.roleBadge}>NHÀ TUYỂN DỤNG</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void load(true); }} tintColor={colors.light.brand.secondary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Tổng quan tuyển dụng</Text>
          <Text style={styles.subtitle}>Số liệu tuyển dụng trong tài khoản của bạn</Text>
        </View>
        {loading && !data ? <ActivityIndicator color={colors.light.brand.secondary} size="large" style={styles.loading} /> : null}
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => { void load(); }}>
              <Text style={styles.retryText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : null}
        {overview && data ? (
          <>
            <Text style={styles.sectionTitle}>Tin tuyển dụng</Text>
            <View style={styles.metrics}>
              <Metric icon="briefcase-outline" label="Tổng số tin" value={overview.totalJobs} />
              <Metric icon="radio-outline" label="Đang đăng" value={overview.publishedJobs} />
              <Metric icon="create-outline" label="Bản nháp" value={overview.draftJobs} />
              <Metric icon="close-circle-outline" label="Đã đóng" value={overview.closedJobs} />
            </View>
            <Text style={styles.sectionTitle}>Hồ sơ ứng tuyển</Text>
            <Metric icon="document-text-outline" label="Tổng hồ sơ" value={overview.totalApplications} />
            <StatusPanel title="Hồ sơ theo trạng thái" total={data.applications.total} byStatus={data.applications.byStatus} />
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('HrApplications')}
              style={styles.applicationLink}
            >
              <Text style={styles.applicationLinkText}>Xem danh sách hồ sơ</Text>
              <Ionicons color={colors.light.brand.secondary} name="chevron-forward" size={17} />
            </Pressable>
            <Text style={styles.sectionTitle}>Phỏng vấn</Text>
            <View style={styles.metrics}>
              <Metric icon="calendar-outline" label="Tổng phỏng vấn" value={overview.totalInterviews} />
              <Metric icon="time-outline" label="Đã lên lịch" value={overview.scheduledInterviews} />
              <Metric icon="checkmark-circle-outline" label="Hoàn tất" value={overview.completedInterviews} />
              <Metric icon="ban-outline" label="Đã hủy" value={overview.cancelledInterviews} />
            </View>
            <StatusPanel title="Phỏng vấn theo trạng thái" total={data.interviews.total} byStatus={data.interviews.byStatus} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: IconName; label: string; value: number }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Ionicons color={colors.light.brand.secondary} name={icon} size={20} />
      </View>
      <Text style={styles.metricValue}>{numberFormatter.format(value)}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatusPanel({ title, total, byStatus }: { title: string; total: number; byStatus: Record<string, number> }) {
  const statuses = Object.entries(byStatus ?? {}).sort(([a], [b]) => a.localeCompare(b));
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelTotal}>{numberFormatter.format(total)}</Text>
      </View>
      {statuses.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có dữ liệu.</Text>
      ) : statuses.map(([status, count]) => (
        <View key={status} style={styles.statusRow}>
          <Text style={styles.statusLabel}>{formatStatus(status)}</Text>
          <Text style={styles.statusCount}>{numberFormatter.format(count)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.light.background.primary },
  topBar: {
    minHeight: 56, paddingHorizontal: spacing.md, backgroundColor: colors.light.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.border.subtle,
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  brand: { color: colors.light.brand.primary, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  roleBadge: {
    overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999,
    backgroundColor: colors.light.brand.accent, color: colors.light.brand.secondary,
    fontSize: 10, fontWeight: '700', letterSpacing: 0.3,
  },
  content: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  heading: { gap: 4, marginBottom: spacing.xs },
  title: { color: colors.light.text.primary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.light.text.secondary, fontSize: 13 },
  sectionTitle: { color: colors.light.text.primary, fontSize: 16, fontWeight: '700', marginTop: spacing.xs },
  loading: { marginTop: spacing.xl },
  errorCard: { padding: spacing.md, borderRadius: 12, backgroundColor: '#FFF3F2', gap: spacing.sm },
  errorText: { color: colors.light.status.danger, fontSize: 13 },
  retryText: { color: colors.light.brand.secondary, fontSize: 13, fontWeight: '700' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    flexBasis: '48%', flexGrow: 1, minHeight: 132, padding: spacing.md, gap: spacing.xs,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.light.border.subtle, backgroundColor: colors.light.background.surface,
  },
  metricIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center' },
  metricValue: { marginTop: spacing.xs, color: colors.light.text.primary, fontSize: 26, fontWeight: '700' },
  metricLabel: { color: colors.light.text.secondary, fontSize: 13 },
  panel: {
    padding: spacing.md, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.light.border.subtle, backgroundColor: colors.light.background.surface,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  panelTitle: { color: colors.light.text.primary, fontSize: 14, fontWeight: '700' },
  panelTotal: { color: colors.light.brand.secondary, fontSize: 20, fontWeight: '700' },
  statusRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.light.border.subtle,
  },
  statusLabel: { color: colors.light.text.secondary, fontSize: 13, textTransform: 'capitalize' },
  statusCount: { color: colors.light.text.primary, fontSize: 13, fontWeight: '700' },
  emptyText: { color: colors.light.text.secondary, fontSize: 13 },
  applicationLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  applicationLinkText: { color: colors.light.brand.secondary, fontSize: 13, fontWeight: '700' },
});
