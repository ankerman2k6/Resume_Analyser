import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../types/navigation';
import { colors } from '../../../../theme';
import { spacing } from '../../../../theme/spacing';
import { useJobSearch } from '../hooks/useJobSearch';
import { JobHeader } from '../components/JobHeader';
import { JobSearchBar } from '../components/JobSearchBar';
import { QuickFilterChips } from '../components/QuickFilterChips';
import { JobCard } from '../components/JobCard';
import { CompanyCard } from '../components/CompanyCard';
import { JobFilterModal } from '../components/JobFilterModal';
import type { JobUiItem, CompanyResponse } from '../types/job.types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function CandidateJobsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const {
    activeTab,
    setActiveTab,
    keyword,
    setKeyword,
    searchNow,
    activeChip,
    setActiveChip,
    filterState,
    isFilterModalVisible,
    setIsFilterModalVisible,
    jobs,
    displayedJobs,
    selectedCompany,
    selectCompany,
    companyJobCounts,
    companies,
    totalElements,
    loading,
    refreshing,
    error,
    onRefresh,
    onLoadMore,
    toggleBookmark,
    handleApplyFilter,
    handleResetFilter,
  } = useJobSearch();

  const handleJobPress = useCallback(
    (job: JobUiItem) => {
      navigation.navigate('CandidateJobDetail', {
        jobId: job.id,
        initialJob: job,
      });
    },
    [navigation]
  );

  const handleCompanyPress = useCallback(
    (company: CompanyResponse) => {
      selectCompany(company);
    },
    [selectCompany]
  );

  const getCompanyOpenJobsCount = useCallback(
    (company: CompanyResponse) => {
      if (companyJobCounts[company.id] !== undefined) {
        return companyJobCounts[company.id];
      }
      return jobs.filter((j) => j.companyId === company.id).length;
    },
    [companyJobCounts, jobs]
  );

  const isFilterActive =
    filterState.salaryRange !== 'all' ||
    filterState.level !== 'all' ||
    filterState.locations.length !== 2;

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.light.brand.secondary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu từ máy chủ...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="cloud-off" size={48} color={colors.light.status.danger} />
          <Text style={styles.emptyTitle}>Không thể kết nối đến máy chủ</Text>
          <Text style={styles.emptyDescription}>
            Vui lòng kiểm tra backend và kết nối mạng ({error})
          </Text>
          <Pressable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="search-off" size={48} color={colors.light.text.secondary} />
        <Text style={styles.emptyTitle}>Không tìm thấy việc làm phù hợp</Text>
        <Text style={styles.emptyDescription}>
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc địa điểm, mức lương.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <JobHeader title="Jobs" />

      {/* Fixed Top Controls: Search Bar, Category Tabs, Quick Filter Chips */}
      <View style={styles.headerSection}>
        {/* Search & Filter Bar */}
        <JobSearchBar
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={searchNow}
          onOpenFilter={() => setIsFilterModalVisible(true)}
          isFilterActive={isFilterActive}
        />

        {/* Primary Category Tabs: Việc làm & Công ty */}
        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setActiveTab('jobs')}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'jobs' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Việc làm ({selectedCompany ? displayedJobs.length : totalElements > 0 ? totalElements : jobs.length})
            </Text>
            {activeTab === 'jobs' ? <View style={styles.activeTabIndicator} /> : null}
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('companies')}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'companies' ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              Công ty tuyển dụng ({companies.length})
            </Text>
            {activeTab === 'companies' ? <View style={styles.activeTabIndicator} /> : null}
          </Pressable>
        </View>

        {/* Horizontal Quick Filter Chips (shown only on Jobs tab) */}
        {activeTab === 'jobs' && !selectedCompany ? (
          <QuickFilterChips
            activeChip={activeChip}
            onSelectChip={setActiveChip}
          />
        ) : null}

        {/* Active Company Filter Banner */}
        {activeTab === 'jobs' && selectedCompany ? (
          <View style={styles.selectedCompanyBanner}>
            <View style={styles.selectedCompanyInfo}>
              <MaterialIcons name="apartment" size={18} color={colors.light.brand.secondary} />
              <Text style={styles.selectedCompanyText} numberOfLines={1}>
                Đang lọc: <Text style={styles.selectedCompanyName}>{selectedCompany.name}</Text>
              </Text>
            </View>
            <Pressable
              onPress={() => selectCompany(null)}
              style={styles.clearCompanyBtn}
            >
              <MaterialIcons name="close" size={16} color={colors.light.text.secondary} />
              <Text style={styles.clearCompanyText}>Xem tất cả</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Feed Subheader */}
        <View style={styles.feedSubheader}>
          <Text style={styles.feedSubheaderTitle}>
            {activeTab === 'jobs'
              ? selectedCompany
                ? `Việc làm tại ${selectedCompany.name}`
                : 'Đề xuất phù hợp nhất'
              : 'Doanh nghiệp nổi bật'}
          </Text>
          {activeTab === 'jobs' ? (
            <View style={styles.aiMatchBadge}>
              <MaterialIcons name="auto-awesome" size={15} color={colors.light.brand.secondary} />
              <Text style={styles.aiMatchText}>AI Match</Text>
            </View>
          ) : (
            <Text style={styles.partnerCountText}>{companies.length} đối tác</Text>
          )}
        </View>
      </View>

      {/* Feed List */}
      {activeTab === 'jobs' ? (
        <FlatList
          data={displayedJobs}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => handleJobPress(item)}
              onToggleBookmark={() => toggleBookmark(item.id)}
            />
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.light.brand.secondary]}
              tintColor={colors.light.brand.secondary}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <CompanyCard
              company={item}
              openJobsCount={getCompanyOpenJobsCount(item)}
              onPress={() => handleCompanyPress(item)}
            />
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.light.brand.secondary]}
              tintColor={colors.light.brand.secondary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Bottom Sheet Modal */}
      <JobFilterModal
        visible={isFilterModalVisible}
        filterState={filterState}
        totalCount={totalElements}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background.primary,
  },
  headerSection: {
    backgroundColor: colors.light.background.primary,
    paddingBottom: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
    marginTop: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border.subtle,
  },
  tabItem: {
    paddingBottom: 10,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: '700',
    color: colors.light.brand.secondary,
  },
  tabTextInactive: {
    fontWeight: '500',
    color: colors.light.text.secondary,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: colors.light.brand.secondary,
    borderRadius: 2,
  },
  feedSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 6,
  },
  feedSubheaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text.secondary,
  },
  aiMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  aiMatchText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.brand.secondary,
  },
  partnerCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.brand.secondary,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.light.text.secondary,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text.primary,
    marginTop: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.light.text.secondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: colors.light.brand.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCompanyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: 4,
  },
  selectedCompanyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  selectedCompanyText: {
    fontSize: 13,
    color: colors.light.text.secondary,
    flexShrink: 1,
  },
  selectedCompanyName: {
    fontWeight: '700',
    color: colors.light.brand.secondary,
  },
  clearCompanyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    marginLeft: 8,
  },
  clearCompanyText: {
    fontSize: 12,
    color: colors.light.brand.secondary,
    fontWeight: '600',
  },
});
