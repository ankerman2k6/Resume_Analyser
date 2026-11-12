import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import CandidatePage from './index';
import { getCompanyDetailApi, searchJobsApi } from '../../services/jobsService';

vi.mock('./CandidateSearch', () => ({ default: ({ onSearch }) => <button type="button" onClick={() => onSearch({ keyword: 'Java', industry: '', provinces: [], isAllProvinces: false })}>Tìm Java</button> }));
vi.mock('../../services/jobsService', () => ({ searchJobsApi: vi.fn(), getCompanyDetailApi: vi.fn() }));

const job = (id, companyId, title) => ({ id, companyId, title, category: 'Công nghệ thông tin' });
const page = (content) => ({ content, page: 0, totalPages: 1, totalElements: content.length });

beforeEach(() => {
  localStorage.setItem('user', '{}');
  getCompanyDetailApi.mockImplementation(async (id) => ({ id, name: id === 'company-a' ? 'Công ty A' : 'Công ty B', logoUrl: `/${id}.png` }));
});

it('shows each job with the company matching its companyId', async () => {
  searchJobsApi.mockResolvedValue(page([job('job-a', 'company-a', 'Backend A'), job('job-b', 'company-b', 'Backend B')]));
  render(<MemoryRouter><CandidatePage /></MemoryRouter>);
  const cardA = (await screen.findByRole('link', { name: 'Xem chi tiết Backend A' }));
  const cardB = screen.getByRole('link', { name: 'Xem chi tiết Backend B' });
  expect(within(cardA).getByText('Công ty A')).toBeInTheDocument();
  expect(within(cardB).getByText('Công ty B')).toBeInTheDocument();
  expect(cardA.querySelector('.job-company-logo img')).toHaveAttribute('src', '/company-a.png');
  expect(cardB.querySelector('.job-company-logo img')).toHaveAttribute('src', '/company-b.png');
});

it('ignores an older search response after filters change', async () => {
  let resolveOld;
  searchJobsApi.mockImplementation(({ keyword }) => keyword
    ? Promise.resolve(page([job('job-new', 'company-b', 'Java Developer')]))
    : new Promise((resolve) => { resolveOld = resolve; }));
  render(<MemoryRouter><CandidatePage /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Tìm Java' }));
  expect(await screen.findByRole('link', { name: 'Xem chi tiết Java Developer' })).toBeInTheDocument();
  await act(async () => { resolveOld(page([job('job-old', 'company-a', 'Old Developer')])); });
  expect(screen.queryByRole('link', { name: 'Xem chi tiết Old Developer' })).not.toBeInTheDocument();
});
