import type { Job } from '../types/models';

export const mockJobs: Job[] = [
  {
    id: 'job-frontend-001',
    title: 'Frontend Developer',
    company: 'KONEK Technology',
    location: 'Hà Nội · Hybrid',
    employmentType: 'Full-time',
    salary: '15–25 triệu VND',
    description: 'Xây dựng trải nghiệm web và mobile giúp ứng viên tìm được cơ hội phù hợp.',
    skills: ['React', 'TypeScript', 'REST API'],
  },
  {
    id: 'job-backend-002',
    title: 'Backend Java Developer',
    company: 'KONEK Technology',
    location: 'Hồ Chí Minh · On-site',
    employmentType: 'Full-time',
    salary: '18–30 triệu VND',
    description: 'Phát triển API và dịch vụ phân tích CV trên nền tảng Spring Boot.',
    skills: ['Java', 'Spring Boot', 'MongoDB'],
  },
];
