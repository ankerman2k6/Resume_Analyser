import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';

type JobHeaderProps = {
  title?: string;
  onBack?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  showBack?: boolean;
};

export const JobHeader: React.FC<JobHeaderProps> = ({
  title = 'Jobs',
  onBack,
  onBookmark,
  isBookmarked = false,
  showBack = false,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        {showBack && onBack ? (
          <Pressable
            accessibilityLabel="Quay lại"
            onPress={onBack}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.light.text.primary} />
          </Pressable>
        ) : null}

        {/* Brand Logo Pill */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>KONEK</Text>
        </View>

        <Text numberOfLines={1} style={styles.titleText}>
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {showBack && onBookmark ? (
          <Pressable
            accessibilityLabel="Lưu tin"
            onPress={onBookmark}
            style={styles.iconButton}
          >
            <MaterialIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={24}
              color={isBookmarked ? colors.light.brand.secondary : colors.light.text.secondary}
            />
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="Thông báo"
            style={styles.iconButton}
          >
            <MaterialIcons name="notifications-none" size={24} color={colors.light.text.secondary} />
            <View style={styles.notificationDot} />
          </Pressable>
        )}

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImage}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border.subtle,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  logoBadge: {
    backgroundColor: colors.light.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text.primary,
    letterSpacing: -0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.status.danger,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.light.border.subtle,
    marginLeft: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
