import { apiClient } from '../../../../services/api/apiClient';
import type { CandidateCv, PageResponse } from '../../resumes/types/resume.types';
import type { CandidateApplication, CandidateCareer, CandidateProfile, CandidateStats, UpdateCandidateProfile } from '../types/profile.types';

export const profileApi = {
  getProfile: () => apiClient.get<CandidateProfile>('/candidates/me/profile'),
  getStats: () => apiClient.get<CandidateStats>('/candidates/me/stats'),
  getApplications: (size = 3) => apiClient.get<PageResponse<CandidateApplication>>('/candidates/me/applications', { params: { filter: 'all', page: 0, size } }),
  getCvs: (size = 3) => apiClient.get<PageResponse<CandidateCv>>('/candidates/me/cvs', { params: { page: 0, size } }),
  getCareer: (cvId?: string) => apiClient.get<CandidateCareer>('/candidates/me/career', { params: { cvId } }),
  parseCv: (cvId: string) => apiClient.post<CandidateCv>(
    `/candidates/me/cvs/${encodeURIComponent(cvId)}/parse`,
    undefined,
    { timeoutMs: 90000 }
  ),
  updateProfile: (payload: UpdateCandidateProfile) => apiClient.put<CandidateProfile>('/candidates/me/profile', payload),
  withdrawApplication: (applicationId: string) => apiClient.post<CandidateApplication>(`/candidates/me/applications/${encodeURIComponent(applicationId)}/withdraw`),
  deleteCv: (cvId: string) => apiClient.delete<void>(`/candidates/me/cvs/${encodeURIComponent(cvId)}`),
};
