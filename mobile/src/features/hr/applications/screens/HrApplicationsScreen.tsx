import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable,
  RefreshControl, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import { hrApi, type HrApplication, type HrJob, type Interview, type InterviewPayload } from '../../api/hrApi';
import { openApplicationCv } from '../api/hrApplicationFile';

type ApplicationRow = HrApplication & { jobTitle: string };
type StatusFilter = 'all' | 'applied' | 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';
type EditableStatus = 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';

const statusLabels: Record<string, string> = {
  applied: 'Mới nộp', pending: 'Chờ xử lý', reviewing: 'Đang duyệt',
  shortlisted: 'Qua sơ tuyển', interview: 'Phỏng vấn', accepted: 'Đã nhận',
  rejected: 'Từ chối', withdrawn: 'Đã rút',
};
const filters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'applied', label: 'Mới nộp' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'reviewing', label: 'Đang duyệt' },
  { value: 'shortlisted', label: 'Qua sơ tuyển' },
  { value: 'interview', label: 'Phỏng vấn' },
  { value: 'accepted', label: 'Đã nhận' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'withdrawn', label: 'Đã rút' },
];
const editableStatuses: EditableStatus[] = ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'];

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN');
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Yêu cầu không thành công.';
}

export function HrApplicationsScreen() {
  const [jobs, setJobs] = useState<HrJob[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobPickerOpen, setJobPickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [scheduledApplication, setScheduledApplication] = useState<ApplicationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (refresh = false) => {
    const id = ++requestId.current;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [jobRows, interviewRows] = await Promise.all([hrApi.jobs(), hrApi.interviews()]);
      const applicationGroups = await Promise.all(jobRows.map(async (job) => {
        const rows = await hrApi.applications(job.id);
        return rows.map((row) => ({ ...row, jobTitle: job.title }));
      }));
      if (id === requestId.current) {
        setJobs(jobRows);
        setApplications(applicationGroups.flat().sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()));
        setInterviews(interviewRows);
      }
    } catch (requestError) {
      if (id === requestId.current) setError(errorMessage(requestError));
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

  const visible = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('vi');
    return applications.filter((application) => (
      (!selectedJobId || application.jobId === selectedJobId)
      && (statusFilter === 'all' || application.status === statusFilter)
      && (!search || [
        application.fullName, application.email, application.phone, application.jobTitle,
        ...(application.skills ?? []),
      ].some((value) => value?.toLocaleLowerCase('vi').includes(search)))
    ));
  }, [applications, query, selectedJobId, statusFilter]);

  const changeStatus = async (application: ApplicationRow, status: EditableStatus) => {
    if (status === application.status) return;
    setUpdatingId(application.id);
    try {
      const updated = await hrApi.updateApplicationStatus(application.id, status);
      setApplications((current) => current.map((row) => row.id === application.id ? { ...row, status: updated.status, updatedAt: updated.updatedAt, statusHistory: updated.statusHistory } : row));
    } catch (requestError) {
      Alert.alert('Không cập nhật được trạng thái', errorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  };

  const openStatusPicker = (application: ApplicationRow) => {
    Alert.alert('Trạng thái hồ sơ', application.fullName || 'Ứng viên', [
      ...editableStatuses.map((status) => ({
        text: statusLabels[status],
        onPress: () => { void changeStatus(application, status); },
      })),
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const openCv = async (application: ApplicationRow) => {
    try {
      await openApplicationCv(application.id);
    } catch (requestError) {
      Alert.alert('Không mở được CV', errorMessage(requestError));
    }
  };

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>KONEK</Text>
        <Text style={styles.roleBadge}>NHÀ TUYỂN DỤNG</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void load(true); }} tintColor={colors.light.brand.secondary} />}
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Hồ sơ ứng tuyển</Text>
          <Text style={styles.subtitle}>Các hồ sơ ứng tuyển vào tin của bạn</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setJobPickerOpen(true)} style={styles.selector}>
          <Text numberOfLines={1} style={styles.selectorText}>{selectedJob?.title || 'Tất cả vị trí'}</Text>
          <Ionicons color={colors.light.text.secondary} name="chevron-down" size={18} />
        </Pressable>
        <View style={styles.searchBox}>
          <Ionicons color={colors.light.text.secondary} name="search-outline" size={18} />
          <TextInput
            accessibilityLabel="Tìm hồ sơ"
            onChangeText={setQuery}
            placeholder="Tìm theo tên, email hoặc vị trí"
            placeholderTextColor={colors.light.text.secondary}
            style={styles.searchInput}
            value={query}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((filter) => (
            <Pressable key={filter.value} accessibilityRole="button" accessibilityState={{ selected: statusFilter === filter.value }} onPress={() => setStatusFilter(filter.value)} style={[styles.filter, statusFilter === filter.value && styles.filterActive]}>
              <Text style={[styles.filterText, statusFilter === filter.value && styles.filterTextActive]}>{filter.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {loading && applications.length === 0 ? <ActivityIndicator color={colors.light.brand.secondary} style={styles.loading} /> : null}
        {error ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => { void load(); }}><Text style={styles.linkText}>Thử lại</Text></Pressable>
          </View>
        ) : null}
        {!loading ? <Text style={styles.resultText}>{visible.length} hồ sơ</Text> : null}
        {!loading && !error && visible.length === 0 ? (
          <View style={styles.messageCard}><Text style={styles.emptyText}>Chưa có hồ sơ phù hợp.</Text></View>
        ) : null}
        {visible.map((application) => (
          <ApplicationCard
            application={application}
            interview={interviews.find((item) => item.applicationId === application.id && item.status === 'scheduled')}
            key={application.id}
            onOpenCv={() => { void openCv(application); }}
            onOpenStatus={() => openStatusPicker(application)}
            onSchedule={() => setScheduledApplication(application)}
            updating={updatingId === application.id}
          />
        ))}
      </ScrollView>
      <Modal animationType="slide" transparent visible={jobPickerOpen} onRequestClose={() => setJobPickerOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.modalTitle}>Chọn vị trí tuyển dụng</Text>
            <ScrollView style={styles.pickerList}>
              {[{ id: null, title: 'Tất cả vị trí' }, ...jobs].map((job) => (
                <Pressable key={job.id || 'all'} onPress={() => { setSelectedJobId(job.id); setJobPickerOpen(false); }} style={styles.pickerRow}>
                  <Text style={styles.pickerText}>{job.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setJobPickerOpen(false)}><Text style={styles.linkText}>Đóng</Text></Pressable>
          </View>
        </View>
      </Modal>
      {scheduledApplication ? (
        <InterviewScheduleModal
          application={scheduledApplication}
          onClose={() => setScheduledApplication(null)}
          onCreated={() => {
            setScheduledApplication(null);
            void load(true);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ApplicationCard({ application, interview, onOpenCv, onOpenStatus, onSchedule, updating }: {
  application: ApplicationRow; interview?: Interview; onOpenCv: () => void;
  onOpenStatus: () => void; onSchedule: () => void; updating: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}><Ionicons color={colors.light.brand.secondary} name="person-outline" size={22} /></View>
        <View style={styles.cardHeading}>
          <Text style={styles.name}>{application.fullName || 'Ứng viên'}</Text>
          <Text style={styles.jobTitle}>{application.jobTitle}</Text>
        </View>
      </View>
      <Text style={styles.meta}>Nộp ngày {formatDate(application.appliedAt)}</Text>
      {application.email ? <Text style={styles.meta}>{application.email}</Text> : null}
      {application.phone ? <Text style={styles.meta}>{application.phone}</Text> : null}
      {application.experienceYears != null ? (
        <Text style={styles.experienceText}>
          {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(application.experienceYears)} năm kinh nghiệm
        </Text>
      ) : null}
      {application.skills?.length ? (
        <View style={styles.skillList}>
          {application.skills.map((skill) => (
            <View key={skill} style={styles.skillChip}><Text style={styles.skillText}>{skill}</Text></View>
          ))}
        </View>
      ) : null}
      {interview ? <Text style={styles.interviewText}>Phỏng vấn: {formatDate(interview.scheduledAt)} · {new Date(interview.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text> : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" disabled={updating} onPress={onOpenStatus} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>{updating ? 'Đang lưu...' : statusLabels[application.status] || application.status}</Text>
          <Ionicons color={colors.light.brand.secondary} name="chevron-down" size={14} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onSchedule} style={styles.primaryButton}>
          <Ionicons color={colors.light.text.inverse} name="calendar-outline" size={16} />
          <Text style={styles.primaryText}>Lên lịch phỏng vấn</Text>
        </Pressable>
      </View>
      {application.cvUrl ? (
        <Pressable accessibilityRole="button" onPress={onOpenCv} style={styles.cvLink}>
          <Ionicons color={colors.light.brand.secondary} name="document-text-outline" size={16} />
          <Text style={styles.linkText}>Xem CV</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function InterviewScheduleModal({ application, onClose, onCreated }: {
  application: ApplicationRow; onClose: () => void; onCreated: () => void;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    const timeParts = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
    const minutes = Number(duration);
    if (!dateParts || !timeParts) {
      setError('Nhập ngày YYYY-MM-DD và giờ HH:mm.');
      return;
    }
    const scheduledAt = new Date(
      Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]),
      Number(timeParts[1]), Number(timeParts[2]),
    );
    if (scheduledAt.getFullYear() !== Number(dateParts[1])
      || scheduledAt.getMonth() + 1 !== Number(dateParts[2])
      || scheduledAt.getDate() !== Number(dateParts[3])
      || scheduledAt <= new Date()) {
      setError('Ngày giờ phỏng vấn phải hợp lệ và ở tương lai.');
      return;
    }
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 480) {
      setError('Thời lượng phải từ 1 đến 480 phút.');
      return;
    }
    if (mode === 'online' && !meetingLink.trim()) {
      setError('Nhập đường dẫn họp trực tuyến.');
      return;
    }
    if (mode === 'offline' && !location.trim()) {
      setError('Nhập địa điểm phỏng vấn.');
      return;
    }
    const payload: InterviewPayload = {
      applicationId: application.id,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: minutes,
      mode,
      meetingLink: mode === 'online' ? meetingLink.trim() : undefined,
      location: mode === 'offline' ? location.trim() : undefined,
      notes: notes.trim() || undefined,
    };
    setSaving(true);
    setError('');
    try {
      await hrApi.createInterview(payload);
      onCreated();
      Alert.alert('Đã lên lịch phỏng vấn', 'Lịch phỏng vấn đã được lưu.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.scheduleCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeading}>
              <Text style={styles.modalTitle}>Lên lịch phỏng vấn</Text>
              <Text style={styles.subtitle}>{application.fullName || 'Ứng viên'} · {application.jobTitle}</Text>
            </View>
            <Pressable accessibilityLabel="Đóng" onPress={onClose}><Ionicons color={colors.light.text.secondary} name="close" size={22} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Ngày phỏng vấn</Text>
            <TextInput accessibilityLabel="Ngày phỏng vấn" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} style={styles.input} />
            <Text style={styles.fieldLabel}>Giờ bắt đầu</Text>
            <TextInput accessibilityLabel="Giờ bắt đầu" placeholder="HH:mm" value={time} onChangeText={setTime} style={styles.input} />
            <Text style={styles.fieldLabel}>Thời lượng (phút)</Text>
            <TextInput accessibilityLabel="Thời lượng" keyboardType="number-pad" value={duration} onChangeText={setDuration} style={styles.input} />
            <Text style={styles.fieldLabel}>Hình thức</Text>
            <View style={styles.modeRow}>
              {(['online', 'offline'] as const).map((value) => (
                <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected: mode === value }} onPress={() => setMode(value)} style={[styles.modeButton, mode === value && styles.modeSelected]}>
                  <Text style={[styles.modeText, mode === value && styles.modeTextSelected]}>{value === 'online' ? 'Trực tuyến' : 'Trực tiếp'}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.fieldLabel}>{mode === 'online' ? 'Đường dẫn họp' : 'Địa điểm'}</Text>
            <TextInput
              accessibilityLabel={mode === 'online' ? 'Đường dẫn họp' : 'Địa điểm'}
              autoCapitalize="none"
              onChangeText={mode === 'online' ? setMeetingLink : setLocation}
              placeholder={mode === 'online' ? 'https://meet.example.com/...' : 'Địa chỉ phỏng vấn'}
              style={styles.input}
              value={mode === 'online' ? meetingLink : location}
            />
            <Text style={styles.fieldLabel}>Ghi chú</Text>
            <TextInput accessibilityLabel="Ghi chú" multiline onChangeText={setNotes} placeholder="Ghi chú cho buổi phỏng vấn" style={[styles.input, styles.notesInput]} value={notes} />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void submit(); }} style={[styles.primaryButton, styles.submitButton, saving && styles.disabled]}>
              <Text style={styles.primaryText}>{saving ? 'Đang lưu...' : 'Xác nhận lên lịch'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.light.background.primary },
  header: { minHeight: 56, paddingHorizontal: spacing.md, backgroundColor: colors.light.background.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.border.subtle },
  brand: { color: colors.light.brand.primary, fontSize: 20, fontWeight: '800' },
  roleBadge: { color: colors.light.brand.secondary, backgroundColor: colors.light.brand.accent, borderRadius: 99, paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: 10, fontWeight: '700' },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  heading: { gap: 3, marginBottom: spacing.sm },
  title: { color: colors.light.text.primary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.light.text.secondary, fontSize: 13 },
  selector: { minHeight: 48, paddingHorizontal: spacing.md, backgroundColor: colors.light.background.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.light.border.subtle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorText: { color: colors.light.text.primary, fontSize: 14, fontWeight: '600', flex: 1 },
  searchBox: { minHeight: 46, paddingHorizontal: spacing.md, backgroundColor: colors.light.background.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.light.border.subtle, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, color: colors.light.text.primary, fontSize: 13 },
  filters: { gap: spacing.sm, paddingVertical: spacing.xs },
  filter: { borderRadius: 99, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.light.background.surface, borderWidth: 1, borderColor: colors.light.border.subtle },
  filterActive: { backgroundColor: colors.light.brand.secondary, borderColor: colors.light.brand.secondary },
  filterText: { color: colors.light.text.secondary, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.light.text.inverse },
  loading: { marginTop: spacing.xl },
  resultText: { color: colors.light.text.secondary, fontSize: 12, marginVertical: spacing.xs },
  messageCard: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.light.background.surface, gap: spacing.sm },
  errorText: { color: colors.light.status.danger, fontSize: 13 },
  emptyText: { color: colors.light.text.secondary, fontSize: 13 },
  linkText: { color: colors.light.brand.secondary, fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: colors.light.background.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.light.border.subtle, padding: spacing.md, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.light.brand.accent, alignItems: 'center', justifyContent: 'center' },
  cardHeading: { flex: 1, gap: 2 },
  name: { color: colors.light.text.primary, fontSize: 15, fontWeight: '700' },
  jobTitle: { color: colors.light.text.secondary, fontSize: 12 },
  meta: { color: colors.light.text.secondary, fontSize: 12 },
  experienceText: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '600' },
  skillList: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  skillChip: { backgroundColor: colors.light.brand.accent, borderRadius: 99, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  skillText: { color: colors.light.brand.secondary, fontSize: 11, fontWeight: '600' },
  interviewText: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  secondaryButton: { flex: 1, minHeight: 42, borderRadius: 10, borderWidth: 1, borderColor: colors.light.border.subtle, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3 },
  secondaryText: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '700' },
  primaryButton: { flex: 1, minHeight: 42, borderRadius: 10, backgroundColor: colors.light.brand.secondary, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  primaryText: { color: colors.light.text.inverse, fontSize: 12, fontWeight: '700' },
  cvLink: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  overlay: { flex: 1, justifyContent: 'center', padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.45)' },
  pickerCard: { backgroundColor: colors.light.background.surface, borderRadius: 16, padding: spacing.md, gap: spacing.md, maxHeight: '70%' },
  pickerList: { flexGrow: 0 },
  pickerRow: { minHeight: 48, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.border.subtle },
  pickerText: { color: colors.light.text.primary, fontSize: 14 },
  scheduleCard: { backgroundColor: colors.light.background.surface, borderRadius: 16, maxHeight: '85%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.light.border.subtle },
  modalHeading: { flex: 1, gap: 3 },
  modalTitle: { color: colors.light.text.primary, fontSize: 17, fontWeight: '700' },
  formContent: { padding: spacing.md, gap: spacing.sm },
  fieldLabel: { color: colors.light.text.primary, fontSize: 12, fontWeight: '700', marginTop: spacing.xs },
  input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.light.border.subtle, color: colors.light.text.primary, paddingHorizontal: spacing.sm, fontSize: 14 },
  notesInput: { minHeight: 80, paddingTop: spacing.sm, textAlignVertical: 'top' },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.light.border.subtle },
  modeSelected: { borderColor: colors.light.brand.secondary, backgroundColor: colors.light.brand.accent },
  modeText: { color: colors.light.text.secondary, fontSize: 13 },
  modeTextSelected: { color: colors.light.brand.secondary, fontWeight: '700' },
  submitButton: { marginTop: spacing.sm, flex: 0 },
  disabled: { opacity: 0.6 },
});
