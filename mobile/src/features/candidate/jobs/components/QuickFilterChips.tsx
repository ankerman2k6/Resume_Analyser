import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { QuickFilterKey } from '../types/job.types';

type ChipItem = {
  key: QuickFilterKey;
  label: string;
};

const CHIPS: ChipItem[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'backend', label: 'Backend (.NET / Java)' },
  { key: 'ai', label: 'AI / Machine Learning' },
  { key: 'devops', label: 'DevOps / Cloud' },
  { key: 'design', label: 'UI/UX Design' },
  { key: 'remote', label: 'Remote / Linh hoạt' },
];

type QuickFilterChipsProps = {
  activeChip: QuickFilterKey;
  onSelectChip: (chip: QuickFilterKey) => void;
};

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  activeChip,
  onSelectChip,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHIPS.map((chip) => {
        const isActive = activeChip === chip.key;
        return (
          <Pressable
            key={chip.key}
            onPress={() => onSelectChip(chip.key)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: colors.light.brand.secondary,
    borderColor: colors.light.brand.secondary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.light.text.primary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
