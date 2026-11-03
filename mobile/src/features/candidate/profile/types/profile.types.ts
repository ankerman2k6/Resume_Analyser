import type { CandidateCv, PageResponse } from '../../resumes/types/resume.types';

export type CandidateProfile = {
  _id: string;
  userId: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  location: { city: string | null; country: string | null };
  accountStatus: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CandidateStats = {
  cvCount: number;
  applicationCount: number;
  upcomingInterviewCount: number;
  avgMatchScore: number | null;
  analyzedApplicationCount: number;
  applicationCounts: {
    all: number; applied: number; reviewing: number; interview: number;
    accepted: number; rejected: number; withdrawn: number;
  };
};

export type CandidateApplication = {
  _id: string;
  cvId: string;
  jobId: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  canWithdraw: boolean;
  job: null | {
    _id: string;
    title: string;
    employmentType: string;
    salary: null | { min: number | null; max: number | null; currency: string; negotiable: boolean };
    location: null | { address: string | null; city: string | null; country: string | null; remote: boolean };
  };
  company: null | { _id: string; name: string; industry: string; logoUrl: string | null };
  aiAnalysis: null | {
    _id: string;
    analyzedAt: string;
    overallScore: number;
    scores: { overall: number; skills: number; experience: number; education: number; projects: number; certificates: number };
    recommendation: string;
    matchedSkills: string[];
    missingSkills: string[];
    strengths: string[];
    weaknesses: string[];
  };
  interview: null | {
    _id: string;
    scheduledAt: string;
    durationMinutes: number;
    mode: string;
    location: string | null;
    meetingLink: string | null;
    status: string;
  };
};

export type CareerSkill = { name: string; category: string | null; level: string | null; yearsOfExperience: number | null };

export type CandidateCareer = {
  cv: null | {
    _id: string;
    title: string;
    fileName: string;
    parseInfo: null | { status: string; parsedAt: string | null; parserVersion: string | null };
  };
  skills: CareerSkill[];
  experience: Array<{
    position: string | null; company: string | null; location: string | null;
    employmentType: string | null; startDate: string | null; endDate: string | null;
    current: boolean; description: string | null; achievements: string[]; technologies: string[];
  }>;
  education: Array<{
    degree: string | null; major: string | null; institution: string | null;
    startDate: string | null; endDate: string | null; status: string | null;
    gpa: null | { value: number; scale: number }; description: string | null;
  }>;
  certificates: Array<{
    name: string | null; issuer: string | null; issueDate: string | null;
    credentialId: string | null; credentialUrl: string | null; expirationDate: string | null;
  }>;
};

export type ProfileDashboardData = {
  profile: CandidateProfile | null;
  stats: CandidateStats | null;
  applications: PageResponse<CandidateApplication> | null;
  cvs: PageResponse<CandidateCv> | null;
  career: CandidateCareer | null;
};

export type UpdateCandidateProfile = {
  fullName: string;
  phone: string;
  location: { city: string; country: string };
};
