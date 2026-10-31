import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatePanel } from '../../../../components/feedback/StatePanel';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { HrTabParamList, RootStackParamList } from '../../../../types/navigation';
import { hrApi, type HrJob } from '../../api/hrApi';

type Props = BottomTabScreenProps<HrTabParamList, 'HrJobs'>;
type JobFilter = 'all' | 'published' | 'draft' | 'closed';

const employmentLabels: Record<string, string> = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  internship: 'Thực tập',
  contract: 'Hợp đồng',
  freelance: 'Freelance',
};

const statusLabels: Record<string, string> = {
  draft: 'Bản nháp',
  published: 'Đang tuyển',
  closed: 'Đã đóng',
};

const filters: { label: string; value: JobFilter }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang tuyển', value: 'published' },
  { label: 'Bản nháp', value: 'draft' },
  { label: 'Đã đóng', value: 'closed' },
];

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function formatSalary(job: HrJob) {
  if (job.salary?.negotiable) return 'Thỏa thuận';
  const { min, max, currency = 'VND' } = job.salary ?? {};
  if (min == null && max == null) return 'Chưa cập nhật';
  const format = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
  if (min != null && max != null) return `${format(min)} – ${format(max)} ${currency}`;
  if (min != null) return `Từ ${format(min)} ${currency}`;
  return `Đến ${format(max as number)} ${currency}`;
}

function locationLabel(job: HrJob) {
  const place = job.location?.city || job.location?.address;
  if (job.location?.remote) return place ? `${place} · Từ xa` : 'Làm việc từ xa';
  return place || 'Chưa cập nhật';
}

function statusVisual(status: string) {
  if (status === 'published') {
    return { badge: styles.statusPublished, dot: styles.dotPublished, text: styles.statusPublishedText };
  }
  if (status === 'draft') {
    return { badge: styles.statusDraft, dot: styles.dotDraft, text: styles.statusDraftText };
  }
  if (status === 'closed') {
    return { badge: styles.statusClosed, dot: styles.dotClosed, text: styles.statusClosedText };
  }
  return { badge: styles.statusFallback, dot: styles.dotFallback, text: styles.statusFallbackText };
}

function EmptyJobs({ filtered, onCreate }: { filtered: boolean; onCreate: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons color={colors.light.brand.secondary} name={filtered ? 'search-outline' : 'briefcase-outline'} size={28} />
      </View>
      <Text style={styles.emptyTitle}>{filtered ? 'Không tìm thấy tin phù hợp' : 'Chưa có tin tuyển dụng'}</Text>
      <Text style={styles.emptyDescription}>
        {filtered
          ? 'Hãy thử từ khóa khác hoặc chọn lại bộ lọc trạng thái.'
          : 'Tạo tin đầu tiên để bắt đầu tìm kiếm ứng viên phù hợp.'}
      </Text>
      {!filtered ? (
        <Pressable
          accessibilityRole="button"
          onPress={onCreate}
          style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}
        >
          <Ionicons color={colors.light.text.inverse} name="add" size={20} />
          <Text style={styles.emptyActionText}>Tạo tin đầu tiên</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function HrJobsScreen({ navigation }: Props) {
  const openingCreateJob = useRef(false);
  const [jobs, setJobs] = useState<HrJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<JobFilter>('all');

  const load = useCallback(async () => {
    setError('');
    try {
      setJobs(await hrApi.jobs());
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : 'Không tải được danh sách công việc.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const openCreateJob = useCallback(() => {
    if (openingCreateJob.current) return;
    const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    if (!rootNavigation || rootNavigation.getState().routes.at(-1)?.name === 'HrCreateJob') return;
    openingCreateJob.current = true;
    rootNavigation.navigate('HrCreateJob');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityLabel="Đăng tin tuyển dụng mới"
          accessibilityRole="button"
          hitSlop={4}
          onPress={openCreateJob}
          style={({ pressed }) => [styles.headerAddButton, pressed && styles.headerAddButtonPressed]}
        >
          <Ionicons color={colors.light.brand.secondary} name="add" size={27} />
        </Pressable>
      ),
      headerRightContainerStyle: styles.headerRightContainer,
      headerTitleAlign: 'center',
      title: 'Tin tuyển dụng',
    });
  }, [navigation, openCreateJob]);

  useFocusEffect(useCallback(() => {
    openingCreateJob.current = false;
    void load();
  }, [load]));

  const counts = useMemo(() => ({
    all: jobs.length,
    published: jobs.filter((job) => job.status === 'published').length,
    draft: jobs.filter((job) => job.status === 'draft').length,
    closed: jobs.filter((job) => job.status === 'closed').length,
  }), [jobs]);

  const visibleJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    return jobs.filter((job) => {
      const matchesFilter = filter === 'all' || job.status === filter;
      const matchesQuery = !normalizedQuery
        || job.title.toLocaleLowerCase('vi').includes(normalizedQuery)
        || (job.category ?? '').toLocaleLowerCase('vi').includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, jobs, query]);

  const refresh = () => {
    setRefreshing(true);
    void load();
  };

  const changeStatus = async (item: HrJob) => {
    const nextStatus = item.status === 'published' ? 'closed' : 'published';
    try {
      const updated = await hrApi.updateJobStatus(item.id, nextStatus);
      setJobs((current) => current.map((job) => job.id === item.id ? updated : job));
    } catch (requestError) {
      Alert.alert('Không cập nhật được trạng thái', requestError instanceof Error ? requestError.message : 'Vui lòng thử lại sau.');
    }
  };

  const remove = (item: HrJob) => {
    Alert.alert('Xóa tin tuyển dụng', `Bạn có chắc muốn xóa “${item.title}”?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await hrApi.deleteJob(item.id);
            setJobs((current) => current.filter((job) => job.id !== item.id));
          } catch (requestError) {
            Alert.alert('Không xóa được tin', requestError instanceof Error ? requestError.message : 'Vui lòng thử lại sau.');
          }
        },
      },
    ]);
  };

  const showDetail = async (item: HrJob) => {
    try {
      const detail = await hrApi.job(item.id);
      Alert.alert(detail.title, detail.description || 'Tin tuyển dụng chưa có mô tả.');
    } catch (requestError) {
      Alert.alert('Không tải được chi tiết', requestError instanceof Error ? requestError.message : 'Vui lòng thử lại sau.');
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.page}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.light.brand.secondary} size="large" />
          <Text style={styles.loadingText}>Đang tải tin tuyển dụng…</Text>
        </View>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View style={styles.page}>
        <StatePanel
          actionLabel="Thử lại"
          description={error}
          onAction={() => {
            setLoading(true);
            void load();
          }}
          title="Không tải được công việc"
        />
      </View>
    );
  }

  const listHeader = (
    <View style={styles.listHeader}>
      {error ? (
        <View style={styles.errorBanner}>
          <View style={styles.errorCopy}>
            <Ionicons color={colors.light.status.danger} name="alert-circle-outline" size={19} />
            <Text style={styles.errorText}>Không thể cập nhật danh sách mới nhất.</Text>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => void load()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.overview}>
        <Text style={styles.overviewTitle}>Quản lý tin tuyển dụng</Text>
        <Text style={styles.overviewSubtitle}>Theo dõi và cập nhật các vị trí đang tuyển của bạn.</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{counts.all}</Text>
            <Text style={styles.statLabel}>Tổng số tin</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statValueSuccess]}>{counts.published}</Text>
            <Text style={styles.statLabel}>Đang tuyển</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statValueWarning]}>{counts.draft}</Text>
            <Text style={styles.statLabel}>Bản nháp</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons color={colors.light.text.secondary} name="search-outline" size={19} />
        <TextInput
          accessibilityLabel="Tìm kiếm tin tuyển dụng"
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Tìm theo chức danh hoặc chuyên môn…"
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />
        {query ? (
          <Pressable accessibilityLabel="Xóa từ khóa tìm kiếm" accessibilityRole="button" hitSlop={8} onPress={() => setQuery('')}>
            <Ionicons color={colors.light.text.secondary} name="close-circle" size={19} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.filterRow} horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((option) => {
          const selected = filter === option.value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => setFilter(option.value)}
              style={({ pressed }) => [styles.filterChip, selected && styles.filterChipSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>{option.label}</Text>
              <View style={[styles.filterCount, selected && styles.filterCountSelected]}>
                <Text style={[styles.filterCountText, selected && styles.filterCountTextSelected]}>{counts[option.value]}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.page}>
      <FlatList
        contentContainerStyle={styles.content}
        data={visibleJobs}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyJobs filtered={jobs.length > 0} onCreate={openCreateJob} />}
        ListHeaderComponent={listHeader}
        onRefresh={refresh}
        refreshing={refreshing}
        renderItem={({ item }) => {
          const visual = statusVisual(item.status);
          const statusActionLabel = item.status === 'published' ? 'Đóng tin' : item.status === 'closed' ? 'Mở lại' : 'Đăng tin';
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.statusBadge, visual.badge]}>
                  <View style={[styles.statusDot, visual.dot]} />
                  <Text style={[styles.statusText, visual.text]}>{statusLabels[item.status] ?? 'Trạng thái khác'}</Text>
                </View>
                <Text numberOfLines={1} style={styles.category}>{item.category || 'Chưa phân loại'}</Text>
              </View>

              <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Ionicons color={colors.light.brand.secondary} name="location-outline" size={16} />
                  <Text numberOfLines={1} style={styles.metaText}>{locationLabel(item)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons color={colors.light.brand.secondary} name="briefcase-outline" size={16} />
                  <Text numberOfLines={1} style={styles.metaText}>{employmentLabels[item.employmentType] ?? item.employmentType}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons color={colors.light.status.success} name="cash-outline" size={16} />
                  <Text numberOfLines={1} style={styles.metaText}>{formatSalary(item)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons color={colors.light.text.secondary} name="time-outline" size={16} />
                  <Text numberOfLines={1} style={styles.metaText}>Đăng {formatDate(item.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.deadlineRow}>
                <View style={styles.deadlineLabel}>
                  <Ionicons color={colors.light.text.secondary} name="calendar-outline" size={16} />
                  <Text style={styles.deadlineText}>Hạn ứng tuyển: {formatDate(item.deadline)}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable accessibilityRole="button" onPress={() => void showDetail(item)} style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}>
                  <Ionicons color={colors.light.text.inverse} name="eye-outline" size={17} />
                  <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => void changeStatus(item)} style={({ pressed }) => [styles.statusButton, pressed && styles.pressed]}>
                  <Ionicons color={colors.light.brand.secondary} name={item.status === 'published' ? 'pause-circle-outline' : 'paper-plane-outline'} size={17} />
                  <Text style={styles.statusButtonText}>{statusActionLabel}</Text>
                </Pressable>
                <Pressable accessibilityLabel={`Xóa tin ${item.title}`} accessibilityRole="button" onPress={() => remove(item)} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                  <Ionicons color={colors.light.status.danger} name="trash-outline" size={18} />
                </Pressable>
              </View>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.light.background.primary, flex: 1 },
  headerRightContainer: { paddingRight: 4 },
  headerAddButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  headerAddButtonPressed: { opacity: 0.55 },
  content: { gap: 12, padding: spacing.md, paddingBottom: spacing.xl },
  listHeader: { gap: 14, marginBottom: 2 },
  overview: { gap: 4 },
  overviewTitle: { color: colors.light.text.primary, fontSize: 20, fontWeight: '700', lineHeight: 28 },
  overviewSubtitle: { color: colors.light.text.secondary, fontSize: 13, lineHeight: 19 },
  statsRow: { alignItems: 'center', backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginTop: 8, paddingVertical: 12 },
  statItem: { alignItems: 'center', flex: 1, gap: 2 },
  statValue: { color: colors.light.text.primary, fontSize: 19, fontWeight: '800' },
  statValueSuccess: { color: '#047857' },
  statValueWarning: { color: '#B45309' },
  statLabel: { color: colors.light.text.secondary, fontSize: 11, fontWeight: '500' },
  statDivider: { backgroundColor: colors.light.border.subtle, height: 30, width: 1 },
  searchBox: { alignItems: 'center', backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 46, paddingHorizontal: 12 },
  searchInput: { color: colors.light.text.primary, flex: 1, fontSize: 14, paddingVertical: 10 },
  filterRow: { gap: 8, paddingRight: spacing.md },
  filterChip: { alignItems: 'center', backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 7, minHeight: 38, paddingHorizontal: 12 },
  filterChipSelected: { backgroundColor: colors.light.brand.secondary, borderColor: colors.light.brand.secondary },
  filterLabel: { color: colors.light.text.secondary, fontSize: 13, fontWeight: '600' },
  filterLabelSelected: { color: colors.light.text.inverse },
  filterCount: { alignItems: 'center', backgroundColor: colors.light.background.subtle, borderRadius: 999, justifyContent: 'center', minHeight: 21, minWidth: 21, paddingHorizontal: 5 },
  filterCountSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  filterCountText: { color: colors.light.text.secondary, fontSize: 11, fontWeight: '700' },
  filterCountTextSelected: { color: colors.light.text.inverse },
  errorBanner: { alignItems: 'center', backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  errorCopy: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 8 },
  errorText: { color: '#B91C1C', flex: 1, fontSize: 13 },
  retryText: { color: colors.light.text.primary, fontSize: 13, fontWeight: '700', marginLeft: 12 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  loadingText: { color: colors.light.text.secondary, fontSize: 14, marginTop: 12 },
  emptyState: { alignItems: 'center', backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 16, borderWidth: 1, marginTop: 2, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.light.brand.accent, borderRadius: 18, height: 56, justifyContent: 'center', width: 56 },
  emptyTitle: { color: colors.light.text.primary, fontSize: 17, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  emptyDescription: { color: colors.light.text.secondary, fontSize: 14, lineHeight: 21, marginTop: 6, textAlign: 'center' },
  emptyAction: { alignItems: 'center', backgroundColor: colors.light.brand.secondary, borderRadius: 12, flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: spacing.md, minHeight: 44, paddingHorizontal: spacing.md },
  emptyActionText: { color: colors.light.text.inverse, fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderRadius: 16, borderWidth: 1, padding: spacing.md, shadowColor: colors.light.brand.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  category: { color: colors.light.text.secondary, flex: 1, fontSize: 11, textAlign: 'right' },
  cardTitle: { color: colors.light.text.primary, fontSize: 17, fontWeight: '700', lineHeight: 24, marginTop: 11 },
  statusBadge: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 999, flexDirection: 'row', gap: 6, paddingHorizontal: 9, paddingVertical: 5 },
  statusDot: { borderRadius: 999, height: 6, width: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusPublished: { backgroundColor: '#ECFDF5' },
  statusDraft: { backgroundColor: '#FFF7ED' },
  statusClosed: { backgroundColor: '#F1F5F9' },
  statusFallback: { backgroundColor: '#EFF6FF' },
  dotPublished: { backgroundColor: colors.light.status.success },
  dotDraft: { backgroundColor: colors.light.status.warning },
  dotClosed: { backgroundColor: '#94A3B8' },
  dotFallback: { backgroundColor: colors.light.status.info },
  statusPublishedText: { color: '#047857' },
  statusDraftText: { color: '#B45309' },
  statusClosedText: { color: '#475569' },
  statusFallbackText: { color: '#1D4ED8' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: 6, minWidth: '46%', width: '48%' },
  metaText: { color: colors.light.text.secondary, flex: 1, fontSize: 12, lineHeight: 18 },
  deadlineRow: { backgroundColor: colors.light.background.subtle, borderRadius: 10, marginTop: 14, paddingHorizontal: 10, paddingVertical: 9 },
  deadlineLabel: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  deadlineText: { color: colors.light.text.secondary, flex: 1, fontSize: 12 },
  actions: { alignItems: 'center', borderTopColor: colors.light.border.subtle, borderTopWidth: 1, flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 12 },
  detailButton: { alignItems: 'center', backgroundColor: colors.light.brand.secondary, borderRadius: 10, flex: 1.25, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 44, paddingHorizontal: 10 },
  detailButtonText: { color: colors.light.text.inverse, fontSize: 12, fontWeight: '700' },
  statusButton: { alignItems: 'center', borderColor: colors.light.border.subtle, borderRadius: 10, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  statusButtonText: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '700' },
  deleteButton: { alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 10, height: 44, justifyContent: 'center', width: 44 },
  pressed: { opacity: 0.72 },
});
