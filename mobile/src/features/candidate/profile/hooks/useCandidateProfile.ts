import { useCallback, useEffect, useState } from 'react';
import { getCvParseErrorMessage } from '../../resumes/api/resumeApi';
import { profileApi } from '../api/profileApi';
import type { ProfileDashboardData, UpdateCandidateProfile } from '../types/profile.types';

const EMPTY_DATA: ProfileDashboardData = { profile: null, stats: null, applications: null, cvs: null, career: null };
type ProfileFeedback = { tone: 'success' | 'error'; message: string };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Không thể tải dữ liệu. Vui lòng thử lại.';
}

export function useCandidateProfile() {
  const [data, setData] = useState<ProfileDashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [parsingCvId, setParsingCvId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setErrors([]);
    const results = await Promise.allSettled([
      profileApi.getProfile(), profileApi.getStats(), profileApi.getApplications(),
      profileApi.getCvs(), profileApi.getCareer(),
    ]);
    const keys: Array<keyof ProfileDashboardData> = ['profile', 'stats', 'applications', 'cvs', 'career'];
    const next: ProfileDashboardData = { ...EMPTY_DATA };
    const nextErrors: string[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') (next as Record<string, unknown>)[keys[index]] = result.value;
      else nextErrors.push(messageOf(result.reason));
    });
    setData(next);
    setErrors([...new Set(nextErrors)]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateProfile = useCallback(async (payload: UpdateCandidateProfile) => {
    setSaving(true);
    setFeedback(null);
    try {
      const profile = await profileApi.updateProfile(payload);
      setData((current) => ({ ...current, profile }));
      setFeedback({ tone: 'success', message: 'Thông tin cá nhân đã được cập nhật.' });
      return profile;
    } finally { setSaving(false); }
  }, []);

  const withdrawApplication = useCallback(async (id: string) => {
    setBusyId(id);
    setFeedback(null);
    try {
      const application = await profileApi.withdrawApplication(id);
      setData((current) => ({
        ...current, applications: current.applications ? {
          ...current.applications,
          content: current.applications.content.map((item) => item._id === id ? application : item),
        } : null
      }));
      setFeedback({ tone: 'success', message: 'Đã rút đơn ứng tuyển.' });
    } finally { setBusyId(null); }
  }, []);

  const deleteCv = useCallback(async (id: string) => {
    setBusyId(id);
    setFeedback(null);
    try {
      await profileApi.deleteCv(id);
      setData((current) => ({
        ...current, cvs: current.cvs ? {
          ...current.cvs,
          content: current.cvs.content.filter((item) => item._id !== id),
          totalElements: Math.max(0, current.cvs.totalElements - 1),
        } : null
      }));
      setFeedback({ tone: 'success', message: 'CV đã được xóa.' });
    } finally { setBusyId(null); }
  }, []);

  const parseCv = useCallback(async (cvId: string) => {
    if (parsingCvId) return;

    setParsingCvId(cvId);
    setFeedback(null);
    try {
      const parsedCv = await profileApi.parseCv(cvId);
      const career = await profileApi.getCareer(cvId);
      setData((current) => ({
        ...current,
        career,
        cvs: current.cvs ? {
          ...current.cvs,
          content: current.cvs.content.map((item) => item._id === parsedCv._id ? parsedCv : item),
        } : null,
      }));
      setFeedback({
        tone: 'success',
        message: 'AI đã cập nhật kinh nghiệm, kỹ năng và học vấn từ CV.',
      });
    } catch (error) {
      setFeedback({ tone: 'error', message: getCvParseErrorMessage(error) });
      try {
        const cvs = await profileApi.getCvs();
        setData((current) => ({ ...current, cvs }));
      } catch {
        // Keep the current cards when the background status refresh also fails.
      }
    } finally {
      setParsingCvId(null);
    }
  }, [parsingCvId]);

  const refresh = useCallback(() => load(true), [load]);

  return {
    data, loading, refreshing, saving, busyId, parsingCvId, errors, feedback,
    refresh, updateProfile, withdrawApplication, deleteCv, parseCv, setFeedback,
  };
}
