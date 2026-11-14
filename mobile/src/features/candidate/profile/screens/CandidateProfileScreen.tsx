import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography } from '../../../../theme';
import { resumeApi } from '../../resumes/api/resumeApi';
import type { CandidateCv } from '../../resumes/types/resume.types';
import { useCandidateProfile } from '../hooks/useCandidateProfile';
import type { CandidateApplication, CandidateProfile } from '../types/profile.types';

const palette = colors.light;

const statusLabels: Record<string, string> = {
  applied: 'Đã ứng tuyển',
  reviewing: 'Đang xem xét',
  shortlisted: 'Qua vòng hồ sơ',
  interview_scheduled: 'Đã xếp lịch',
  accepted: 'Đã nhận việc',
  rejected: 'Chưa phù hợp',
  withdrawn: 'Đã rút đơn',
  active: 'Đang hoạt động',
};

const cvParseStatusLabels: Record<string, string> = {
  pending: 'Chờ phân tích',
  processing: 'Đang phân tích',
  parsed: 'Đã phân tích',
  completed: 'Đã phân tích',
  failed: 'Phân tích lỗi',
};

function formatDate(value?: string | null, withTime = false): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

function initials(name?: string | null): string {
  const value = name?.trim();
  return value ? value.split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase() : '?';
}

function SectionTitle({
  icon,
  title,
  meta,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta?: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionTitleRow}>
        <Ionicons color={palette.brand.secondary} name={icon} size={18} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
    </View>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function ProfileEditor({
  profile,
  visible,
  saving,
  onClose,
  onSave,
}: {
  profile: CandidateProfile | null;
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: { fullName: string; phone: string; location: { city: string; country: string } }) => Promise<unknown>;
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setFullName(profile?.fullName ?? '');
    setPhone(profile?.phone ?? '');
    setCity(profile?.location?.city ?? '');
    setCountry(profile?.location?.country ?? '');
    setError(null);
  }, [profile, visible]);

  const submit = async () => {
    if (!fullName.trim()) {
      setError('Họ tên không được để trống.');
      return;
    }
    try {
      await onSave({
        fullName: fullName.trim(),
        phone: phone.trim(),
        location: { city: city.trim(), country: country.trim() },
      });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu hồ sơ.');
    }
  };

  const fields = [
    { label: 'Họ và tên', value: fullName, setValue: setFullName },
    { label: 'Số điện thoại', value: phone, setValue: setPhone, phone: true },
    { label: 'Thành phố', value: city, setValue: setCity },
    { label: 'Quốc gia', value: country, setValue: setCountry },
  ];

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin cá nhân</Text>
            <Pressable accessibilityLabel="Đóng" hitSlop={10} onPress={onClose}>
              <Ionicons color={palette.text.primary} name="close" size={24} />
            </Pressable>
          </View>
          {fields.map((field) => (
            <View key={field.label} style={styles.field}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                autoCapitalize={field.phone ? 'none' : 'words'}
                keyboardType={field.phone ? 'phone-pad' : 'default'}
                onChangeText={field.setValue}
                placeholder={`Nhập ${field.label.toLowerCase()}`}
                placeholderTextColor={palette.text.secondary}
                style={styles.input}
                value={field.value}
              />
            </View>
          ))}
          {error ? <Text style={styles.formError}>{error}</Text> : null}
          <View style={styles.modalActions}>
            <Pressable disabled={saving} onPress={onClose} style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Huỷ</Text>
            </Pressable>
            <Pressable disabled={saving} onPress={submit} style={styles.primaryButton}>
              {saving ? (
                <ActivityIndicator color={palette.text.inverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function CandidateProfileScreen() {
  const {
    data,
    loading,
    refreshing,
    saving,
    busyId,
    parsingCvId,
    errors,
    feedback,
    refresh,
    updateProfile,
    withdrawApplication,
    deleteCv,
    parseCv,
    setFeedback,
  } = useCandidateProfile();
  const [editing, setEditing] = useState(false);
  const [openingCvId, setOpeningCvId] = useState<string | null>(null);
  const hasFocused = useRef(false);
  const profile = data.profile;
  const stats = data.stats;
  const applications = data.applications?.content ?? [];
  const cvs = data.cvs?.content ?? [];
  const career = data.career;
  const place = [profile?.location?.city, profile?.location?.country].filter(Boolean).join(', ');

  useFocusEffect(useCallback(() => {
    if (hasFocused.current) void refresh();
    else hasFocused.current = true;
  }, [refresh]));

  const openCv = async (cv: CandidateCv) => {
    setOpeningCvId(cv._id);
    setFeedback(null);
    try {
      await resumeApi.openResume(cv);
    } catch (error) {
      setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Không thể mở CV.' });
    } finally {
      setOpeningCvId(null);
    }
  };

  const confirmDeleteCv = (cv: CandidateCv) => {
    Alert.alert('Xóa CV?', `CV “${cv.title}” sẽ bị xóa khỏi tài khoản.`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deleteCv(cv._id).catch((error) => setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Không thể xóa CV.' })),
      },
    ]);
  };

  const confirmWithdraw = (application: CandidateApplication) => {
    Alert.alert('Rút đơn ứng tuyển?', 'Đơn vẫn được giữ trong lịch sử sau khi rút.', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Rút đơn',
        style: 'destructive',
        onPress: () => withdrawApplication(application._id).catch((error) => setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Không thể rút đơn.' })),
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingState}>
          <ActivityIndicator color={palette.brand.secondary} size="large" />
          <Text style={styles.loadingText}>Đang tải trang cá nhân…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.brandMark}>
          <MaterialCommunityIcons color={palette.text.inverse} name="account-network" size={19} />
        </View>
        <View>
          <Text style={styles.topBarTitle}>Cá nhân</Text>
          <Text style={styles.topBarSubtitle}>KONEK TALENT</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={palette.brand.secondary} />}
        showsVerticalScrollIndicator={false}
      >
        {errors.length ? (
          <View accessibilityRole="alert" style={styles.errorBanner}>
            <Ionicons color={palette.status.warning} name="alert-circle-outline" size={19} />
            <View style={styles.flexOne}>
              <Text style={styles.errorBannerTitle}>Một số dữ liệu chưa tải được</Text>
              <Text style={styles.errorBannerText}>{errors[0]}</Text>
            </View>
            <Pressable hitSlop={8} onPress={refresh}>
              <Ionicons color={palette.brand.secondary} name="refresh" size={20} />
            </Pressable>
          </View>
        ) : null}

        {feedback ? (
          <View
            accessibilityRole={feedback.tone === 'error' ? 'alert' : undefined}
            style={[styles.feedbackBanner, feedback.tone === 'error' && styles.feedbackBannerError]}
          >
            <Ionicons
              color={feedback.tone === 'error' ? palette.status.danger : palette.status.success}
              name={feedback.tone === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={18}
            />
            <Text style={[styles.feedbackText, feedback.tone === 'error' && styles.feedbackTextError]}>
              {feedback.message}
            </Text>
          </View>
        ) : null}

        <View style={styles.profileCard}>
          <View style={styles.profileHero}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{initials(profile?.fullName)}</Text>
              </View>
            )}
            <View style={styles.profileMain}>
              <View style={styles.nameRow}>
                <Text numberOfLines={2} style={styles.profileName}>
                  {profile?.fullName || 'Chưa cập nhật họ tên'}
                </Text>
                {profile?.emailVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons color={palette.brand.secondary} name="checkmark-circle" size={13} />
                    <Text style={styles.verifiedText}>Đã xác thực</Text>
                  </View>
                ) : null}
              </View>
              {profile?.accountStatus ? (
                <View style={styles.accountStatus}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.accountStatusText}>{statusLabels[profile.accountStatus] || profile.accountStatus}</Text>
                </View>
              ) : null}
            </View>
            <Pressable accessibilityLabel="Chỉnh sửa hồ sơ" hitSlop={8} onPress={() => setEditing(true)} style={styles.editIconButton}>
              <Ionicons color={palette.text.secondary} name="pencil" size={16} />
            </Pressable>
          </View>
          <View style={styles.factWrap}>
            {profile?.email ? <Fact icon="mail-outline" value={profile.email} /> : null}
            {profile?.phone ? <Fact icon="call-outline" value={profile.phone} /> : null}
            {place ? <Fact icon="location-outline" value={place} /> : null}
          </View>
          {profile ? <Text style={styles.updatedText}>Cập nhật gần nhất: {formatDate(profile.updatedAt) || '—'}</Text> : null}
        </View>

        {stats ? (
          <View style={styles.statsRow}>
            <Stat icon="document-text-outline" label="CV đã tải" value={stats.cvCount} />
            <Stat icon="business-outline" label="Đã ứng tuyển" value={stats.applicationCount} />
            <Stat accent icon="calendar-outline" label="Phỏng vấn tới" value={stats.upcomingInterviewCount} />
          </View>
        ) : null}

        {stats ? (
          <View style={styles.segmentBar}>
            <View style={[styles.segment, styles.segmentActive]}><Text style={styles.segmentActiveText}>CV ({stats.cvCount})</Text></View>
            <View style={styles.segment}><Text style={styles.segmentText}>Ứng tuyển ({stats.applicationCount})</Text></View>
            <View style={styles.segment}><Text style={styles.segmentText}>Kỹ năng ({career?.skills.length ?? 0})</Text></View>
          </View>
        ) : null}

        <SectionTitle icon="folder-open-outline" meta={`${data.cvs?.totalElements ?? 0} bản ghi`} title="CV đã lưu & Đánh giá ATS" />
        {cvs.length ? cvs.map((cv) => {
          const parseStatus = cv.parseInfo?.status?.toLowerCase();
          const isParsing = parsingCvId === cv._id;
          const parseCompleted = parseStatus === 'completed' || parseStatus === 'parsed';
          const parseProcessing = parseStatus === 'processing';
          const parseFailed = parseStatus === 'failed';
          const canParse = !parseCompleted && !parseProcessing;
          const parseLabel = isParsing
            ? 'Đang phân tích'
            : cvParseStatusLabels[parseStatus || 'pending'] || cv.parseInfo?.status;

          return <View key={cv._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.pdfBox}><MaterialCommunityIcons color={palette.status.danger} name="file-pdf-box" size={27} /></View>
              <View style={styles.flexOne}>
                <Text numberOfLines={2} style={styles.cardTitle}>{cv.title}</Text>
                <Text numberOfLines={1} style={styles.cardMeta}>{cv.source?.fileName || cv.source?.type || 'Không có tên tệp'}</Text>
              </View>
              <View style={[
                styles.infoBadge,
                parseCompleted && styles.infoBadgeSuccess,
                parseFailed && styles.infoBadgeError,
              ]}>
                <Text style={[
                  styles.infoBadgeText,
                  parseCompleted && styles.infoBadgeTextSuccess,
                  parseFailed && styles.infoBadgeTextError,
                ]}>{parseLabel}</Text>
              </View>
            </View>
            {cv.skills?.length ? <View style={styles.chipRow}>{cv.skills.slice(0, 4).map((skill) => <Text key={`${cv._id}-${skill.name}`} style={styles.chip}>{skill.name}</Text>)}</View> : null}
            {parseFailed ? <Text accessibilityRole="alert" style={styles.cvParseError}>AI chưa thể đọc CV này. Bạn có thể thử lại.</Text> : null}
            <View style={styles.actionRow}>
              {cv.canViewFile ? (
                <Pressable disabled={openingCvId === cv._id} onPress={() => openCv(cv)} style={styles.softButton}>
                  {openingCvId === cv._id ? <ActivityIndicator color={palette.brand.secondary} size="small" /> : <Ionicons color={palette.brand.secondary} name="eye-outline" size={16} />}
                  <Text style={styles.softButtonText}>{openingCvId === cv._id ? 'Đang mở…' : 'Xem CV'}</Text>
                </Pressable>
              ) : null}
              {canParse ? (
                <Pressable
                  disabled={Boolean(parsingCvId)}
                  onPress={() => parseCv(cv._id)}
                  style={[styles.aiButton, parsingCvId && !isParsing && styles.disabledButton]}
                >
                  {isParsing ? <ActivityIndicator color={palette.text.inverse} size="small" /> : <Ionicons color={palette.text.inverse} name="sparkles-outline" size={16} />}
                  <Text style={styles.aiButtonText}>{parseFailed ? 'Thử lại' : 'Phân tích AI'}</Text>
                </Pressable>
              ) : null}
              {cv.canDelete ? (
                <Pressable disabled={busyId === cv._id} onPress={() => confirmDeleteCv(cv)} style={styles.dangerButton}>
                  <Ionicons color={palette.feedback.dangerText} name="trash-outline" size={16} />
                  <Text style={styles.dangerButtonText}>Xóa</Text>
                </Pressable>
              ) : cv.deleteBlockedReason ? <Text style={styles.blockedReason}>CV đang được sử dụng</Text> : null}
            </View>
          </View>
        }) : <EmptyBlock text="Bạn chưa có CV nào trong tài khoản." />}

        {stats?.avgMatchScore !== null && stats?.avgMatchScore !== undefined ? (
          <View style={styles.scoreCard}>
            <View><Text style={styles.scoreLabel}>Điểm ATS trung bình</Text><Text style={styles.scoreHint}>{stats.analyzedApplicationCount} đơn đã phân tích</Text></View>
            <Text style={styles.scoreValue}>{stats.avgMatchScore.toFixed(1)}/100</Text>
          </View>
        ) : null}

        <SectionTitle icon="checkbox-outline" meta={`${data.applications?.totalElements ?? 0} vị trí`} title="Công ty & Vị trí đã ứng tuyển" />
        {applications.length ? applications.map((application) => (
          <View key={application._id} style={styles.card}>
            <View style={styles.cardHeader}>
              {application.company?.logoUrl ? (
                <Image source={{ uri: application.company.logoUrl }} style={styles.companyLogo} />
              ) : (
                <View style={styles.companyFallback}><Ionicons color={palette.brand.secondary} name="business" size={20} /></View>
              )}
              <View style={styles.flexOne}>
                <Text numberOfLines={2} style={styles.cardTitle}>{application.job?.title || 'Vị trí không còn tồn tại'}</Text>
                <Text numberOfLines={2} style={styles.cardMeta}>{[application.company?.name, application.company?.industry].filter(Boolean).join(' · ') || 'Công ty không còn tồn tại'}</Text>
              </View>
              <View style={styles.statusBadge}><Text style={styles.statusBadgeText}>{statusLabels[application.status] || application.status}</Text></View>
            </View>
            <Text style={styles.cardMeta}>Ngày nộp: {formatDate(application.appliedAt) || '—'}</Text>
            {application.aiAnalysis ? <Text style={styles.analysisText}>ATS Match: {application.aiAnalysis.overallScore}/100 · {application.aiAnalysis.recommendation}</Text> : null}
            {application.interview ? (
              <View style={styles.interviewBox}>
                <Ionicons color={palette.status.success} name="calendar-outline" size={18} />
                <View style={styles.flexOne}>
                  <Text style={styles.interviewTitle}>{formatDate(application.interview.scheduledAt, true)} · {application.interview.durationMinutes} phút</Text>
                  <Text style={styles.cardMeta}>{application.interview.mode === 'online' ? 'Phỏng vấn trực tuyến' : application.interview.location || 'Phỏng vấn trực tiếp'}</Text>
                </View>
                {application.interview.meetingLink ? (
                  <Pressable onPress={() => Linking.openURL(application.interview!.meetingLink!)} style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Tham gia</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {application.canWithdraw ? (
              <Pressable disabled={busyId === application._id} onPress={() => confirmWithdraw(application)} style={styles.withdrawButton}>
                <Text style={styles.withdrawText}>{busyId === application._id ? 'Đang xử lý…' : 'Rút đơn ứng tuyển'}</Text>
              </Pressable>
            ) : null}
          </View>
        )) : <EmptyBlock text="Bạn chưa ứng tuyển vị trí nào." />}

        <SectionTitle icon="ribbon-outline" title="Kinh nghiệm & Kỹ năng từ CV" />
        <View style={styles.card}>
          {career?.cv ? <Text style={styles.cardMeta}>Nguồn: {career.cv.title} · {career.cv.fileName}</Text> : null}
          {career?.skills.length ? (
            <View style={styles.chipRow}>{career.skills.map((skill) => <Text key={`${skill.category}-${skill.name}`} style={styles.skillChip}>{skill.name}{skill.yearsOfExperience !== null ? ` ` : ''}</Text>)}</View>
          ) : <Text style={styles.cardMeta}>CV nguồn chưa có dữ liệu kỹ năng.</Text>}
          {career?.experience.map((item, index) => (
            <CareerRow icon="briefcase-outline" key={`${item.company}-${item.position}-${index}`} meta={[item.company, item.startDate, item.current ? 'Hiện tại' : item.endDate].filter(Boolean).join(' · ')} title={item.position || 'Chưa có chức danh'} />
          ))}
          {career?.education.map((item, index) => (
            <CareerRow icon="school-outline" key={`${item.institution}-${item.degree}-${index}`} meta={[item.institution, item.startDate, item.endDate, item.gpa ? `GPA ${item.gpa.value}/${item.gpa.scale}` : null].filter(Boolean).join(' · ')} title={[item.degree, item.major].filter(Boolean).join(' · ') || 'Học vấn'} />
          ))}
          {career?.certificates.map((item, index) => (
            <CareerRow icon="medal-outline" key={`${item.name}-${item.issuer}-${index}`} meta={[item.issuer, item.issueDate, item.credentialId].filter(Boolean).join(' · ')} title={item.name || 'Chứng chỉ chưa có tên'} warning />
          ))}
        </View>

        <SectionTitle icon="settings-outline" title="Thông tin tài khoản" />
        <View style={styles.card}>
          <Pressable onPress={() => setEditing(true)} style={styles.settingsRow}>
            <SettingsIcon icon="person-add-outline" />
            <View style={styles.flexOne}><Text style={styles.settingsTitle}>Chỉnh sửa thông tin cá nhân</Text><Text style={styles.cardMeta}>Họ tên, số điện thoại và địa chỉ</Text></View>
            <Ionicons color={palette.text.secondary} name="chevron-forward" size={18} />
          </Pressable>
          {profile ? (
            <>
              <View style={styles.divider} />
              <View style={styles.settingsRow}><SettingsIcon icon="shield-checkmark-outline" /><View style={styles.flexOne}><Text style={styles.settingsTitle}>Trạng thái tài khoản</Text><Text style={styles.cardMeta}>{statusLabels[profile.accountStatus] || profile.accountStatus} · Email {profile.emailVerified ? 'đã xác thực' : 'chưa xác thực'}</Text></View></View>
              <View style={styles.divider} />
              <View style={styles.settingsRow}><SettingsIcon icon="time-outline" /><View style={styles.flexOne}><Text style={styles.settingsTitle}>Ngày tạo hồ sơ</Text><Text style={styles.cardMeta}>{formatDate(profile.createdAt) || '—'}</Text></View></View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <ProfileEditor onClose={() => setEditing(false)} onSave={updateProfile} profile={profile} saving={saving} visible={editing} />
    </SafeAreaView>
  );
}

function Fact({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return <View style={styles.factPill}><Ionicons color={palette.brand.secondary} name={icon} size={13} /><Text numberOfLines={1} style={styles.factText}>{value}</Text></View>;
}

function Stat({ icon, label, value, accent }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; accent?: boolean }) {
  return <View style={styles.statCard}><View style={styles.statIcon}><Ionicons color={palette.brand.secondary} name={icon} size={18} /></View><Text style={[styles.statValue, accent && styles.warningText]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function CareerRow({ icon, title, meta, warning }: { icon: keyof typeof Ionicons.glyphMap; title: string; meta: string; warning?: boolean }) {
  return <View style={styles.careerRow}><Ionicons color={warning ? palette.status.warning : palette.brand.secondary} name={icon} size={18} /><View style={styles.flexOne}><Text style={styles.cardTitle}>{title}</Text>{meta ? <Text style={styles.cardMeta}>{meta}</Text> : null}</View></View>;
}

function SettingsIcon({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return <View style={styles.settingsIcon}><Ionicons color={palette.text.primary} name={icon} size={18} /></View>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.background.primary, flex: 1 },
  flexOne: { flex: 1 },
  topBar: { alignItems: 'center', backgroundColor: palette.background.surface, borderBottomColor: palette.border.subtle, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 58, paddingHorizontal: spacing.md },
  brandMark: { alignItems: 'center', backgroundColor: palette.brand.secondary, borderRadius: radii.md, height: 34, justifyContent: 'center', width: 34, ...shadows.card },
  topBarTitle: { ...typography.titleMedium, color: palette.text.primary },
  topBarSubtitle: { ...typography.bodySmall, color: palette.text.secondary, fontSize: 9, letterSpacing: 0.8 },
  content: { gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.xl },
  loadingState: { alignItems: 'center', flex: 1, gap: spacing.sm, justifyContent: 'center' },
  loadingText: { ...typography.bodyMedium, color: palette.text.secondary },
  errorBanner: { alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: 12 },
  errorBannerTitle: { ...typography.labelSmall, color: palette.text.primary },
  errorBannerText: { ...typography.bodySmall, color: palette.text.secondary },
  feedbackBanner: { alignItems: 'center', backgroundColor: palette.feedback.successBackground, borderRadius: radii.lg, flexDirection: 'row', gap: spacing.sm, padding: 12 },
  feedbackText: { ...typography.bodySmall, color: palette.feedback.successText, flex: 1 },
  feedbackBannerError: { backgroundColor: palette.feedback.dangerBackground },
  feedbackTextError: { color: palette.feedback.dangerText },
  profileCard: { backgroundColor: palette.background.surface, borderColor: palette.border.subtle, borderRadius: radii.xl, borderWidth: 1, padding: spacing.md, ...shadows.card },
  profileHero: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  avatar: { borderRadius: radii.lg, height: 58, width: 58 },
  avatarFallback: { alignItems: 'center', backgroundColor: palette.brand.accent, borderRadius: radii.lg, height: 58, justifyContent: 'center', width: 58 },
  avatarFallbackText: { ...typography.titleMedium, color: palette.brand.secondary },
  profileMain: { flex: 1, gap: 6 },
  nameRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  profileName: { ...typography.titleMedium, color: palette.text.primary, flexShrink: 1 },
  verifiedBadge: { alignItems: 'center', backgroundColor: palette.brand.accent, borderRadius: radii.full, flexDirection: 'row', gap: 3, paddingHorizontal: 7, paddingVertical: 3 },
  verifiedText: { ...typography.bodySmall, color: palette.brand.secondary, fontSize: 10 },
  accountStatus: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: palette.background.subtle, borderRadius: radii.full, flexDirection: 'row', gap: 6, paddingHorizontal: 9, paddingVertical: 5 },
  onlineDot: { backgroundColor: palette.status.success, borderRadius: radii.full, height: 6, width: 6 },
  accountStatusText: { ...typography.bodySmall, color: palette.text.secondary },
  editIconButton: { alignItems: 'center', backgroundColor: palette.background.subtle, borderRadius: radii.full, height: 32, justifyContent: 'center', width: 32 },
  factWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  factPill: { alignItems: 'center', backgroundColor: palette.surface.containerLow, borderRadius: radii.md, flexDirection: 'row', gap: 4, maxWidth: '100%', paddingHorizontal: 9, paddingVertical: 5 },
  factText: { ...typography.bodySmall, color: palette.text.secondary, flexShrink: 1 },
  updatedText: { ...typography.bodySmall, color: palette.text.secondary, marginTop: 10 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { alignItems: 'center', backgroundColor: palette.background.surface, borderColor: palette.border.subtle, borderRadius: radii.lg, borderWidth: 1, flex: 1, minWidth: 0, paddingHorizontal: 6, paddingVertical: 12 },
  statIcon: { alignItems: 'center', backgroundColor: palette.brand.accent, borderRadius: radii.full, height: 30, justifyContent: 'center', marginBottom: 4, width: 30 },
  statValue: { ...typography.titleMedium, color: palette.text.primary },
  statLabel: { ...typography.bodySmall, color: palette.text.secondary, fontSize: 10, textAlign: 'center' },
  warningText: { color: palette.status.warning },
  segmentBar: { backgroundColor: palette.surface.containerLow, borderRadius: radii.lg, flexDirection: 'row', padding: 4 },
  segment: { alignItems: 'center', borderRadius: radii.md, flex: 1, justifyContent: 'center', minHeight: 34, paddingHorizontal: 4 },
  segmentActive: { backgroundColor: palette.brand.secondary },
  segmentText: { ...typography.bodySmall, color: palette.text.secondary, textAlign: 'center' },
  segmentActiveText: { ...typography.labelSmall, color: palette.text.inverse, textAlign: 'center' },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, minHeight: 30 },
  sectionTitleRow: { alignItems: 'center', flexDirection: 'row', flex: 1, gap: 6 },
  sectionTitle: { ...typography.titleSmall, color: palette.text.primary, flexShrink: 1 },
  sectionMeta: { ...typography.bodySmall, color: palette.text.secondary },
  card: { backgroundColor: palette.background.surface, borderColor: palette.border.subtle, borderRadius: radii.lg, borderWidth: 1, gap: 10, padding: 12, ...shadows.card },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  cardTitle: { ...typography.labelMedium, color: palette.text.primary },
  cardMeta: { ...typography.bodySmall, color: palette.text.secondary },
  pdfBox: { alignItems: 'center', backgroundColor: palette.feedback.dangerBackground, borderRadius: radii.md, height: 40, justifyContent: 'center', width: 40 },
  infoBadge: { backgroundColor: palette.brand.accent, borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 4 },
  infoBadgeText: { ...typography.bodySmall, color: palette.brand.secondary, fontSize: 10 },
  infoBadgeSuccess: { backgroundColor: palette.feedback.successBackground },
  infoBadgeTextSuccess: { color: palette.feedback.successText },
  infoBadgeError: { backgroundColor: palette.feedback.dangerBackground },
  infoBadgeTextError: { color: palette.feedback.dangerText },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { ...typography.bodySmall, backgroundColor: palette.surface.containerLow, borderRadius: radii.full, color: palette.text.secondary, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
  skillChip: { ...typography.bodySmall, backgroundColor: palette.surface.containerLow, borderRadius: radii.full, color: palette.text.primary, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  actionRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  softButton: { alignItems: 'center', backgroundColor: palette.surface.containerLow, borderRadius: radii.md, flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 36, paddingHorizontal: 12 },
  softButtonText: { ...typography.labelSmall, color: palette.brand.secondary },
  aiButton: { alignItems: 'center', backgroundColor: palette.brand.secondary, borderRadius: radii.md, flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 36, paddingHorizontal: 12 },
  aiButtonText: { ...typography.labelSmall, color: palette.text.inverse },
  disabledButton: { opacity: 0.58 },
  cvParseError: { ...typography.bodySmall, color: palette.feedback.dangerText },
  dangerButton: { alignItems: 'center', backgroundColor: palette.feedback.dangerBackground, borderRadius: radii.md, flexDirection: 'row', gap: 5, minHeight: 36, paddingHorizontal: 12 },
  dangerButtonText: { ...typography.labelSmall, color: palette.feedback.dangerText },
  blockedReason: { ...typography.bodySmall, color: palette.text.secondary, flex: 1, textAlign: 'right' },
  emptyText: { ...typography.bodyMedium, backgroundColor: palette.background.surface, borderColor: palette.border.subtle, borderRadius: radii.lg, borderWidth: 1, color: palette.text.secondary, padding: spacing.md },
  scoreCard: { alignItems: 'center', backgroundColor: palette.surface.containerLow, borderRadius: radii.lg, flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  scoreLabel: { ...typography.labelMedium, color: palette.text.primary },
  scoreHint: { ...typography.bodySmall, color: palette.text.secondary },
  scoreValue: { ...typography.titleMedium, color: palette.brand.secondary },
  companyLogo: { borderRadius: radii.md, height: 42, width: 42 },
  companyFallback: { alignItems: 'center', backgroundColor: palette.brand.accent, borderRadius: radii.md, height: 42, justifyContent: 'center', width: 42 },
  statusBadge: { backgroundColor: palette.feedback.successBackground, borderRadius: radii.full, maxWidth: 96, paddingHorizontal: 8, paddingVertical: 4 },
  statusBadgeText: { ...typography.bodySmall, color: palette.feedback.successText, fontSize: 10, textAlign: 'center' },
  analysisText: { ...typography.bodySmall, color: palette.brand.secondary },
  interviewBox: { alignItems: 'center', backgroundColor: palette.surface.containerLow, borderRadius: radii.md, flexDirection: 'row', gap: spacing.sm, padding: 10 },
  interviewTitle: { ...typography.labelSmall, color: palette.text.primary },
  joinButton: { backgroundColor: palette.brand.secondary, borderRadius: radii.md, paddingHorizontal: 10, paddingVertical: 7 },
  joinButtonText: { ...typography.labelSmall, color: palette.text.inverse },
  withdrawButton: { alignSelf: 'flex-end', paddingHorizontal: 4, paddingVertical: 6 },
  withdrawText: { ...typography.labelSmall, color: palette.feedback.dangerText },
  careerRow: { alignItems: 'flex-start', borderTopColor: palette.border.subtle, borderTopWidth: 1, flexDirection: 'row', gap: 10, paddingTop: 10 },
  settingsRow: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 54 },
  settingsIcon: { alignItems: 'center', backgroundColor: palette.surface.containerLow, borderRadius: radii.md, height: 36, justifyContent: 'center', width: 36 },
  settingsTitle: { ...typography.labelMedium, color: palette.text.primary },
  divider: { backgroundColor: palette.border.subtle, height: 1 },
  modalBackdrop: { backgroundColor: 'rgba(15, 23, 42, 0.34)', flex: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: palette.background.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, gap: 12, padding: spacing.md, paddingBottom: spacing.xl },
  modalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  modalTitle: { ...typography.titleMedium, color: palette.text.primary },
  field: { gap: 5 },
  fieldLabel: { ...typography.labelSmall, color: palette.text.primary },
  input: { ...typography.bodyMedium, backgroundColor: palette.background.input, borderColor: palette.border.subtle, borderRadius: radii.lg, borderWidth: 1, color: palette.text.primary, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10 },
  formError: { ...typography.bodySmall, color: palette.feedback.dangerText },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  outlineButton: { alignItems: 'center', borderColor: palette.border.subtle, borderRadius: radii.lg, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44 },
  outlineButtonText: { ...typography.labelMedium, color: palette.text.primary },
  primaryButton: { alignItems: 'center', backgroundColor: palette.brand.secondary, borderRadius: radii.lg, flex: 1.5, justifyContent: 'center', minHeight: 44 },
  primaryButtonText: { ...typography.labelMedium, color: palette.text.inverse },
});
