import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import CandidateProfile from './CandidateProfile';

// HTTP fixtures kiểm tra cả JSX và candidateService thật; không mock lớp service.
const profile = {
  _id: 'p1', fullName: 'Nguyễn An', email: 'an@example.com', phone: '0901234567',
  location: { city: 'Hà Nội', country: 'Việt Nam' }, accountStatus: 'active'
};
const page = (content, overrides = {}) => ({
  content, page: 0, size: 10, totalElements: content.length, totalPages: 1, last: true, ...overrides
});
const application = {
  _id: 'a1', status: 'applied', canWithdraw: true, job: { title: 'React Engineer' },
  company: { name: 'Acme' }, appliedAt: '2026-10-01'
};
const cv = {
  _id: 'cv1', source: { fileName: 'An.pdf' }, skills: [],
  canDelete: true, canViewFile: true, createdAt: '2026-10-01'
};
const json = (body, status = 200) => ({
  ok: status < 400, status, json: async () => body
});
let routes;
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'candidate-jwt');
  localStorage.setItem('user', JSON.stringify({ fullName: 'Nguyễn An', email: 'an@example.com' }));
  routes = {
    profile,
    stats: { cvCount: 21, applicationCount: 32, upcomingInterviewCount: 2, avgMatchScore: 0,
      applicationCounts: { all: 32, applied: 31, reviewing: 0, interview: 0, accepted: 0, rejected: 0, withdrawn: 1 } },
    applications: page([application], { totalElements: 32, totalPages: 4, last: false }),
    cvs: page([cv]),
    career: { cv: { fileName: 'Latest.pdf' }, skills: [{ name: 'React', yearsOfExperience: 0 }],
      experience: [], education: [], certificates: [{ name: 'Cloud Certificate', issuer: 'Issuer' }] }
  };
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    if (options.method === 'POST' && url.endsWith('/withdraw')) {
      routes.applications = page([{ ...application, status: 'withdrawn', canWithdraw: false }]);
      return json(routes.applications.content[0]);
    }
    if (options.method === 'DELETE') {
      routes.cvs = page([]);
      return { ok: true, status: 204, json: () => { throw Error('204 has no body'); } };
    }
    if (options.method === 'PUT') {
      routes.profile = { ...profile, ...JSON.parse(options.body) };
      return json(routes.profile);
    }
    const key = new URL(url, 'http://localhost').pathname.split('/').at(-1);
    if (routes[key] instanceof Error) throw routes[key];
    if (routes[key]?.status === 404) return routes[key];
    return json(routes[key]);
  }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const mount = (tab = 'applications') => render(
  <AuthProvider><MemoryRouter initialEntries={[`/candidate/profile?tab=${tab}`]}>
    <CandidateProfile />
  </MemoryRouter></AuthProvider>
);

describe('CandidateProfile API integration', () => {
  it('uses server totals, preserves zero score and sends page/filter with JWT', async () => {
    mount();
    await screen.findByText('React Engineer');
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.queryByText('86%')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/api/candidates/me/applications?filter=all&page=1&size=10',
      expect.objectContaining({ headers: { Authorization: 'Bearer candidate-jwt' } })
    ));
    fireEvent.click(screen.getByRole('button', { name: 'Đã rút (1)' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      '/api/candidates/me/applications?filter=withdrawn&page=0&size=10', expect.anything()
    ));
  });

  it('withdraws using POST and retains the application in history', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Rút hồ sơ' }));
    await screen.findByText('Đã rút');
    expect(screen.getByText('React Engineer')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rút hồ sơ' })).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/candidates/me/applications/a1/withdraw',
      expect.objectContaining({ method: 'POST' }));
  });

  it('handles DELETE 204 and does not offer a default CV', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mount('resumes');
    await screen.findByText('An.pdf');
    expect(screen.queryByText('Đặt làm CV chính')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    await screen.findByText('Bạn chưa tải CV nào.');
    expect(fetch).toHaveBeenCalledWith('/api/candidates/me/cvs/cv1',
      expect.objectContaining({ method: 'DELETE' }));
  });

  it('respects CV permissions and loads PDF with JWT, then revokes the object URL', async () => {
    routes.cvs = page([{ ...cv, canDelete: false, deleteBlockedReason: 'CV đã được sử dụng.' }]);
    const originalFetch = fetch;
    vi.stubGlobal('fetch', vi.fn((url, options) => url.endsWith('/file')
      ? Promise.resolve({ ok: true, status: 200, blob: async () => new Blob(['PDF'], { type: 'application/pdf' }) })
      : originalFetch(url, options)));
    const createUrl = vi.fn(() => 'blob:test-cv');
    const revokeUrl = vi.fn();
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = createUrl;
      static revokeObjectURL = revokeUrl;
    });
    mount('resumes');
    await screen.findByText('An.pdf');
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeDisabled();
    expect(screen.getByText('CV đã được sử dụng.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    await screen.findByTitle('Nội dung CV');
    expect(fetch).toHaveBeenCalledWith('/api/candidates/me/cvs/cv1/file',
      expect.objectContaining({ headers: { Authorization: 'Bearer candidate-jwt' } }));
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(revokeUrl).toHaveBeenCalledWith('blob:test-cv');
  });

  it('shows career from its own endpoint, including zero years and certificates', async () => {
    mount('career');
    await screen.findByText(/Latest.pdf/);
    expect(screen.getByText('Cloud Certificate')).toBeInTheDocument();
    expect(screen.getByText(/0 năm/)).toBeInTheDocument();
    expect(screen.queryByText('Cập nhật thông tin')).not.toBeInTheDocument();
  });

  it('creates a missing profile using only supported fields', async () => {
    routes.profile = json({ code: 'PROFILE_NOT_FOUND', message: 'Chưa tạo hồ sơ' }, 404);
    mount('settings');
    await screen.findByText(/Bạn chưa có hồ sơ/);
    expect(screen.queryByText('Chức danh chuyên môn')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/candidates/me/profile',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ fullName: 'Nguyễn An', phone: '', location: { city: '', country: '' } })
      })));
    await screen.findByText('Đã lưu thông tin hồ sơ.');
  });

  it('shows API failure without restoring old localStorage mock records', async () => {
    localStorage.setItem('cmcv_candidate_applications', JSON.stringify([{ job: { title: 'FAKE JOB' } }]));
    routes.applications = new Error('Không thể kết nối máy chủ');
    mount();
    await screen.findByText('Không thể kết nối máy chủ');
    expect(screen.queryByText('FAKE JOB')).not.toBeInTheDocument();
    expect(screen.getByText('Nguyễn An')).toBeInTheDocument();
  });
});
