import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import type { JobResponse, CompanyResponse } from '../types/job.types';
import { formatSalary } from '../utils/jobFormatters';

type JobApplyModalProps = {
  visible: boolean;
  job: JobResponse;
  company?: CompanyResponse | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (coverNote: string) => void;
};

export const JobApplyModal: React.FC<JobApplyModalProps> = ({
  visible,
  job,
  company,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [coverNote, setCoverNote] = useState('');
  const companyName = company?.name || 'Doanh nghiệp';
  const salaryText = formatSalary(job.salary);

  const handleSubmit = () => {
    onSubmit(coverNote);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* Modal Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.badgeText}>KONEK SMART APPLY</Text>
                <Text style={styles.headerTitle}>Xác nhận hồ sơ ứng tuyển</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={colors.light.text.secondary} />
              </Pressable>
            </View>

            {/* Job Recap Mini Box */}
            <View style={styles.jobRecapBox}>
              <View style={styles.recapIconBox}>
                <MaterialIcons name="apartment" size={22} color={colors.light.brand.secondary} />
              </View>
              <View style={styles.recapInfo}>
                <Text numberOfLines={1} style={styles.recapTitle}>
                  {job.title}
                </Text>
                <Text numberOfLines={1} style={styles.recapMeta}>
                  {companyName} • Mức lương: {salaryText}
                </Text>
              </View>
            </View>

            {/* CV Selector Module */}
            <View style={styles.sectionGroup}>
              <Text style={styles.fieldLabel}>Hồ sơ CV của bạn</Text>

              {/* Active Parsed CV Box */}
              <View style={styles.activeCvBox}>
                <View style={styles.cvLeft}>
                  <View style={styles.cvIconBox}>
                    <MaterialIcons name="description" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.cvDetails}>
                    <Text numberOfLines={1} style={styles.cvFileName}>
                      Nguyen_Van_A_Frontend_CV.pdf
                    </Text>
                    <Text style={styles.cvMeta}>Cập nhật gần đây • 2.4 MB</Text>
                  </View>
                </View>

                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>94% Khớp</Text>
                </View>
              </View>

              <Pressable style={styles.uploadOtherBtn}>
                <MaterialIcons name="upload-file" size={16} color={colors.light.brand.secondary} />
                <Text style={styles.uploadOtherText}>Tải lên bản CV khác từ thiết bị</Text>
              </Pressable>
            </View>

            {/* Brief Note / Cover Letter */}
            <View style={styles.sectionGroup}>
              <Text style={styles.fieldLabel}>
                Lời nhắn tới Nhà tuyển dụng (Không bắt buộc)
              </Text>
              <TextInput
                value={coverNote}
                onChangeText={setCoverNote}
                placeholder="Chia sẻ nhanh về kinh nghiệm thế mạnh hoặc lý do bạn hào hứng với vị trí này..."
                placeholderTextColor={colors.light.text.secondary}
                style={styles.textArea}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Nộp CV ngay bây giờ</Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.privacyNote}>
                Bằng việc nộp hồ sơ, bạn đồng ý chia sẻ thông tin cho {companyName} theo chính sách bảo mật KONEK.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 4, 18, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.brand.secondary,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.text.primary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.background.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobRecapBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF4FF',
    borderRadius: 12,
    padding: 10,
  },
  recapIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recapInfo: {
    flex: 1,
    minWidth: 0,
  },
  recapTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  recapMeta: {
    fontSize: 12,
    color: colors.light.text.secondary,
    marginTop: 2,
  },
  sectionGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  activeCvBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(224, 242, 254, 0.45)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  cvLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  cvIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.light.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvDetails: {
    flex: 1,
    minWidth: 0,
  },
  cvFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  cvMeta: {
    fontSize: 11,
    color: colors.light.text.secondary,
    marginTop: 2,
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.status.success,
  },
  uploadOtherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  uploadOtherText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.brand.secondary,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: colors.light.text.primary,
    borderWidth: 1,
    borderColor: colors.light.border.subtle,
    minHeight: 80,
  },
  submitSection: {
    gap: 10,
    paddingTop: 6,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.light.brand.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.light.brand.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privacyNote: {
    fontSize: 11,
    color: colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
