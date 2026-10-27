import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CandidatesPage from './Candidates';
import * as api from '../../services/hrApplicationsService';

vi.mock('../../services/hrApplicationsService', () => ({
  getHrJobsApi: vi.fn(), getHrApplicationsApi: vi.fn(),
  updateHrApplicationStatusApi: vi.fn(), downloadHrCvApi: vi.fn(),
}));

describe('HR applications API integration', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renders contact data without matching scores and downloads the submitted CV', async () => {
    api.getHrJobsApi.mockResolvedValue([{ id: 'job-id', title: 'Vị trí tuyển dụng' }]);
    api.getHrApplicationsApi.mockResolvedValue([{
      id: 'application-id', jobId: 'job-id', fullName: 'Ứng viên API',
      email: 'contact@example.test', phone: '0900000000', status: 'reviewing',
      appliedAt: '2026-10-25T00:00:00Z', cvUrl: '/api/hr/applications/application-id/cv/file',
    }]);
    api.downloadHrCvApi.mockResolvedValue();
    render(<CandidatesPage />);
    expect(await screen.findByText('contact@example.test')).toBeInTheDocument();
    expect(screen.getByText('0900000000')).toBeInTheDocument();
    expect(screen.queryByText(/matching/i)).not.toBeInTheDocument();
    expect(api.getHrApplicationsApi).toHaveBeenCalledWith('job-id');
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tải CV đã nộp' }));
    await waitFor(() => expect(api.downloadHrCvApi).toHaveBeenCalledWith('application-id'));
  });

  it('shows API errors without falling back to sample candidates', async () => {
    api.getHrJobsApi.mockRejectedValue(new Error('Không có quyền truy cập'));
    render(<CandidatesPage />);
    expect(await screen.findByText('Không có quyền truy cập')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xem chi tiết' })).not.toBeInTheDocument();
  });
});
