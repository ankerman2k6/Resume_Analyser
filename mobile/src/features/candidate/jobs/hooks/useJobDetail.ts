import { useState, useEffect, useCallback } from 'react';
import { jobApi } from '../api/jobApi';
import type { JobResponse, CompanyResponse } from '../types/job.types';
import {
  isJobBookmarked,
  toggleJobBookmark as toggleStorageBookmark,
} from '../../../../services/storage/bookmarkStorage';

export function useJobDetail(jobId: string, initialJob?: JobResponse) {
  const [job, setJob] = useState<JobResponse | null>(initialJob || null);
  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [loading, setLoading] = useState(!initialJob);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'req' | 'ben'>('desc');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary toast message
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Fetch job & company details
  const loadJobData = useCallback(async () => {
    try {
      setLoading(true);
      const jobData = await jobApi.getJobById(jobId);
      setJob(jobData);

      if (jobData.companyId) {
        try {
          const compData = await jobApi.getCompanyById(jobData.companyId);
          setCompany(compData);
        } catch {
          setCompany(null);
        }
      }

      const bookmarked = await isJobBookmarked(jobId);
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error('Lỗi khi tải thông tin việc làm:', err);
      showToast('Không thể tải thông tin việc làm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [jobId, showToast]);

  useEffect(() => {
    loadJobData();
  }, [loadJobData]);

  const toggleBookmark = useCallback(async () => {
    const nextState = await toggleStorageBookmark(jobId);
    setIsBookmarked(nextState);
    if (nextState) {
      showToast('Đã lưu tin tuyển dụng vào danh sách theo dõi!');
    } else {
      showToast('Đã bỏ lưu tin tuyển dụng.');
    }
  }, [jobId, showToast]);

  const submitApplication = useCallback(
    async (coverNote?: string) => {
      setSubmitting(true);
      try {
        // Giả lập gửi hồ sơ hoặc gọi backend nếu có endpoint
        await new Promise((resolve) => setTimeout(resolve, 900));
        setIsApplyModalVisible(false);
        showToast('🎉 Nộp đơn ứng tuyển thành công! Nhà tuyển dụng sẽ phản hồi sớm.');
      } catch (err) {
        showToast('Nộp hồ sơ thất bại. Vui lòng thử lại sau.');
      } finally {
        setSubmitting(false);
      }
    },
    [showToast]
  );

  return {
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
    showToast,
    refresh: loadJobData,
  };
}
