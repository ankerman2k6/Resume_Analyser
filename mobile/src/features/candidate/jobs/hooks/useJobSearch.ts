import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { jobApi } from '../api/jobApi';
import type {
  JobUiItem,
  CompanyResponse,
  FilterState,
  QuickFilterKey,
} from '../types/job.types';
import {
  isJobBookmarked,
  toggleJobBookmark as toggleStorageBookmark,
} from '../../../../services/storage/bookmarkStorage';

export const initialFilterState: FilterState = {
  locations: ['Hà Nội', 'TP. Hồ Chí Minh'],
  salaryRange: 'all',
  level: 'all',
};

export function useJobSearch() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies'>('jobs');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [activeChip, setActiveChip] = useState<QuickFilterKey>('all');
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);
  const [companyJobCounts, setCompanyJobCounts] = useState<Record<string, number>>({});
  const [jobs, setJobs] = useState<JobUiItem[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Debounce keyword 350ms to prevent re-fetching on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Company cache to prevent repeated API calls
  const companyCache = useRef<Map<string, CompanyResponse>>(new Map());

  // Resolve company details for jobs
  const enrichJobsWithCompanies = useCallback(async (jobList: typeof jobs): Promise<JobUiItem[]> => {
    return Promise.all(
      jobList.map(async (job) => {
        let comp: CompanyResponse | null = null;
        if (job.companyId) {
          if (companyCache.current.has(job.companyId)) {
            comp = companyCache.current.get(job.companyId)!;
          } else {
            try {
              comp = await jobApi.getCompanyById(job.companyId);
              if (comp) {
                companyCache.current.set(job.companyId, comp);
              }
            } catch {
              comp = null;
            }
          }
        }

        const bookmarked = await isJobBookmarked(job.id);

        // Derive badges
        const badges: string[] = [];
        if (job.salary && (job.salary.max || 0) >= 30000000 || (job.salary?.min || 0) >= 1500) {
          badges.push('Hot');
        }
        badges.push('Ứng tuyển nhanh');

        return {
          ...job,
          companyName: comp?.name || 'Doanh nghiệp tuyển dụng',
          companyLogo: comp?.logoUrl,
          companyTagline: comp?.industry || comp?.description,
          isBookmarked: bookmarked,
          badges,
        };
      })
    );
  }, []);

  // Fetch jobs based on debouncedKeyword, chips, and filters
  const fetchJobs = useCallback(
    async (pageIndex = 0, isRefresh = false, kwOverride?: string) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageIndex === 0) {
        setLoading(true);
      }

      try {
        setError(null);
        const activeSearchText = (kwOverride !== undefined ? kwOverride : debouncedKeyword).trim();
        let searchKeyword = activeSearchText;
        let searchLocation: string | undefined;
        let searchProfession: string | undefined;

        // Apply quick filter chip
        if (activeChip === 'backend') {
          searchKeyword = searchKeyword ? `${searchKeyword} Backend` : 'Backend';
        } else if (activeChip === 'ai') {
          searchKeyword = searchKeyword ? `${searchKeyword} Machine Learning` : 'Machine Learning';
        } else if (activeChip === 'devops') {
          searchKeyword = searchKeyword ? `${searchKeyword} DevOps` : 'DevOps';
        } else if (activeChip === 'design') {
          searchKeyword = searchKeyword ? `${searchKeyword} Design` : 'Design';
        } else if (activeChip === 'remote') {
          searchLocation = 'remote';
        }

        // Apply filter state
        if (!searchLocation && filterState.locations.length > 0) {
          if (filterState.locations.includes('remote') && filterState.locations.length === 1) {
            searchLocation = 'remote';
          } else if (filterState.locations.length === 1) {
            searchLocation = filterState.locations[0];
          }
        }

        const response = await jobApi.searchJobs({
          keyword: searchKeyword || undefined,
          location: searchLocation,
          profession: searchProfession,
          page: pageIndex,
          size: 15,
        });

        let rawContent = response.content || [];

        // Update company job counts when on initial default query
        if (
          pageIndex === 0 &&
          !activeSearchText &&
          activeChip === 'all' &&
          filterState.salaryRange === 'all' &&
          filterState.level === 'all'
        ) {
          const counts: Record<string, number> = {};
          rawContent.forEach((j) => {
            if (j.companyId) {
              counts[j.companyId] = (counts[j.companyId] || 0) + 1;
            }
          });
          setCompanyJobCounts((prev) => ({ ...prev, ...counts }));
        }

        // Apply salary range filtering client-side if selected
        if (filterState.salaryRange !== 'all') {
          rawContent = rawContent.filter((j) => {
            const min = j.salary?.min || 0;
            const max = j.salary?.max || min;
            const curr = j.salary?.currency?.toUpperCase() || 'VND';
            const minVnd = curr === 'USD' ? min * 25000 : min;
            const maxVnd = curr === 'USD' ? max * 25000 : max;

            if (filterState.salaryRange === 'under15') return maxVnd <= 15000000;
            if (filterState.salaryRange === '15to25') return maxVnd >= 15000000 && minVnd <= 25000000;
            if (filterState.salaryRange === '25to40') return maxVnd >= 25000000 && minVnd <= 40000000;
            if (filterState.salaryRange === 'above40') return maxVnd >= 40000000 || curr === 'USD';
            return true;
          });
        }

        // Apply level filtering client-side if selected
        if (filterState.level !== 'all') {
          rawContent = rawContent.filter((j) => {
            const lvl = j.experience?.level?.toLowerCase() || '';
            return lvl.includes(filterState.level);
          });
        }

        const enriched = await enrichJobsWithCompanies(rawContent as any);

        if (pageIndex === 0) {
          setJobs(enriched);
        } else {
          setJobs((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = enriched.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
        }

        setPage(pageIndex);
        setTotalElements(response.totalElements || enriched.length);
        setIsLastPage(response.last ?? true);
      } catch (err) {
        console.error('Lỗi khi tải danh sách việc làm:', err);
        const msg =
          err instanceof Error
            ? err.message
            : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend và ngrok.';
        setError(msg);
        if (pageIndex === 0) {
          setJobs([]);
          setTotalElements(0);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedKeyword, activeChip, filterState, enrichJobsWithCompanies]
  );

  // Load companies directly from published jobs in database
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await jobApi.searchJobs({ page: 0, size: 50 });
      const rawJobs = response?.content || [];
      const counts: Record<string, number> = {};
      const companyIds = new Set<string>();

      rawJobs.forEach((j) => {
        if (j.companyId) {
          counts[j.companyId] = (counts[j.companyId] || 0) + 1;
          companyIds.add(j.companyId);
        }
      });
      setCompanyJobCounts((prev) => ({ ...prev, ...counts }));

      const comps = await Promise.all(
        Array.from(companyIds).map(async (cid) => {
          try {
            return await jobApi.getCompanyById(cid);
          } catch {
            return null;
          }
        })
      );
      setCompanies(comps.filter((c): c is CompanyResponse => c !== null));
    } catch (err) {
      console.error('Lỗi khi tải danh sách công ty:', err);
    }
  }, []);

  // Fetch when debouncedKeyword, chip, or filter changes
  useEffect(() => {
    fetchJobs(0);
    fetchCompanies();
  }, [fetchJobs, fetchCompanies]);

  const searchNow = useCallback(() => {
    setDebouncedKeyword(keyword);
    fetchJobs(0, false, keyword);
  }, [keyword, fetchJobs]);

  const onRefresh = useCallback(() => {
    fetchJobs(0, true);
  }, [fetchJobs]);

  const onLoadMore = useCallback(() => {
    if (!loading && !isLastPage) {
      fetchJobs(page + 1);
    }
  }, [loading, isLastPage, page, fetchJobs]);

  const toggleBookmark = useCallback(async (jobId: string) => {
    const isNowBookmarked = await toggleStorageBookmark(jobId);
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, isBookmarked: isNowBookmarked } : job
      )
    );
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isNowBookmarked) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
    return isNowBookmarked;
  }, []);

  const handleApplyFilter = useCallback((newFilter: FilterState) => {
    setFilterState(newFilter);
    setIsFilterModalVisible(false);
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilterState(initialFilterState);
    setIsFilterModalVisible(false);
  }, []);

  const selectCompany = useCallback((comp: CompanyResponse | null) => {
    setSelectedCompany(comp);
    setKeyword('');
    setActiveChip('all');
    setActiveTab('jobs');
  }, []);

  const displayedJobs = useMemo(() => {
    if (!selectedCompany) return jobs;
    return jobs.filter((j) => j.companyId === selectedCompany.id);
  }, [jobs, selectedCompany]);

  return {
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
  };
}
