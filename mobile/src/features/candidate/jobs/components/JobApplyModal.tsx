import React, { useState, useEffect } from 'react';
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
import type { JobResponse, CompanyResponse, PageResponse } from '../types/job.types';
import { formatSalary } from '../utils/jobFormatters';
import { apiClient } from '../../../../services/api/apiClient';

export type CandidateCvItem = {
  id: string;
  fileName: string;
  title?: string;
  updatedAtLabel: string;
  fileSizeLabel?: string;
  isDefault?: boolean;
};

// Danh sách các bản CV đã tải lên của ứng viên (mặc định dùng khi chưa đăng nhập để test lướt chọn)
const DEFAULT_USER_CVS: CandidateCvItem[] = [
  {
    id: 'cv-01',
    fileName: 'Nguyen_Van_A_Frontend_CV.pdf',
    title: 'Frontend Developer CV',
    updatedAtLabel: 'Cập nhật gần đây',
    fileSizeLabel: '2.4 MB',
    isDefault: true,
  },
  {
    id: 'cv-02',
    fileName: 'Nguyen_Van_A_DevOps_Cloud.pdf',
    title: 'DevOps & Cloud Engineer CV',
    updatedAtLabel: 'Cập nhật 3 ngày trước',
    fileSizeLabel: '1.8 MB',
  },
  {
    id: 'cv-03',
    fileName: 'Nguyen_Van_A_Fullstack_2026.pdf',
    title: 'Fullstack Software Engineer CV',
    updatedAtLabel: 'Cập nhật 2 tuần trước',
    fileSizeLabel: '2.1 MB',
  },
  {
    id: 'cv-04',
    fileName: 'Nguyen_Van_A_Backend_Spring.pdf',
    title: 'Backend Java Spring Developer CV',
    updatedAtLabel: 'Cập nhật 3 tuần trước',
    fileSizeLabel: '1.9 MB',
  },
  {
    id: 'cv-05',
    fileName: 'Nguyen_Van_A_Mobile_App_CV.pdf',
    title: 'Mobile React Native Developer CV',
    updatedAtLabel: 'Cập nhật tháng trước',
    fileSizeLabel: '2.3 MB',
  },
  {
    id: 'cv-06',
    fileName: 'Nguyen_Van_A_CV_English_Global.pdf',
    title: 'Senior Software Engineer (English)',
    updatedAtLabel: 'Cập nhật 2 tháng trước',
    fileSizeLabel: '1.6 MB',
  },
];

type JobApplyModalProps = {
  visible: boolean;
  job: JobResponse;
  company?: CompanyResponse | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (coverNote: string, selectedCv?: CandidateCvItem) => void;
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
  const [cvList, setCvList] = useState<CandidateCvItem[]>(DEFAULT_USER_CVS);
  const [selectedCvId, setSelectedCvId] = useState<string>(DEFAULT_USER_CVS[0].id);

  const companyName = company?.name || 'Doanh nghiệp';
  const salaryText = formatSalary(job.salary);

  // Tự động tải danh sách CV thật từ backend nếu ứng viên đã đăng nhập
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    apiClient
      .get<PageResponse<{ _id: string; title?: string; source?: { fileName?: string }; updatedAt?: string }>>(
        '/candidates/me/cvs',
        { params: { page: 0, size: 20 } }
      )
      .then((res) => {
        if (!isMounted || !res?.content || res.content.length === 0) return;
        const mapped: CandidateCvItem[] = res.content.map((item, idx) => ({
          id: item._id,
          fileName: item.source?.fileName || item.title || `CV_Ung_Vien_${idx + 1}.pdf`,
          title: item.title || 'Hồ sơ CV',
          updatedAtLabel: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : 'Cập nhật gần đây',
          fileSizeLabel: '2.0 MB',
          isDefault: idx === 0,
        }));
        setCvList(mapped);
        if (mapped.length > 0) {
          setSelectedCvId(mapped[0].id);
        }
      })
      .catch(() => {
        // Giữ danh sách CV đã có nếu chưa có token hoặc chưa kết nối backend
      });

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const handleSubmit = () => {
    const selectedCv = cvList.find((c) => c.id === selectedCvId) || cvList[0];
    onSubmit(coverNote, selectedCv);
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

            {/* CV Selector Module: Cho phép người dùng lướt và chọn CV đã tải lên */}
            <View style={styles.sectionGroup}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.fieldLabel}>Hồ sơ CV của bạn</Text>
                <Text style={styles.cvCountLabel}>{cvList.length} bản CV đã tải lên</Text>
              </View>
              <Text style={styles.fieldSubLabel}>
                Lướt và chọn bản CV bạn muốn sử dụng để ứng tuyển:
              </Text>

              {/* Danh sách cuộn chọn CV đã tải lên (hỗ trợ lướt xem nhiều CV) */}
              <ScrollView
                style={styles.cvScrollBox}
                contentContainerStyle={styles.cvListContainer}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {cvList.map((cv) => {
                  const isSelected = cv.id === selectedCvId;
                  return (
                    <Pressable
                      key={cv.id}
                      onPress={() => setSelectedCvId(cv.id)}
                      style={[
                        styles.cvCard,
                        isSelected ? styles.cvCardSelected : styles.cvCardUnselected,
                      ]}
                    >
                      <View style={styles.cvLeft}>
                        {/* Radio Checkbox */}
                        <MaterialIcons
                          name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                          size={20}
                          color={isSelected ? colors.light.brand.secondary : colors.light.text.secondary}
                          style={styles.radioIcon}
                        />

                        {/* File Icon Box */}
                        <View style={[styles.cvIconBox, !isSelected && styles.cvIconBoxUnselected]}>
                          <MaterialIcons
                            name="description"
                            size={20}
                            color={isSelected ? '#FFFFFF' : colors.light.brand.secondary}
                          />
                        </View>

                        {/* Details */}
                        <View style={styles.cvDetails}>
                          <Text
                            numberOfLines={1}
                            style={[styles.cvFileName, isSelected && styles.cvFileNameSelected]}
                          >
                            {cv.fileName}
                          </Text>
                          <Text style={styles.cvMeta}>
                            {cv.updatedAtLabel}
                            {cv.fileSizeLabel ? ` • ${cv.fileSizeLabel}` : ''}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  fieldSubLabel: {
    fontSize: 12,
    color: colors.light.text.secondary,
    marginTop: -2,
    marginBottom: 4,
  },
  cvCountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.brand.secondary,
  },
  cvScrollBox: {
    maxHeight: 225,
    borderRadius: 12,
  },
  cvListContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  cvCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  cvCardSelected: {
    backgroundColor: 'rgba(224, 242, 254, 0.45)',
    borderColor: colors.light.brand.secondary,
  },
  cvCardUnselected: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.light.border.subtle,
  },
  cvLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  radioIcon: {
    marginRight: 2,
  },
  cvIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.light.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvIconBoxUnselected: {
    backgroundColor: '#E2E8F0',
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
  cvFileNameSelected: {
    color: colors.light.brand.secondary,
  },
  cvMeta: {
    fontSize: 11,
    color: colors.light.text.secondary,
    marginTop: 2,
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
