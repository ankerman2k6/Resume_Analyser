import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../../types/navigation';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import { useJobDetail } from '../hooks/useJobDetail';
import { JobHeader } from '../components/JobHeader';
import { JobSpotlightCard } from '../components/JobSpotlightCard';
import { JobDetailTabs } from '../components/JobDetailTabs';
import { CompanySnippet } from '../components/CompanySnippet';
import { JobBottomBar } from '../components/JobBottomBar';
import { JobApplyModal } from '../components/JobApplyModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRouteProp = RouteProp<RootStackParamList, 'CandidateJobDetail'>;

export function CandidateJobDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { jobId, initialJob } = route.params;

  const {
    job,
    company,
    loading,
    isBookmarked,
    activeTab,
    setActiveTab,
    isApplyModalVisible,
    setIsApplyModalVisible,
    submitting,
    toastMessage,
    toggleBookmark,
    submitApplication,
  } = useJobDetail(jobId, initialJob);

  if (loading && !job) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <JobHeader
          title="Job Details"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.light.brand.secondary} />
          <Text style={styles.loadingText}>Đang tải chi tiết việc làm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <JobHeader
          title="Job Details"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.light.status.danger} />
          <Text style={styles.errorTitle}>Không tìm thấy việc làm</Text>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại danh sách</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />
      {/* App Header with Back button & bookmark */}
      <JobHeader
        title="Job Details"
        showBack
        onBack={() => navigation.goBack()}
        onBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Spotlight Card */}
        <JobSpotlightCard job={job} company={company} />

        {/* Segmented Detail Tabs: Mô tả / Yêu cầu / Quyền lợi */}
        <JobDetailTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          job={job}
        />

        {/* Company Overview Snippet */}
        <CompanySnippet company={company} />

        {/* Spacer for sticky bottom bar */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Floating Sticky Bottom Apply Action Bar */}
      <JobBottomBar
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        onApply={() => setIsApplyModalVisible(true)}
      />

      {/* Apply CV Modal Sheet */}
      <JobApplyModal
        visible={isApplyModalVisible}
        job={job}
        company={company}
        submitting={submitting}
        onClose={() => setIsApplyModalVisible(false)}
        onSubmit={submitApplication}
      />

      {/* Floating Feedback Toast */}
      {toastMessage ? (
        <View style={styles.toastContainer}>
          <MaterialIcons name="task-alt" size={20} color={colors.light.status.success} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.light.text.secondary,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text.primary,
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.light.brand.primary,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  toastContainer: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    backgroundColor: colors.light.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
    maxWidth: '90%',
    zIndex: 999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
