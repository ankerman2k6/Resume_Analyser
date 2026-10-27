import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobsPage } from './Jobs';
import * as api from '../../services/hrJobsService';

vi.mock('../../services/hrJobsService', () => ({
  getHrJobsApi: vi.fn(),
  createHrJobApi: vi.fn(),
  updateHrJobApi: vi.fn(),
  updateHrJobStatusApi: vi.fn(),
  deleteHrJobApi: vi.fn(),
}));

const job = {
  id: '507f1f77bcf86cd799439011',
  companyId: '507f1f77bcf86cd799439012',
  title: 'Backend Developer',
  description: 'Xây dựng API',
  category: 'Công nghệ thông tin',
  employmentType: 'full_time',
  location: { address: 'Cầu Giấy', city: 'Hà Nội', country: 'Việt Nam', remote: true },
  experience: { minYears: 2, maxYears: 4, level: 'middle' },
  requirements: {
    requiredSkills: ['Java'],
    preferredSkills: ['Docker'],
    education: { minimumDegree: 'bachelor', preferredMajors: ['Computer Science'] },
    minimumGpa: { value: 3, scale: 4 },
    languages: [{ name: 'English', minimumLevel: 'B2' }],
  },
  benefits: ['Bảo hiểm'],
  deadline: '2026-12-20T23:59:59Z',
  status: 'published',
};

describe('JobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getHrJobsApi.mockResolvedValue([job]);
  });

  it('hiển thị dữ liệu lồng nhau từ GET /api/hr/jobs', async () => {
    render(<JobsPage />);

    const title = await screen.findByText('Backend Developer');
    const row = title.closest('tr');

    expect(row).not.toBeNull();
    expect(within(row).getByText('Cầu Giấy, Hà Nội, Việt Nam · Remote')).toBeInTheDocument();
    expect(within(row).getByText('Middle · 2 - 4 năm')).toBeInTheDocument();
    expect(within(row).getByText('Toàn thời gian')).toBeInTheDocument();
    expect(within(row).getByText('Đang tuyển')).toBeInTheDocument();
  });

  it('hiển thị lỗi tải và cho phép gọi lại API', async () => {
    api.getHrJobsApi
      .mockRejectedValueOnce(new Error('Không có quyền truy cập'))
      .mockResolvedValueOnce([job]);

    render(<JobsPage />);
    expect(await screen.findByText('Không có quyền truy cập')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    await waitFor(() => expect(api.getHrJobsApi).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Backend Developer')).toBeInTheDocument();
  });

  it('giữ nguyên các requirement chưa có ô chỉnh sửa khi gửi PUT', async () => {
    api.updateHrJobApi.mockResolvedValue({ ...job, title: 'Backend Platform Developer' });
    render(<JobsPage />);

    await screen.findByText('Backend Developer');
    fireEvent.click(screen.getByRole('button', { name: 'Sửa' }));
    fireEvent.change(screen.getByLabelText(/Tiêu đề Job/), {
      target: { value: 'Backend Platform Developer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu Job' }));

    await waitFor(() => expect(api.updateHrJobApi).toHaveBeenCalledTimes(1));
    expect(api.updateHrJobApi.mock.calls[0][1].requirements).toEqual(job.requirements);
  });
});
