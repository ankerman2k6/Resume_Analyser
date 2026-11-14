import { API_URL, apiRequest } from "../../../core/apiClient";
export type Dashboard = {
  totalOpenJobs: number;
  totalApplications: number;
  interestedCandidates: number;
  jobsBySpecialty: { name: string; count: number }[];
  jobsByDivision: { name: string; count: number }[];
  candidateInterestTrend: { month: string; applicants: number }[];
};
export type Overview = {
  totalJobs: number;
  publishedJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  totalInterviews: number;
  scheduledInterviews: number;
  completedInterviews: number;
  cancelledInterviews: number;
};
export type StatusStats = { total: number; byStatus: Record<string, number> };
export type JobPayload = {
  companyId?: string;
  title: string;
  description: string;
  category: string;
  employmentType: string;
  location?: {
    address?: string;
    city?: string;
    country?: string;
    remote?: boolean;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    negotiable?: boolean;
  };
  experience?: { minYears?: number; maxYears?: number; level?: string };
  requirements?: Record<string, unknown>;
  benefits?: string[];
  deadline?: string;
};
export type HrJob = JobPayload & {
  id: string;
  recruiterId: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};
export type HrApplication = {
  id: string;
  jobId: string;
  candidateId: string;
  cvId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  cvUrl?: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  statusHistory: unknown[];
  skills: string[];
  experienceYears: number | null;
};
export type Interview = {
  id: string;
  applicationId: string;
  scheduledBy: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: "online" | "offline";
  meetingLink?: string;
  location?: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
};
export type InterviewPayload = Pick<
  Interview,
  | "applicationId"
  | "scheduledAt"
  | "durationMinutes"
  | "mode"
  | "meetingLink"
  | "location"
  | "notes"
>;
export const hrApi = {
  dashboard: () => apiRequest<Dashboard>("/hr/dashboard"),
  overview: () => apiRequest<Overview>("/hr/dashboard/overview"),
  applicationStats: () =>
    apiRequest<StatusStats>("/hr/dashboard/applications/stats"),
  interviewStats: () =>
    apiRequest<StatusStats>("/hr/dashboard/interviews/stats"),
  jobs: () => apiRequest<HrJob[]>("/hr/jobs"),
  job: (id: string) => apiRequest<HrJob>(`/hr/jobs/${id}`),
  createJob: (body: JobPayload) =>
    apiRequest<HrJob>("/hr/jobs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateJob: (id: string, body: JobPayload) =>
    apiRequest<HrJob>(`/hr/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updateJobStatus: (id: string, status: string) =>
    apiRequest<HrJob>(`/hr/jobs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteJob: (id: string) =>
    apiRequest<void>(`/hr/jobs/${id}`, { method: "DELETE" }),
  applications: (jobId: string) =>
    apiRequest<HrApplication[]>(`/hr/jobs/${jobId}/applications`),
  cvUrl: (id: string) => `${API_URL}/hr/applications/${id}/cv/file`,
  updateApplicationStatus: (id: string, status: string) =>
    apiRequest<HrApplication>(`/hr/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  interviews: () => apiRequest<Interview[]>("/hr/interviews"),
  interview: (id: string) => apiRequest<Interview>(`/hr/interviews/${id}`),
  applicationInterviews: (id: string) =>
    apiRequest<Interview[]>(`/hr/applications/${id}/interviews`),
  createInterview: (body: InterviewPayload) =>
    apiRequest<Interview>("/hr/interviews", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateInterview: (
    id: string,
    body: Omit<InterviewPayload, "applicationId">,
  ) =>
    apiRequest<Interview>(`/hr/interviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updateInterviewStatus: (id: string, status: string) =>
    apiRequest<Interview>(`/hr/interviews/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
