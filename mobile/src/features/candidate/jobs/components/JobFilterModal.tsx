import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { FilterState } from '../types/job.types';

type JobFilterModalProps = {
  visible: boolean;
  filterState: FilterState;
  totalCount: number;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
};

const LOCATION_OPTIONS = [
  { key: 'Hà Nội', label: 'Hà Nội' },
  { key: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { key: 'Đà Nẵng', label: 'Đà Nẵng' },
  { key: 'remote', label: 'Remote / Toàn quốc' },
];

const SALARY_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'under15', label: 'Dưới 15 Triệu' },
  { key: '15to25', label: '15 - 25 Triệu' },
  { key: '25to40', label: '25 - 40 Triệu' },
  { key: 'above40', label: '> 40 Triệu / USD' },
] as const;

const LEVEL_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'intern', label: 'Intern / Fresher' },
  { key: 'junior', label: 'Junior' },
  { key: 'middle', label: 'Middle / Senior' },
  { key: 'lead', label: 'Lead / Manager' },
] as const;

export const JobFilterModal: React.FC<JobFilterModalProps> = ({
  visible,
  filterState,
  totalCount,
  onClose,
  onApply,
  onReset,
}) => {
  const [draft, setDraft] = useState<FilterState>(filterState);

  useEffect(() => {
    if (visible) {
      setDraft(filterState);
    }
  }, [visible, filterState]);

  const toggleLocation = (locKey: string) => {
    setDraft((prev) => {
      const exists = prev.locations.includes(locKey);
      if (exists) {
        return {
          ...prev,
          locations: prev.locations.filter((l) => l !== locKey),
        };
      } else {
        return {
          ...prev,
          locations: [...prev.locations, locKey],
        };
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialIcons name="tune" size={22} color={colors.light.brand.secondary} />
              <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={colors.light.text.secondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* 1. Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Địa điểm</Text>
              <View style={styles.grid2Col}>
                {LOCATION_OPTIONS.map((item) => {
                  const isChecked = draft.locations.includes(item.key);
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => toggleLocation(item.key)}
                      style={[
                        styles.checkboxRow,
                        isChecked && styles.checkboxRowChecked,
                      ]}
                    >
                      <MaterialIcons
                        name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                        size={20}
                        color={isChecked ? colors.light.brand.secondary : colors.light.text.secondary}
                      />
                      <Text
                        style={[
                          styles.checkboxLabel,
                          isChecked && styles.checkboxLabelChecked,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 2. Salary Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mức lương mong muốn</Text>
              <View style={styles.chipsRow}>
                {SALARY_OPTIONS.map((opt) => {
                  const isSelected = draft.salaryRange === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setDraft((p) => ({ ...p, salaryRange: opt.key }))}
                      style={[
                        styles.filterChip,
                        isSelected && styles.filterChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Level Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cấp bậc</Text>
              <View style={styles.chipsRow}>
                {LEVEL_OPTIONS.map((opt) => {
                  const isSelected = draft.level === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setDraft((p) => ({ ...p, level: opt.key }))}
                      style={[
                        styles.filterChip,
                        isSelected && styles.filterChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.actionsBar}>
            <Pressable
              onPress={() => {
                onReset();
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Thiết lập lại</Text>
            </Pressable>

            <Pressable
              onPress={() => onApply(draft)}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>
                Áp dụng {totalCount > 0 ? `(${totalCount})` : ''}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 4, 18, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border.subtle,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.background.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  grid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkboxRow: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.light.background.subtle,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  checkboxRowChecked: {
    backgroundColor: colors.light.brand.accent,
  },
  checkboxLabel: {
    fontSize: 13,
    color: colors.light.text.primary,
    flex: 1,
  },
  checkboxLabelChecked: {
    fontWeight: '600',
    color: colors.light.brand.secondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.light.background.subtle,
  },
  filterChipSelected: {
    backgroundColor: colors.light.brand.accent,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.light.text.primary,
  },
  filterChipTextSelected: {
    color: colors.light.brand.secondary,
    fontWeight: '700',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.light.border.subtle,
    backgroundColor: '#FFFFFF',
  },
  resetButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.light.background.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text.primary,
  },
  applyButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.light.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
