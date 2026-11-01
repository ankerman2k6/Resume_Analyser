export type HrDashboardCategoryCount = {
  name: string;
  count: number;
  applicants?: number;
};

export type HrDashboardMonthlyCount = {
  month: string;
  applicants: number;
};

export type HrDashboardData = {
  totalOpenJobs: number;
  totalApplications: number;
  interestedCandidates: number;
  jobsBySpecialty: HrDashboardCategoryCount[];
  jobsByDivision: HrDashboardCategoryCount[];
  candidateInterestTrend: HrDashboardMonthlyCount[];
};
