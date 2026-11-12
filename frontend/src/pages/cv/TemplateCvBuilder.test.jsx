import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import TemplateCvBuilder from './TemplateCvBuilder';
import { getCvTemplatesApi, getCvTemplateDetailApi } from '../../services/cvTemplateService';
import { createCvFromTemplateApi, getCandidateCvFileApi } from '../../services/candidateService';

vi.mock('../../services/cvTemplateService', () => ({
  getCvTemplatesApi: vi.fn(), getCvTemplateDetailApi: vi.fn()
}));
vi.mock('../../services/candidateService', () => ({
  createCvFromTemplateApi: vi.fn(), getCandidateCvFileApi: vi.fn()
}));

beforeEach(() => {
  getCvTemplatesApi.mockResolvedValue({
    content: [{ id: 'abc', name: 'Clean Fresher', description: 'Cho người mới', thumbnailUrl: '/templates/clean-fresher.png' }],
    totalElements: 1, totalPages: 1, last: true
  });
  getCvTemplateDetailApi.mockResolvedValue({ id: 'abc', name: 'Clean Fresher', editorSchema: { sections: [
    { key: 'personalInfo' }, { key: 'summary' }, { key: 'experience' }, { key: 'education' }, { key: 'skills' }
  ] } });
  createCvFromTemplateApi.mockResolvedValue({ _id: 'cv123', title: 'CV Nguyễn An', source: { fileName: 'CV_Nguyen_An.pdf' } });
  getCandidateCvFileApi.mockResolvedValue(new Blob(['%PDF-'], { type: 'application/pdf' }));
  Element.prototype.scrollIntoView = vi.fn();
  URL.createObjectURL = vi.fn(() => 'blob:cv-test');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => vi.clearAllMocks());

it('lists templates, submits structured CV data and offers the saved PDF', async () => {
  render(<MemoryRouter><TemplateCvBuilder /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Dùng mẫu này' }));
  await screen.findByRole('heading', { name: 'Nhập nội dung CV' });
  fireEvent.change(screen.getByLabelText('Tiêu đề CV'), { target: { value: 'CV Nguyễn An' } });
  fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Nguyễn An' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'an@example.com' } });
  fireEvent.change(screen.getByLabelText(/Kỹ năng/), { target: { value: 'Java, SQL' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu CV và xuất PDF' }));
  await waitFor(() => expect(createCvFromTemplateApi).toHaveBeenCalledWith(expect.objectContaining({
    templateId: 'abc', title: 'CV Nguyễn An', content: expect.objectContaining({
      personalInfo: expect.objectContaining({ fullName: 'Nguyễn An', email: 'an@example.com' }),
      skills: ['Java', 'SQL']
    })
  })));
  expect(await screen.findByTitle('Xem trước CV Nguyễn An')).toHaveAttribute('src', 'blob:cv-test');
  expect(screen.getByRole('link', { name: 'Tải PDF' })).toHaveAttribute('download', 'CV_Nguyen_An.pdf');
});

it('shows a retry action when the template API fails', async () => {
  getCvTemplatesApi.mockRejectedValueOnce(new Error('Mất kết nối'));
  render(<MemoryRouter><TemplateCvBuilder /></MemoryRouter>);
  expect(await screen.findByText('Mất kết nối')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
  expect(await screen.findByText('Clean Fresher')).toBeInTheDocument();
});
