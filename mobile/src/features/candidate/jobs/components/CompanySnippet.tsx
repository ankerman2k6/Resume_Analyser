import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { CompanyResponse } from '../types/job.types';

type CompanySnippetProps = {
  company?: CompanyResponse | null;
  onViewCompanyProfile?: () => void;
};

export const CompanySnippet: React.FC<CompanySnippetProps> = ({
  company,
  onViewCompanyProfile,
}) => {
  const companyName = company?.name || 'Doanh nghiệp tuyển dụng';
  const sizeText = company?.size ? `${company.size} nhân sự` : 'Doanh nghiệp';
  const locObj = company?.locations?.[0];
  const addressText = locObj
    ? [locObj.address, locObj.city].filter(Boolean).join(', ')
    : 'Việt Nam';
  const description =
    company?.description ||
    (company?.industry
      ? `Công ty hoạt động trong lĩnh vực ${company.industry}.`
      : 'Thông tin nhà tuyển dụng đang được cập nhật.');
  const initial = companyName[0].toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Về nhà tuyển dụng</Text>
        {onViewCompanyProfile ? (
          <Pressable onPress={onViewCompanyProfile} style={styles.viewLink}>
            <Text style={styles.viewLinkText}>Xem hồ sơ</Text>
            <MaterialIcons name="chevron-right" size={18} color={colors.light.brand.secondary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.profileRow}>
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

        <View style={styles.infoGroup}>
          <Text numberOfLines={1} style={styles.companyName}>
            {companyName}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="groups" size={14} color={colors.light.text.secondary} />
              <Text style={styles.metaText}>{sizeText}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="business" size={14} color={colors.light.text.secondary} />
              <Text style={styles.metaText}>{addressText}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text numberOfLines={3} style={styles.descriptionText}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.brand.secondary,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrapper: {
    width: 52,
    height: 52,
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.brand.secondary,
  },
  infoGroup: {
    flex: 1,
    minWidth: 0,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.light.text.secondary,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.light.text.secondary,
    lineHeight: 18,
  },
});
