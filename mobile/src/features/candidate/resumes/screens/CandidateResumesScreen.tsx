import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography } from '../../../../theme';
import { useCandidateResumes } from '../hooks/useCandidateResumes';
import type { CandidateCv } from '../types/resume.types';

const parseStatusLabels: Record<string, string> = {
  pending: 'Đang xử lý',
  processing: 'Đang xử lý',
  parsed: 'Đã phân tích',
  completed: 'Đã phân tích',
  failed: 'Phân tích lỗi',
};

function formatUpdatedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function ResumeSkeleton() {
  return (
    <View accessibilityLabel="Đang tải danh sách CV" style={styles.skeletonCard}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMeta} />
      </View>
    </View>
  );
}

export function CandidateResumesScreen() {
  const {
    resumes,
    totalElements,
    loading,
    refreshing,
    loadingMore,
    uploading,
    openingId,
    error,
    feedback,
    refresh,
    loadMore,
    pickAndUpload,
    openResume,
  } = useCandidateResumes();

  const renderResume = ({ item }: { item: CandidateCv }) => {
    const updatedAt = formatUpdatedAt(item.updatedAt || item.createdAt);
    const parseStatus = item.parseInfo?.status?.toLowerCase();
    const parseLabel = parseStatus ? parseStatusLabels[parseStatus] || item.parseInfo?.status : null;
    const isOpening = openingId === item._id;

    return (
      <View style={styles.resumeCard}>
        <View style={styles.resumeTopRow}>
          <View style={styles.pdfIconBox}>
            <MaterialCommunityIcons color={colors.light.status.danger} name="file-pdf-box" size={31} />
          </View>
          <View style={styles.resumeInfo}>
            <Text numberOfLines={2} style={styles.resumeTitle}>
              {item.title}
            </Text>
            {item.source?.fileName && item.source.fileName !== item.title ? (
              <Text numberOfLines={1} style={styles.fileName}>
                {item.source.fileName}
              </Text>
            ) : null}
            <View style={styles.metadataRow}>
              {parseLabel ? (
                <View
                  style={[
                    styles.statusBadge,
                    parseStatus === 'failed' ? styles.statusBadgeError : styles.statusBadgeNeutral,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      parseStatus === 'failed' ? styles.statusTextError : styles.statusTextNeutral,
                    ]}
                  >
                    {parseLabel}
                  </Text>
                </View>
              ) : null}
              {updatedAt ? <Text style={styles.updatedAt}>Cập nhật {updatedAt}</Text> : null}
            </View>
          </View>
        </View>

        {item.canViewFile ? (
          <Pressable
            accessibilityLabel={`Xem CV ${item.title}`}
            accessibilityRole="button"
            disabled={isOpening}
            onPress={() => openResume(item)}
            style={({ pressed }) => [
              styles.previewButton,
              pressed && !isOpening ? styles.previewButtonPressed : null,
            ]}
          >
            {isOpening ? (
              <ActivityIndicator color={colors.light.brand.secondary} size="small" />
            ) : (
              <Ionicons color={colors.light.brand.secondary} name="eye-outline" size={21} />
            )}
            <Text style={styles.previewButtonText}>{isOpening ? 'Đang mở…' : 'Xem CV'}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.introSection}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowIcon}>
            <Ionicons color={colors.light.brand.secondary} name="folder-open-outline" size={19} />
          </View>
          <Text style={styles.eyebrowText}>QUẢN LÝ CV</Text>
        </View>
        <Text style={styles.pageTitle}>Hồ sơ & CV của bạn</Text>
        <Text style={styles.pageDescription}>
          Tải lên CV PDF để sử dụng khi ứng tuyển và phân tích hồ sơ.
        </Text>
      </View>

      <View style={styles.uploadCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleRow}>
            <Ionicons color={colors.light.brand.secondary} name="document-outline" size={22} />
            <Text style={styles.cardTitle}>Tải lên CV trực tiếp</Text>
          </View>
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>Tối đa 5 MB</Text>
          </View>
        </View>

        <Pressable
          accessibilityHint="Mở trình chọn tệp PDF trên thiết bị"
          accessibilityRole="button"
          disabled={uploading}
          onPress={pickAndUpload}
          style={({ pressed }) => [
            styles.uploadDropzone,
            pressed && !uploading ? styles.uploadDropzonePressed : null,
            uploading ? styles.disabledControl : null,
          ]}
        >
          <View style={styles.uploadIconCircle}>
            {uploading ? (
              <ActivityIndicator color={colors.light.brand.secondary} />
            ) : (
              <MaterialCommunityIcons
                color={colors.light.brand.secondary}
                name="cloud-upload-outline"
                size={34}
              />
            )}
          </View>
          <Text style={styles.uploadTitle}>
            {uploading ? 'Đang tải CV lên…' : 'Tải CV từ điện thoại'}
          </Text>
          <Text style={styles.uploadDescription}>Chỉ hỗ trợ tệp PDF, dung lượng không quá 5 MB</Text>
          <View style={styles.uploadButtonVisual}>
            <Ionicons color={colors.light.brand.secondary} name="phone-portrait-outline" size={19} />
            <Text style={styles.uploadButtonText}>Chọn tệp PDF</Text>
          </View>
        </Pressable>

        {feedback ? (
          <View
            accessibilityRole={feedback.tone === 'error' ? 'alert' : undefined}
            style={[
              styles.feedbackRow,
              feedback.tone === 'error' ? styles.feedbackError : styles.feedbackSuccess,
            ]}
          >
            <Ionicons
              color={
                feedback.tone === 'error'
                  ? colors.light.status.danger
                  : colors.light.status.success
              }
              name={feedback.tone === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={18}
            />
            <Text
              style={[
                styles.feedbackText,
                feedback.tone === 'error' ? styles.feedbackErrorText : styles.feedbackSuccessText,
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.resumeSectionHeading}>
        <View style={styles.resumeSectionTitleRow}>
          <Ionicons color={colors.light.brand.secondary} name="archive-outline" size={23} />
          <Text style={styles.resumeSectionTitle}>CV hiện có trong tài khoản</Text>
        </View>
        {!loading && !error ? <Text style={styles.resumeCount}>{totalElements} CV</Text> : null}
      </View>
    </>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingList}>
          <ResumeSkeleton />
          <ResumeSkeleton />
        </View>
      );
    }

    if (error) {
      return (
        <View accessibilityRole="alert" style={styles.stateBlock}>
          <Text style={styles.errorTitle}>Không tải được danh sách CV</Text>
          <Text style={styles.stateDescription}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={refresh} style={styles.retryButton}>
            <Ionicons color={colors.light.text.primary} name="refresh" size={18} />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Text style={styles.emptyText}>
        Bạn chưa tải CV nào. Chọn tệp PDF ở phía trên để bắt đầu.
      </Text>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>K</Text>
        </View>
        <Text style={styles.topBarTitle}>CV Management</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={resumes}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.light.brand.secondary} style={styles.listFooterLoader} />
          ) : undefined
        }
        ListHeaderComponent={renderHeader}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            colors={[colors.light.brand.secondary]}
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={colors.light.brand.secondary}
          />
        }
        renderItem={renderResume}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.light.background.primary, flex: 1 },
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.light.background.surface,
    borderBottomColor: colors.light.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 60,
    paddingHorizontal: spacing.md,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.primary,
    borderRadius: radii.sm,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  brandMarkText: {
    color: colors.light.text.inverse,
    fontFamily: typography.labelSmall.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  topBarTitle: { color: colors.light.text.primary, ...typography.titleMedium },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  introSection: { gap: spacing.sm, paddingTop: spacing.lg },
  eyebrowRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  eyebrowIcon: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.accent,
    borderRadius: radii.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  eyebrowText: {
    color: colors.light.brand.secondary,
    letterSpacing: 0.8,
    ...typography.labelMedium,
  },
  pageTitle: { color: colors.light.text.primary, ...typography.headlineLarge },
  pageDescription: { color: colors.light.text.secondary, ...typography.bodyLarge },
  uploadCard: {
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  cardHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing.sm,
  },
  cardTitle: { color: colors.light.text.primary, flexShrink: 1, ...typography.titleMedium },
  limitBadge: {
    backgroundColor: colors.light.background.subtle,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
  },
  limitText: { color: colors.light.text.secondary, ...typography.labelSmall },
  uploadDropzone: {
    alignItems: 'center',
    backgroundColor: colors.light.surface.containerLow,
    borderColor: colors.light.border.focus,
    borderRadius: radii.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  uploadDropzonePressed: { backgroundColor: colors.light.surface.container },
  disabledControl: { opacity: 0.72 },
  uploadIconCircle: {
    alignItems: 'center',
    backgroundColor: colors.light.brand.accent,
    borderRadius: radii.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 64,
  },
  uploadTitle: { color: colors.light.text.primary, textAlign: 'center', ...typography.titleMedium },
  uploadDescription: {
    color: colors.light.text.secondary,
    maxWidth: 280,
    textAlign: 'center',
    ...typography.bodyMedium,
  },
  uploadButtonVisual: {
    alignItems: 'center',
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.brand.secondary,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  uploadButtonText: { color: colors.light.brand.secondary, ...typography.labelMedium },
  feedbackRow: {
    alignItems: 'flex-start',
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 12,
  },
  feedbackError: { backgroundColor: colors.light.feedback.dangerBackground },
  feedbackSuccess: { backgroundColor: colors.light.feedback.successBackground },
  feedbackText: { flex: 1, ...typography.bodyMedium },
  feedbackErrorText: { color: colors.light.feedback.dangerText },
  feedbackSuccessText: { color: colors.light.feedback.successText },
  resumeSectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  resumeSectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing.sm,
  },
  resumeSectionTitle: {
    color: colors.light.text.primary,
    flexShrink: 1,
    ...typography.titleMedium,
  },
  resumeCount: { color: colors.light.text.secondary, ...typography.bodyMedium },
  resumeCard: {
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  resumeTopRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  pdfIconBox: {
    alignItems: 'center',
    backgroundColor: colors.light.feedback.dangerBackground,
    borderRadius: radii.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  resumeInfo: { flex: 1, minWidth: 0 },
  resumeTitle: { color: colors.light.text.primary, ...typography.titleMedium },
  fileName: { color: colors.light.text.secondary, marginTop: spacing.xs, ...typography.bodySmall },
  metadataRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statusBadge: { borderRadius: radii.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statusBadgeNeutral: { backgroundColor: colors.light.background.subtle },
  statusBadgeError: { backgroundColor: colors.light.feedback.dangerBackground },
  statusText: { ...typography.labelSmall },
  statusTextNeutral: { color: colors.light.text.secondary },
  statusTextError: { color: colors.light.feedback.dangerText },
  updatedAt: { color: colors.light.text.secondary, ...typography.bodySmall },
  previewButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: colors.light.border.subtle,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  previewButtonPressed: { backgroundColor: colors.light.background.subtle },
  previewButtonText: { color: colors.light.brand.secondary, ...typography.labelMedium },
  loadingList: { gap: spacing.md },
  skeletonCard: {
    alignItems: 'center',
    backgroundColor: colors.light.background.surface,
    borderColor: colors.light.border.subtle,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 112,
    padding: spacing.md,
  },
  skeletonIcon: {
    backgroundColor: colors.light.background.subtle,
    borderRadius: radii.lg,
    height: 56,
    width: 56,
  },
  skeletonContent: { flex: 1, gap: spacing.sm },
  skeletonTitle: {
    backgroundColor: colors.light.background.subtle,
    borderRadius: radii.full,
    height: 14,
    width: '72%',
  },
  skeletonMeta: {
    backgroundColor: colors.light.background.subtle,
    borderRadius: radii.full,
    height: 12,
    width: '45%',
  },
  stateBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  errorTitle: { color: colors.light.status.danger, textAlign: 'center', ...typography.titleSmall },
  stateDescription: {
    color: colors.light.text.secondary,
    textAlign: 'center',
    ...typography.bodyMedium,
  },
  retryButton: {
    alignItems: 'center',
    borderColor: colors.light.border.subtle,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 42,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  retryButtonText: { color: colors.light.text.primary, ...typography.labelMedium },
  emptyText: {
    color: colors.light.text.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    textAlign: 'center',
    ...typography.bodyMedium,
  },
  listFooterLoader: { paddingVertical: spacing.md },
});
