import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import RecruiterCompanyPage from './RecruiterCompanyPage';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/company" element={<RecruiterCompanyPage />} />
        <Route path="/login" element={<h1>Login destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillAccount(container) {
  fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: ' Nguyen Van A ' } });
  fireEvent.change(container.querySelector('input[type="tel"]'), { target: { value: '0901234567' } });
  fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'USER@example.com' } });
  fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'secret123' } });
}

describe('web registration flow', () => {
  it('submits the candidate profile as JSON and redirects to login after success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'candidate-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderRegistration();
    fillAccount(container);
    fireEvent.submit(container.querySelector('form'));
    await screen.findByText(/Đăng ký tài khoản thành công!/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/register');
    expect(JSON.parse(options.body)).toEqual({
      email: 'user@example.com', password: 'secret123', role: 'candidate',
      fullName: 'Nguyen Van A', phone: '0901234567', avatarUrl: '',
      location: { address: '', district: '', city: '', country: 'Việt Nam' },
    });
    expect(container.querySelector('button[type="submit"]')).toBeDisabled();
    await screen.findByRole('heading', { name: 'Login destination' }, { timeout: 2500 });
  });

  it('collects company details before registering a recruiter', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'recruiter-id' }) });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: 'Nhà tuyển dụng' }));
    fillAccount(container);
    fireEvent.submit(container.querySelector('form'));
    await screen.findByRole('heading', { name: 'Thông tin công ty' });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: ' Test Company ' } });
    fireEvent.submit(container.querySelector('form'));
    await screen.findByRole('heading', { name: 'Login destination' });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload).toMatchObject({
      role: 'recruiter', fullName: 'Nguyen Van A', email: 'user@example.com',
      password: 'secret123', company: { name: 'Test Company' },
    });
  });

  it('shows a duplicate-email error and allows retrying', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Email đã tồn tại', errors: {}, status: 409 }) }));
    const { container } = renderRegistration();
    fillAccount(container);
    fireEvent.submit(container.querySelector('form'));
    await screen.findByText('Email đã tồn tại');
    expect(container.querySelector('button[type="submit"]')).not.toBeDisabled();
    expect(screen.queryByText(/Đăng ký tài khoản thành công!/)).not.toBeInTheDocument();
  });

  it('rejects a blank name or short password before calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderRegistration();
    fillAccount(container);
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: '   ' } });
    fireEvent.submit(container.querySelector('form'));
    expect(screen.getByText('Vui lòng nhập họ và tên.')).toBeInTheDocument();
    fillAccount(container);
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: '12345' } });
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => expect(screen.getByText('Mật khẩu phải có ít nhất 6 ký tự.')).toBeInTheDocument());
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
