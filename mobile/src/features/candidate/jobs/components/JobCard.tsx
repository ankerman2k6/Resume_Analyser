import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { JobUiItem } from '../types/job.types';
import {
  formatSalary,
  formatLocation,
  formatTimeAgo,
} from '../utils/jobFormatters';
import { API_BASE_URL } from '../../../../config/api';

const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

type JobCardProps = {
  job: JobUiItem;
  onPress: () => void;
  onToggleBookmark: () => void;
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  onToggleBookmark,
}) => {
  const salaryText = formatSalary(job.salary);
  const locationText = formatLocation(job.location);
  const timeAgoText = formatTimeAgo(job.createdAt);

  const skills = [
    ...(job.requirements?.requiredSkills || []),
    ...(job.requirements?.preferredSkills || []),
  ].slice(0, 3);

  const fallbackInitial = (job.companyName || 'C')[0].toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Top row: Logo, Title, Company Name, Bookmark */}
      <View style={styles.topRow}>
        <View style={styles.logoWrapper}>
          {job.companyLogo ? (
            <Image
              source={{
                uri: job.companyLogo?.startsWith('http')
                  ? job.companyLogo
                  : `${SERVER_URL}${job.companyLogo}`,
              }}
              style={styles.logoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackLogo}>
              <Text style={styles.fallbackLogoText}>{fallbackInitial}</Text>
            </View>
          )}
        </View>

        <View style={styles.titleWrapper}>
          <Text numberOfLines={1} style={styles.jobTitle}>
            {job.title}
          </Text>
          <Text numberOfLines={1} style={styles.companyName}>
            {job.companyName}
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Lưu tin"
          onPress={onToggleBookmark}
          hitSlop={10}
          style={styles.bookmarkButton}
        >
          <MaterialIcons
            name={job.isBookmarked ? 'bookmark' : 'bookmark-border'}
            size={22}
            color={job.isBookmarked ? colors.light.brand.secondary : colors.light.text.secondary}
          />
        </Pressable>
      </View>

      {/* Badges Cluster */}
      <View style={styles.badgeCluster}>
        {job.badges?.map((badge, idx) => {
          const isHot = badge.toLowerCase().includes('hot');
          return (
            <View
              key={idx}
              style={[
                styles.badgePill,
                isHot ? styles.badgeHot : styles.badgeNormal,
              ]}
            >
              <Text
                style={isHot ? styles.badgeTextHot : styles.badgeTextNormal}
              >
                {badge}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Specs & Details */}
      <View style={styles.specsContainer}>
        <View style={styles.specItem}>
          <MaterialIcons name="payments" size={17} color={colors.light.brand.secondary} />
          <Text style={styles.salaryText}>{salaryText}</Text>
        </View>
        <View style={styles.specItem}>
          <MaterialIcons name="location-on" size={16} color={colors.light.text.secondary} />
          <Text numberOfLines={1} style={styles.locationText}>
            {locationText}
          </Text>
        </View>
      </View>

      {/* Skill Tags & Posted time footer */}
      <View style={styles.footerRow}>
        <View style={styles.skillCluster}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.timeAgoText}>{timeAgoText}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
    marginHorizontal: spacing.md,
    marginBottom: 12,
  },
  cardPressed: {
    backgroundColor: '#FAFBFD',
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 10,
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
  titleWrapper: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text.primary,
    letterSpacing: -0.2,
  },
  companyName: {
    fontSize: 13,
    color: colors.light.text.secondary,
    marginTop: 2,
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeHot: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeTextHot: {
    color: colors.light.status.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeNormal: {
    backgroundColor: colors.light.brand.accent,
  },
  badgeTextNormal: {
    color: colors.light.brand.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  specsContainer: {
    gap: 4,
    paddingTop: 2,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.brand.secondary,
  },
  locationText: {
    fontSize: 13,
    color: colors.light.text.secondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  skillCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.light.background.subtle,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.light.text.primary,
  },
  timeAgoText: {
    fontSize: 11,
    color: colors.light.text.secondary,
    marginLeft: 8,
  },
});
