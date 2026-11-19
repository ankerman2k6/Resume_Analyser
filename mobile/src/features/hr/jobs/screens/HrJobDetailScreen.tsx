import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatePanel } from '../../../../components/feedback/StatePanel';
import { ApiError, ApiNetworkError } from '../../../../core/apiClient';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { RootStackParamList } from '../../../../types/navigation';
import { hrApi, type HrJob } from '../../api/hrApi';

type Props = NativeStackScreenProps<RootStackParamList, 'HrJobDetail'>;
const employmentLabels: Record<string, string> = {
  full_time: 'Toàn thời gian', part_time: 'Bán thời gian', contract: 'Hợp đồng',
  internship: 'Thực tập', freelance: 'Freelance',
};
const statusLabels: Record<string, string> = { draft: 'Bản nháp', published: 'Đang tuyển', closed: 'Đã đóng' };
const levelLabels: Record<string, string> = { intern: 'Thực tập', junior: 'Junior', middle: 'Middle', senior: 'Senior', lead: 'Lead' };

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}
function dateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('vi-VN');
}
function salaryLabel(salary: HrJob['salary']) {
  if (!salary) return '';
  if (salary.negotiable) return 'Thỏa thuận';
  const number = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
  const currency = salary.currency || '';
  if (salary.min != null && salary.max != null) return `${number(salary.min)} – ${number(salary.max)} ${currency}`.trim();
  if (salary.min != null) return `Từ ${number(salary.min)} ${currency}`.trim();
  if (salary.max != null) return `Đến ${number(salary.max)} ${currency}`.trim();
  return '';
}
function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Mã tin tuyển dụng không hợp lệ.';
    if (error.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (error.status === 403) return 'Bạn không có quyền xem tin tuyển dụng này.';
    if (error.status === 404) return 'Tin tuyển dụng không còn tồn tại hoặc không thuộc tài khoản của bạn.';
    if (error.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
  }
  if (error instanceof ApiNetworkError) return error.kind === 'timeout'
    ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.'
    : 'Không thể tải tin tuyển dụng. Hãy kiểm tra kết nối mạng và thử lại.';
  return error instanceof Error ? error.message : 'Không thể tải chi tiết tin tuyển dụng.';
}

function Section({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: ReactNode }) {
  return <View style={styles.card}>
    <View style={styles.sectionHeader}>
      <Ionicons color={colors.light.brand.secondary} name={icon} size={20} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>;
}
function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><Text selectable style={styles.body}>{value}</Text></View>;
}
function Tags({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.tags}>
    {values.map((value, index) => <Text key={`${index}-${value}`} style={styles.tag}>{value}</Text>)}
  </View></View>;
}

export function HrJobDetailScreen({ route }: Props) {
  const { jobId } = route.params;
  const [job, setJob] = useState<HrJob>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    setJob(undefined);
    void hrApi.job(jobId).then((data) => {
      if (active) setJob(data);
    }).catch((requestError: unknown) => {
      if (active) setError(errorMessage(requestError));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [jobId, retry]));

  // The native stack header handles the top safe area and the back button.
  if (loading) return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.page}>
    <View style={styles.center}><ActivityIndicator color={colors.light.brand.secondary} size="large" /><Text style={styles.label}>Đang tải tin tuyển dụng…</Text></View>
  </SafeAreaView>;
  if (error || !job) return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.page}>
    <View style={styles.center}><StatePanel title="Không tải được chi tiết" description={error || 'Không tìm thấy tin tuyển dụng.'} actionLabel="Thử lại" onAction={() => setRetry((value) => value + 1)} /></View>
  </SafeAreaView>;

  const requirements = job.requirements ?? {};
  const education = object(requirements.education);
  const gpa = object(requirements.minimumGpa);
  const languages = Array.isArray(requirements.languages) ? requirements.languages.map((value) => {
    const language = object(value);
    return [text(language.name), text(language.minimumLevel)].filter(Boolean).join(' · ');
  }).filter(Boolean) : [];
  const requiredSkills = strings(requirements.requiredSkills);
  const preferredSkills = strings(requirements.preferredSkills);
  const majors = strings(education.preferredMajors);
  const benefits = strings(job.benefits);
  const hasRequirements = requiredSkills.length || preferredSkills.length || text(education.minimumDegree) || majors.length || typeof gpa.value === 'number' || languages.length;
  const experience = job.experience;
  const years = experience?.minYears != null && experience.maxYears != null
    ? `${experience.minYears} – ${experience.maxYears} năm`
    : experience?.minYears != null ? `Từ ${experience.minYears} năm`
      : experience?.maxYears != null ? `Tối đa ${experience.maxYears} năm` : '';
  const location = [job.location?.address, job.location?.city, job.location?.country].map(text).filter(Boolean).join(', ');

  return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.page}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {job.status ? <Text style={[styles.badge, job.status === 'published' && styles.published, job.status === 'draft' && styles.draft]}>{statusLabels[job.status] ?? job.status}</Text> : null}
        <Text selectable style={styles.title}>{job.title || 'Tin tuyển dụng'}</Text>
        <Field label="Danh mục / Lĩnh vực" value={text(job.category)} />
        <Field label="Địa điểm làm việc" value={location} />
        {typeof job.location?.remote === 'boolean' ? <Field label="Làm việc từ xa" value={job.location.remote ? 'Có' : 'Không'} /> : null}
        <Field label="Hình thức làm việc" value={employmentLabels[job.employmentType] ?? job.employmentType} />
        <Field label="Mức lương" value={salaryLabel(job.salary)} />
      </View>
      {text(job.description) ? <Section title="Mô tả công việc" icon="document-text-outline"><Text selectable style={styles.body}>{job.description}</Text></Section> : null}
      {years || experience?.level ? <Section title="Kinh nghiệm" icon="briefcase-outline">
        <Field label="Số năm kinh nghiệm" value={years} />
        <Field label="Cấp bậc" value={experience?.level ? levelLabels[experience.level] ?? experience.level : ''} />
      </Section> : null}
      {hasRequirements ? <Section title="Yêu cầu ứng viên" icon="school-outline">
        <Tags label="Kỹ năng bắt buộc" values={requiredSkills} />
        <Tags label="Kỹ năng ưu tiên" values={preferredSkills} />
        <Field label="Trình độ tối thiểu" value={text(education.minimumDegree)} />
        <Tags label="Chuyên ngành ưu tiên" values={majors} />
        {typeof gpa.value === 'number' ? <Field label="GPA tối thiểu" value={`${gpa.value}${typeof gpa.scale === 'number' ? ` / ${gpa.scale}` : ''}`} /> : null}
        {languages.length ? <Field label="Ngoại ngữ" value={languages.join('\n')} /> : null}
      </Section> : null}
      {benefits.length ? <Section title="Quyền lợi" icon="gift-outline">
        {benefits.map((benefit, index) => <Text selectable key={index} style={styles.body}>• {benefit}</Text>)}
      </Section> : null}
      {dateTime(job.createdAt) || dateTime(job.deadline) || dateTime(job.updatedAt) ? <Section title="Thông tin thời gian" icon="calendar-outline">
        <Field label="Ngày tạo tin" value={dateTime(job.createdAt)} />
        <Field label="Hạn ứng tuyển" value={dateTime(job.deadline)} />
        <Field label="Cập nhật gần nhất" value={dateTime(job.updatedAt)} />
      </Section> : null}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.light.background.primary },
  content: { gap: 14, padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  card: { backgroundColor: colors.light.background.surface, borderColor: colors.light.border.subtle, borderWidth: 1, borderRadius: 16, padding: spacing.md, gap: 16 },
  title: { color: colors.light.text.primary, fontSize: 22, lineHeight: 30, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomColor: colors.light.border.subtle, borderBottomWidth: 1, paddingBottom: 12 },
  sectionTitle: { flex: 1, color: colors.light.text.primary, fontSize: 17, fontWeight: '700' },
  field: { gap: 5 },
  label: { color: colors.light.text.secondary, fontSize: 13, lineHeight: 19 },
  body: { color: colors.light.text.primary, fontSize: 15, lineHeight: 24 },
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F1F5F9', color: '#475569', fontSize: 12, fontWeight: '700' },
  published: { backgroundColor: '#ECFDF5', color: '#047857' },
  draft: { backgroundColor: '#FFF7ED', color: '#B45309' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexShrink: 1, color: colors.light.brand.secondary, backgroundColor: colors.light.brand.accent, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, lineHeight: 20 },
});
