import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { JobResponse, CompanyResponse } from '../types/job.types';
import {
  formatSalary,
  formatLocation,
  formatExperience,
  formatDeadline,
} from '../utils/jobFormatters';

type JobSpotlightCardProps = {
  job: JobResponse;
  company?: CompanyResponse | null;
};

export const JobSpotlightCard: React.FC<JobSpotlightCardProps> = ({
  job,
  company,
}) => {
  const salaryText = formatSalary(job.salary);
  const locationText = formatLocation(job.location);
  const experienceText = formatExperience(job.experience);
  const deadlineInfo = formatDeadline(job.deadline);
  const categoryText = job.category || 'Công nghệ thông tin';

  const companyName = company?.name || 'Doanh nghiệp tuyển dụng';
  const companyTagline = company?.industry || company?.description || 'Doanh nghiệp tuyển dụng uy tín';
  const initial = companyName[0].toUpperCase();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tuyển dụng: ${job.title} tại ${companyName}. Mức lương: ${salaryText}. Ứng tuyển ngay trên KONEK!`,
      });
    } catch {
      // Ignore
    }
  };

  return (
    <View style={styles.card}>
      {/* Company Identity & Verification */}
      <View style={styles.companyRow}>
        <View style={styles.companyLeft}>
          <View style={styles.logoWrapper}>
            {company?.logoUrl ? (
              <Image
                source={{ uri: company.logoUrl }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.fallbackLogo}>
                <Text style={styles.fallbackLogoText}>{initial}</Text>
              </View>
            )}
          </View>

          <View style={styles.companyInfo}>
            <View style={styles.nameVerifiedRow}>
              <Text numberOfLines={1} style={styles.companyName}>
                {companyName}
              </Text>
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={13} color={colors.light.brand.secondary} />
                <Text style={styles.verifiedText}>Đã xác thực</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.companyTagline}>
              {companyTagline}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Chia sẻ vị trí"
          onPress={handleShare}
          style={styles.shareBtn}
        >
          <MaterialIcons name="share" size={20} color={colors.light.text.secondary} />
        </Pressable>
      </View>

      {/* Job Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.jobSubtitle}>
          {job.employmentType === 'internship'
            ? '(Thực tập sinh)'
            : `(${categoryText})`}
        </Text>
      </View>

      {/* Salary Pill Display */}
      <View style={styles.salaryPill}>
        <View style={styles.salaryLabelGroup}>
          <MaterialIcons name="payments" size={20} color={colors.light.brand.secondary} />
          <Text style={styles.salaryLabel}>Mức lương:</Text>
        </View>
        <Text style={styles.salaryValue}>
          {salaryText}{' '}
          <Text style={styles.salaryUnit}>/ tháng</Text>
        </Text>
      </View>

      {/* 2x2 Quick Info Grid */}
      <View style={styles.gridContainer}>
        {/* Item 1: Địa điểm */}
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: colors.light.brand.accent }]}>
            <MaterialIcons name="location-on" size={16} color={colors.light.brand.secondary} />
          </View>
          <View style={styles.gridItemText}>
            <Text style={styles.gridLabel}>Địa điểm</Text>
            <Text numberOfLines={1} style={styles.gridValue}>
              {locationText}
            </Text>
          </View>
        </View>

        {/* Item 2: Kinh nghiệm */}
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#E5EEFF' }]}>
            <MaterialIcons name="work-history" size={16} color={colors.light.brand.primary} />
          </View>
          <View style={styles.gridItemText}>
            <Text style={styles.gridLabel}>Kinh nghiệm</Text>
            <Text numberOfLines={1} style={styles.gridValue}>
              {experienceText}
            </Text>
          </View>
        </View>

        {/* Item 3: Phân hệ */}
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#E5EEFF' }]}>
            <MaterialIcons name="hub" size={16} color={colors.light.brand.primary} />
          </View>
          <View style={styles.gridItemText}>
            <Text style={styles.gridLabel}>Phân hệ</Text>
            <Text numberOfLines={1} style={styles.gridValue}>
              {categoryText}
            </Text>
          </View>
        </View>

        {/* Item 4: Hạn nộp */}
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFDDB7' }]}>
            <MaterialIcons name="schedule" size={16} color="#5C4220" />
          </View>
          <View style={styles.gridItemText}>
            <Text style={styles.gridLabel}>Hạn nộp</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.gridValue,
                deadlineInfo.isUrgent && { color: colors.light.status.warning, fontWeight: '700' },
              ]}
            >
              {deadlineInfo.text}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  fallbackLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.brand.secondary,
  },
  companyInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.light.brand.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.light.brand.secondary,
  },
  companyTagline: {
    fontSize: 12,
    color: colors.light.text.secondary,
    marginTop: 2,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    paddingTop: 2,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.text.primary,
    letterSpacing: -0.3,
  },
  jobSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.light.text.secondary,
    marginTop: 2,
  },
  salaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  salaryLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salaryLabel: {
    fontSize: 12,
    color: colors.light.text.secondary,
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.brand.secondary,
  },
  salaryUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.light.text.secondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  gridItem: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemText: {
    flex: 1,
    minWidth: 0,
  },
  gridLabel: {
    fontSize: 10,
    color: colors.light.text.secondary,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text.primary,
    marginTop: 1,
  },
});
