import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import JobDetail from './JobDetail';
import { getCompanyDetailApi, getJobDetailApi } from '../../services/jobsService';
import { applyToJobApi, getCandidateCvsApi } from '../../services/candidateService';

vi.mock('../../services/jobsService', () => ({ getJobDetailApi: vi.fn(), getCompanyDetailApi: vi.fn() }));
vi.mock('../../services/candidateService', () => ({ applyToJobApi: vi.fn(), getCandidateCvsApi: vi.fn() }));

const renderPage = () => render(
  <MemoryRouter initialEntries={['/candidate/jobs/job-1']}>
    <Routes><Route path="/candidate/jobs/:jobId" element={<JobDetail />} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  getJobDetailApi.mockResolvedValue({ title: 'Backend Developer', description: 'Mô tả', requirements: {} });
  getCompanyDetailApi.mockResolvedValue(null);
  getCandidateCvsApi.mockResolvedValue({ content: [
    { _id: 'cv-1', title: 'CV Backend', source: { fileName: 'backend.pdf' }, canViewFile: true },
    { _id: 'cv-2', title: 'CV lỗi', source: { fileName: 'missing.pdf' }, canViewFile: false }
  ], totalPages: 1 });
  applyToJobApi.mockResolvedValue({ _id: 'application-1', status: 'applied' });
});

it('opens CV picker and submits the selected CV to the job application API', async () => {
  renderPage();
  fireEvent.click((await screen.findAllByRole('button', { name: 'Ứng tuyển ngay' }))[0]);
  const dialog = await screen.findByRole('dialog', { name: 'Chọn CV để ứng tuyển' });
  await within(dialog).findByText('CV Backend');
  expect(getCandidateCvsApi).toHaveBeenCalledWith(expect.objectContaining({ page: 0, size: 10 }));
  expect(within(dialog).getByRole('radio', { name: /CV lỗi/ })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('radio', { name: /CV Backend/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Ứng tuyển với CV đã chọn' }));
  await waitFor(() => expect(applyToJobApi).toHaveBeenCalledWith('job-1', 'cv-1'));
  expect(await screen.findByText(/Đã gửi hồ sơ ứng tuyển thành công/)).toBeInTheDocument();
});

it('shows the backend error and keeps the picker open for retry', async () => {
  applyToJobApi.mockRejectedValueOnce(new Error('Bạn đã ứng tuyển vị trí này rồi.'));
  renderPage();
  fireEvent.click((await screen.findAllByRole('button', { name: 'Ứng tuyển ngay' }))[0]);
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(await within(dialog).findByRole('radio', { name: /CV Backend/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Ứng tuyển với CV đã chọn' }));
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('Bạn đã ứng tuyển vị trí này rồi.');
});
