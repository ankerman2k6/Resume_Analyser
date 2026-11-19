import React from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';

type JobSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  onOpenFilter: () => void;
  isFilterActive?: boolean;
};

export const JobSearchBar: React.FC<JobSearchBarProps> = ({
  value,
  onChangeText,
  onSubmitEditing,
  onOpenFilter,
  isFilterActive = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <MaterialIcons
          name="search"
          size={20}
          color={colors.light.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder="Tìm vị trí tuyển dụng, công nghệ hoặc công ty..."
          placeholderTextColor={colors.light.text.secondary}
          style={styles.input}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {value.length > 0 ? (
          <Pressable onPress={() => onChangeText('')} style={styles.clearBtn}>
            <MaterialIcons name="close" size={16} color={colors.light.text.secondary} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityLabel="Mở bộ lọc"
        onPress={onOpenFilter}
        style={[styles.filterButton, isFilterActive && styles.filterButtonActive]}
      >
        <MaterialIcons
          name="tune"
          size={20}
          color={isFilterActive ? colors.light.brand.secondary : colors.light.text.primary}
        />
        <Text
          style={[
            styles.filterButtonText,
            isFilterActive && { color: colors.light.brand.secondary },
          ]}
        >
          Lọc
        </Text>
        {isFilterActive ? <View style={styles.activeDot} /> : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.light.text.primary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterButton: {
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  filterButtonActive: {
    borderColor: colors.light.brand.secondary,
    backgroundColor: colors.light.brand.accent,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text.primary,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.light.brand.secondary,
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
