import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockHrDashboard } from '../api/mockHrDashboard';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { HrTabParamList } from '../../../../types/navigation';

type Period = '7 ngày qua' | '30 ngày qua' | 'Quý này';

const periods: Period[] = ['7 ngày qua', '30 ngày qua', 'Quý này'];
const departmentColors = [
  colors.light.brand.secondary,
  colors.light.status.info,
  colors.light.status.warning,
  '#C4C8D0',
  '#8B5CF6',
  colors.light.status.success,
];

const recentApplicants = [
  {
    name: 'Nguyễn Hoàng Long',
    role: 'Senior Fullstack Engineer',
    time: '14 phút trước',
    skills: ['ReactJS', 'Python', '+4'],
    initials: 'NL',
    avatarColor: '#DCEBFA',
  },
  {
    name: 'Trần Minh Anh',
    role: 'Lead Product Designer (UI/UX)',
    time: '1 giờ trước',
    skills: ['Figma', 'Design System', '+2'],
    initials: 'MA',
    avatarColor: '#F6E8DC',
  },
  {
    name: 'Phạm Quốc Bảo',
    role: 'Data & Cloud Specialist',
    time: '3 giờ trước',
    skills: ['AWS', 'Spark', '+3'],
    initials: 'QB',
    avatarColor: '#DCEFEA',
  },
];

const numberFormatter = new Intl.NumberFormat('vi-VN');

export function HrDashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<HrTabParamList>>();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7 ngày qua');
  const dashboard = mockHrDashboard;
  const totalDepartmentJobs = dashboard.jobsByDivision.reduce(
    (total, department) => total + department.count,
    0,
  );
  const openApplications = () => navigation.navigate('HrApplications');

  const metrics = [
    {
      icon: 'briefcase-outline' as const,
      value: dashboard.totalOpenJobs,
      label: 'Tin đang tuyển',
      badge: '+2 tin',
      tone: 'blue' as const,
    },
    {
      icon: 'document-text-outline' as const,
      value: dashboard.totalApplications,
      label: 'Hồ sơ ứng tuyển mới',
      badge: '+18%',
      tone: 'blue' as const,
    },
    {
      icon: 'calendar-outline' as const,
      value: dashboard.interestedCandidates,
      label: 'Ứng viên quan tâm',
      badge: 'Hôm nay',
      tone: 'warning' as const,
    },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.brandGroup}>
          <Text style={styles.brand}>KONEK</Text>
          <Text style={styles.roleBadge}>NHÀ TUYỂN DỤNG</Text>
        </View>
        <View style={styles.topBarActions}>
          <View accessible accessibilityLabel="Thông báo mới" style={styles.notificationButton}>
            <Ionicons
              color={colors.light.text.secondary}
              name="notifications-outline"
              size={22}
            />
            <View style={styles.notificationDot} />
          </View>
          <View style={styles.profileAvatar}>
            <Ionicons color={colors.light.text.inverse} name="person" size={17} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.companyRow}>
          <View style={styles.companyInfo}>
            <View style={styles.companyLogo}>
              <Ionicons color={colors.light.brand.secondary} name="business" size={23} />
            </View>
            <View style={styles.companyCopy}>
              <View style={styles.companyNameRow}>
                <Text numberOfLines={1} style={styles.companyName}>FPT Software</Text>
                <Ionicons
                  color={colors.light.brand.secondary}
                  name="checkmark-circle"
                  size={17}
                />
              </View>
              <Text numberOfLines={1} style={styles.companySubtitle}>
                Hệ thống tuyển dụng thông minh KONEK AI
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Bộ lọc nâng cao"
            accessibilityRole="button"
            onPress={() => Alert.alert('Bộ lọc nâng cao', 'Tùy chọn lọc chi tiết sẽ sớm khả dụng.')}
            style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.light.text.secondary}
              name="options-outline"
              size={20}
            />
          </Pressable>
        </View>

        <View style={styles.periodSelector}>
          {periods.map((period) => {
            const selected = period === selectedPeriod;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[styles.periodButton, selected && styles.periodButtonSelected]}
              >
                <Text style={[styles.periodText, selected && styles.periodTextSelected]}>
                  {period}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.metrics}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <View style={styles.metricTop}>
                <View
                  style={[
                    styles.metricIcon,
                    metric.tone === 'warning' && styles.metricIconWarning,
                  ]}
                >
                  <Ionicons
                    color={colors.light.brand.secondary}
                    name={metric.icon}
                    size={20}
                  />
                </View>
                <Text
                  style={[
                    styles.metricBadge,
                    metric.tone === 'warning' && styles.metricBadgeWarning,
                  ]}
                >
                  {metric.badge}
                </Text>
              </View>
              <Text style={styles.metricValue}>{numberFormatter.format(metric.value)}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert('Tạo tin tuyển dụng', 'Tính năng tạo tin tuyển dụng sẽ sớm khả dụng.')}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
          >
            <Ionicons color={colors.light.text.inverse} name="add-circle-outline" size={20} />
            <Text style={styles.primaryActionText}>Tạo tin tuyển</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('HrInterviews')}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.light.brand.secondary}
              name="calendar-outline"
              size={20}
            />
            <Text style={styles.secondaryActionText}>Lịch phỏng vấn</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelHeadingCopy}>
              <Text style={styles.panelTitle}>Phân bổ việc làm theo bộ phận</Text>
              <Text style={styles.panelSubtitle}>
                Tổng số {numberFormatter.format(dashboard.totalOpenJobs)} vị trí mở đang nhận hồ sơ
              </Text>
            </View>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={openApplications}>
              <Text style={styles.linkText}>Chi tiết</Text>
            </Pressable>
          </View>

          {dashboard.jobsByDivision.length > 0 ? (
            <>
              <View style={styles.distributionBar}>
                {dashboard.jobsByDivision.map((department, index) => (
                  <View
                    key={department.name}
                    style={{
                      backgroundColor: departmentColors[index % departmentColors.length],
                      flex: department.count,
                    }}
                  />
                ))}
              </View>
              <View style={styles.departmentList}>
                {dashboard.jobsByDivision.map((department, index) => {
                  const percentage = totalDepartmentJobs > 0
                    ? Math.round((department.count / totalDepartmentJobs) * 100)
                    : 0;
                  const color = departmentColors[index % departmentColors.length];
                  return (
                    <View key={department.name} style={styles.departmentRow}>
                      <View style={[styles.departmentDot, { backgroundColor: color }]} />
                      <View style={styles.departmentCopy}>
                        <Text numberOfLines={1} style={styles.departmentName}>
                          {department.name}
                        </Text>
                        <Text style={styles.departmentSubtitle}>
                          {numberFormatter.format(department.count)} vị trí tuyển dụng
                        </Text>
                      </View>
                      <Text style={styles.departmentCount}>
                        {numberFormatter.format(department.applicants ?? 0)} CV
                      </Text>
                      <Text style={styles.departmentPercent}>{percentage}%</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>Chưa có tin tuyển dụng theo bộ phận.</Text>
          )}
        </View>

        <View style={styles.applicantsSection}>
          <View style={styles.applicantsHeader}>
            <View style={styles.applicantsTitleRow}>
              <Text style={styles.sectionTitle}>Ứng viên vừa nộp hồ sơ</Text>
              <View style={styles.newApplicantDot} />
            </View>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={openApplications}>
              <Text style={styles.linkText}>
                Xem tất cả ({numberFormatter.format(dashboard.totalApplications)})
              </Text>
            </Pressable>
          </View>
          <View style={styles.applicantList}>
            {recentApplicants.map((applicant) => (
              <ApplicantCard
                applicant={applicant}
                key={applicant.name}
                onPress={openApplications}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Applicant = (typeof recentApplicants)[number];

function ApplicantCard({
  applicant,
  onPress,
}: {
  applicant: Applicant;
  onPress: () => void;
}) {
  return (
    <View style={styles.applicantCard}>
      <View style={styles.applicantMain}>
        <View style={[styles.applicantAvatar, { backgroundColor: applicant.avatarColor }]}>
          <Text style={styles.applicantInitials}>{applicant.initials}</Text>
        </View>
        <View style={styles.applicantCopy}>
          <View style={styles.applicantNameRow}>
            <Text numberOfLines={1} style={styles.applicantName}>{applicant.name}</Text>
            <Text style={styles.newBadge}>Mới nộp</Text>
          </View>
          <Text numberOfLines={1} style={styles.applicantRole}>{applicant.role}</Text>
          <View style={styles.applicantTimeRow}>
            <Ionicons color={colors.light.text.secondary} name="time-outline" size={13} />
            <Text style={styles.applicantTime}>{applicant.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.applicantFooter}>
        <View style={styles.skills}>
          {applicant.skills.map((skill) => (
            <Text key={skill} style={styles.skillTag}>{skill}</Text>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.profileLink, pressed && styles.pressed]}
        >
          <Text style={styles.linkText}>Xem hồ sơ</Text>
          <Ionicons color={colors.light.brand.secondary} name="chevron-forward" size={15} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background.primary,
  },
  topBar: {
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  brand: {
    color: colors.light.brand.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  roleBadge: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.light.brand.accent,
    color: colors.light.brand.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 7,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.light.background.surface,
    backgroundColor: colors.light.status.danger,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  companyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  companyInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.light.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyCopy: { flex: 1, minWidth: 0, gap: 2 },
  companyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  companyName: {
    flexShrink: 1,
    color: colors.light.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  companySubtitle: { color: colors.light.text.secondary, fontSize: 12 },
  filterButton: {
    width: 40,
    height: 40,
    marginLeft: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.light.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.light.background.surface,
  },
  periodButton: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonSelected: { backgroundColor: colors.light.brand.secondary },
  periodText: { color: colors.light.text.secondary, fontSize: 12, fontWeight: '500' },
  periodTextSelected: { color: colors.light.text.inverse, fontWeight: '700' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 138,
    padding: spacing.md,
    gap: spacing.xs,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.light.border.subtle,
    backgroundColor: colors.light.background.surface,
  },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconWarning: { backgroundColor: '#E2ECFF' },
  metricBadge: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    color: colors.light.status.success,
    backgroundColor: '#E8F8F1',
    fontSize: 11,
    fontWeight: '600',
  },
  metricBadgeWarning: { color: colors.light.status.warning, backgroundColor: '#FFF5E5' },
  metricValue: {
    marginTop: spacing.xs,
    color: colors.light.text.primary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
  },
  metricLabel: { color: colors.light.text.secondary, fontSize: 13, lineHeight: 18 },
  quickActions: { flexDirection: 'row', gap: spacing.sm },
  primaryAction: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.light.brand.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primaryActionText: { color: colors.light.text.inverse, fontSize: 13, fontWeight: '700' },
  secondaryAction: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.light.border.subtle,
    backgroundColor: colors.light.background.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  secondaryActionText: { color: colors.light.text.primary, fontSize: 13, fontWeight: '600' },
  panel: {
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.light.border.subtle,
    backgroundColor: colors.light.background.surface,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  panelHeadingCopy: { flex: 1, gap: 2 },
  panelTitle: { color: colors.light.text.primary, fontSize: 16, fontWeight: '700' },
  panelSubtitle: { color: colors.light.text.secondary, fontSize: 12 },
  linkText: { color: colors.light.brand.secondary, fontSize: 12, fontWeight: '700' },
  distributionBar: {
    height: 11,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: colors.light.background.subtle,
    flexDirection: 'row',
  },
  departmentList: { gap: spacing.sm },
  departmentRow: {
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    backgroundColor: '#F8FAFD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  departmentDot: { width: 10, height: 10, borderRadius: 5 },
  departmentCopy: { flex: 1, minWidth: 0, gap: 2 },
  departmentName: { color: colors.light.text.primary, fontSize: 13, fontWeight: '600' },
  departmentSubtitle: { color: colors.light.text.secondary, fontSize: 11 },
  departmentCount: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    color: colors.light.brand.secondary,
    backgroundColor: '#E7F2FF',
    fontSize: 10,
    fontWeight: '600',
  },
  departmentPercent: {
    minWidth: 25,
    color: colors.light.text.primary,
    fontSize: 11,
    textAlign: 'right',
  },
  emptyText: { color: colors.light.text.secondary, fontSize: 13 },
  applicantsSection: { gap: spacing.sm },
  applicantsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  applicantsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionTitle: { color: colors.light.text.primary, fontSize: 16, fontWeight: '700' },
  newApplicantDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.status.danger,
  },
  applicantList: { gap: spacing.sm },
  applicantCard: {
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.light.border.subtle,
    backgroundColor: colors.light.background.surface,
  },
  applicantMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  applicantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantInitials: { color: colors.light.brand.primary, fontSize: 13, fontWeight: '700' },
  applicantCopy: { flex: 1, minWidth: 0, gap: 3 },
  applicantNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  applicantName: { flexShrink: 1, color: colors.light.text.primary, fontSize: 14, fontWeight: '700' },
  newBadge: {
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    color: colors.light.status.success,
    backgroundColor: '#E8F8F1',
    fontSize: 10,
    fontWeight: '600',
  },
  applicantRole: { color: colors.light.text.secondary, fontSize: 12 },
  applicantTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  applicantTime: { color: colors.light.text.secondary, fontSize: 11 },
  applicantFooter: {
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#F8FAFD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  skills: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 5 },
  skillTag: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    color: colors.light.text.primary,
    backgroundColor: colors.light.background.surface,
    fontSize: 10,
  },
  profileLink: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 2 },
  pressed: { opacity: 0.75 },
});
