import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';

type JobBottomBarProps = {
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onApply: () => void;
  hasApplied?: boolean;
};

export const JobBottomBar: React.FC<JobBottomBarProps> = ({
  isBookmarked,
  onToggleBookmark,
  onApply,
  hasApplied = false,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Lưu tin"
        onPress={onToggleBookmark}
        style={[
          styles.bookmarkButton,
          isBookmarked && styles.bookmarkButtonActive,
        ]}
      >
        <MaterialIcons
          name={isBookmarked ? 'bookmark' : 'bookmark-border'}
          size={24}
          color={isBookmarked ? colors.light.brand.secondary : colors.light.text.secondary}
        />
      </Pressable>

      <Pressable
        accessibilityLabel={hasApplied ? 'Đã nộp hồ sơ' : 'Ứng tuyển ngay'}
        onPress={onApply}
        disabled={hasApplied}
        style={[
          styles.applyButton,
          hasApplied && styles.applyButtonDisabled,
        ]}
      >
        <MaterialIcons
          name={hasApplied ? 'check' : 'send'}
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.applyButtonText}>
          {hasApplied ? 'Đã nộp hồ sơ' : 'Ứng tuyển ngay'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 8,
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
  },
  bookmarkButtonActive: {
    backgroundColor: colors.light.brand.accent,
    borderColor: colors.light.brand.secondary,
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.light.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.light.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  applyButtonDisabled: {
    backgroundColor: colors.light.status.success,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
