import type { HrDashboardData } from '../types/hrDashboard';

const jobCategories = [
  { name: 'Backend Development', count: 4 },
  { name: 'Frontend Development', count: 3 },
  { name: 'AI & Machine Learning', count: 2 },
  { name: 'Data Engineering', count: 2 },
  { name: 'UI/UX Design', count: 1 },
];

const departments = [
  { name: 'Kỹ thuật phần mềm & AI', count: 4, applicants: 48 },
  { name: 'Thiết kế UI/UX & Sản phẩm', count: 2, applicants: 18 },
  { name: 'Dữ liệu & Nền tảng Cloud', count: 2, applicants: 12 },
  { name: 'Kinh doanh & Marketing B2B', count: 2, applicants: 3 },
  { name: 'Nhân sự & Vận hành', count: 1, applicants: 2 },
  { name: 'Chăm sóc khách hàng', count: 1, applicants: 1 },
];

export const mockHrDashboard: HrDashboardData = {
  totalOpenJobs: 12,
  totalApplications: 84,
  interestedCandidates: 15,
  jobsBySpecialty: jobCategories,
  jobsByDivision: departments,
  candidateInterestTrend: [
    { month: '01/2026', applicants: 28 },
    { month: '02/2026', applicants: 35 },
    { month: '03/2026', applicants: 42 },
    { month: '04/2026', applicants: 38 },
    { month: '05/2026', applicants: 51 },
    { month: '06/2026', applicants: 57 },
    { month: '07/2026', applicants: 63 },
    { month: '08/2026', applicants: 59 },
    { month: '09/2026', applicants: 72 },
    { month: '10/2026', applicants: 84 },
  ],
};
