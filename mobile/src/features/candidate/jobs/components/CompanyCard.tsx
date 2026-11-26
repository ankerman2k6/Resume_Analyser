import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { CompanyResponse } from '../types/job.types';

type CompanyCardProps = {
  company: CompanyResponse;
  openJobsCount?: number;
  onPress?: () => void;
};

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  openJobsCount,
  onPress,
}) => {
  const initial = (company.name || 'C')[0].toUpperCase();
  const countText =
    openJobsCount !== undefined && openJobsCount > 0
      ? `${openJobsCount} việc làm đang mở`
      : 'Đang cập nhật việc làm';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.logoWrapper}>
        {company.logoUrl ? (
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

      <View style={styles.infoWrapper}>
        <Text numberOfLines={1} style={styles.companyName}>
          {company.name}
        </Text>
        <Text numberOfLines={1} style={styles.description}>
          {company.description || company.industry || 'Doanh nghiệp công nghệ hàng đầu'}
        </Text>
        <Text style={styles.openJobsText}>
          {countText}
        </Text>
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.md,
    marginBottom: 12,
  },
  cardPressed: {
    backgroundColor: '#FAFBFD',
  },
  logoWrapper: {
    width: 56,
    height: 56,
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.brand.secondary,
  },
  infoWrapper: {
    flex: 1,
    minWidth: 0,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  description: {
    fontSize: 12,
    color: colors.light.text.secondary,
    marginTop: 2,
  },
  openJobsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.brand.secondary,
    marginTop: 6,
  },
});
