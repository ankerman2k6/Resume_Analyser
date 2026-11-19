import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { JobResponse } from '../types/job.types';

type TabKey = 'desc' | 'req' | 'ben';

type JobDetailTabsProps = {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  job: JobResponse;
};

export const JobDetailTabs: React.FC<JobDetailTabsProps> = ({
  activeTab,
  onSelectTab,
  job,
}) => {
  // Parse description into bullet points or paragraphs
  const descPoints = job.description
    ? job.description.split(/\n+/).filter((s) => s.trim().length > 0)
    : ['Chi tiết trách nhiệm công việc đang được cập nhật.'];

  const requiredSkills = job.requirements?.requiredSkills || [];
  const preferredSkills = job.requirements?.preferredSkills || [];
  const benefits = job.benefits && job.benefits.length > 0
    ? job.benefits
    : ['Chế độ đãi ngộ và phúc lợi theo chính sách của công ty.'];

  return (
    <View style={styles.container}>
      {/* Segmented Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => onSelectTab('desc')}
          style={[styles.tabButton, activeTab === 'desc' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'desc' && styles.tabButtonTextActive]}>
            Mô tả việc làm
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSelectTab('req')}
          style={[styles.tabButton, activeTab === 'req' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'req' && styles.tabButtonTextActive]}>
            Yêu cầu ứng viên
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSelectTab('ben')}
          style={[styles.tabButton, activeTab === 'ben' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'ben' && styles.tabButtonTextActive]}>
            Quyền lợi
          </Text>
        </Pressable>
      </View>

      {/* Tab Panels */}
      {activeTab === 'desc' && (
        <View style={styles.panelContainer}>
          {/* Card: Trách nhiệm công việc chính */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="terminal" size={20} color={colors.light.brand.secondary} />
              <Text style={styles.cardTitle}>Trách nhiệm công việc chính</Text>
            </View>
            <View style={styles.bulletsList}>
              {descPoints.map((point, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card: Môi trường làm việc */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="groups" size={20} color={colors.light.brand.secondary} />
              <Text style={styles.cardTitle}>Môi trường làm việc & Đội ngũ</Text>
            </View>
            <Text style={styles.paragraphText}>
              Môi trường làm việc chuyên nghiệp, khuyến khích sáng tạo và đổi mới công nghệ. Đội ngũ kỹ sư phối hợp linh hoạt, hỗ trợ phát triển kỹ năng và tạo điều kiện làm việc tối ưu.
            </Text>
          </View>
        </View>
      )}

      {activeTab === 'req' && (
        <View style={styles.panelContainer}>
          {/* Card: Kỹ năng bắt buộc */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="checklist" size={20} color={colors.light.brand.secondary} />
              <Text style={styles.cardTitle}>Kỹ năng bắt buộc</Text>
            </View>
            <View style={styles.bulletsList}>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  Kỹ năng chuyên môn chính: <Text style={styles.boldText}>{requiredSkills.join(', ')}</Text>
                </Text>
              </View>
              {job.requirements?.education?.minimumDegree ? (
                <View style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    Trình độ học vấn tối thiểu: {job.requirements.education.minimumDegree}
                    {job.requirements.education.preferredMajors?.length
                      ? ` (${job.requirements.education.preferredMajors.join(', ')})`
                      : ''}
                  </Text>
                </View>
              ) : null}
              {job.requirements?.languages?.map((lang, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    Ngoại ngữ: {lang.name} - Trình độ tối thiểu: {lang.minimumLevel}
                  </Text>
                </View>
              ))}
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  Tư duy Clean Code, Design Patterns và viết Unit Test tự động.
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  Kỹ năng giao tiếp và phối hợp nhóm tốt trong môi trường chuyên nghiệp.
                </Text>
              </View>
            </View>
          </View>

          {/* Card: Điểm cộng ưu tiên */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="stars" size={20} color={colors.light.brand.secondary} />
              <Text style={styles.cardTitle}>Điểm cộng ưu tiên</Text>
            </View>
            <View style={styles.skillChipsContainer}>
              {preferredSkills.map((sk, index) => (
                <View key={index} style={styles.preferredChip}>
                  <Text style={styles.preferredChipText}>{sk}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {activeTab === 'ben' && (
        <View style={styles.panelContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="redeem" size={20} color={colors.light.brand.secondary} />
              <Text style={styles.cardTitle}>Đãi ngộ & Phúc lợi KONEK Verified</Text>
            </View>

            <View style={styles.benefitList}>
              {benefits.map((benefit, index) => {
                const iconNames: (keyof typeof MaterialIcons.glyphMap)[] = [
                  'monetization-on',
                  'health-and-safety',
                  'school',
                  'flight-takeoff',
                ];
                const iconName = iconNames[index % iconNames.length];
                return (
                  <View key={index} style={styles.benefitRow}>
                    <MaterialIcons
                      name={iconName}
                      size={22}
                      color={index === 1 ? colors.light.status.success : colors.light.brand.secondary}
                    />
                    <View style={styles.benefitTextGroup}>
                      <Text style={styles.benefitTitle}>{benefit}</Text>
                      <Text style={styles.benefitSubtitle}>Chế độ đãi ngộ dành cho nhân sự chính thức</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.light.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.light.brand.primary,
    fontWeight: '700',
  },
  panelContainer: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  bulletsList: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.light.brand.secondary,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 13,
    color: colors.light.text.primary,
    lineHeight: 20,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  paragraphText: {
    fontSize: 13,
    color: colors.light.text.primary,
    lineHeight: 21,
  },
  skillChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferredChip: {
    backgroundColor: '#EFF4FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  preferredChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text.primary,
  },
  benefitList: {
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
  },
  benefitTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  benefitSubtitle: {
    fontSize: 12,
    color: colors.light.text.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
