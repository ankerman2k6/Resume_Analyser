import { afterEach, describe, expect, it, vi } from 'vitest';
import { loginApi, registerApi } from './authService';

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/');
});

describe('authentication API through the same-origin Nginx proxy', () => {
  it('sends login to an absolute /api path even from a nested route', async () => {
    window.history.replaceState({}, '', '/auth/account/');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'test-token' }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(loginApi('user@example.com', 'password', 'candidate')).resolves.toEqual({ token: 'test-token' });
    const [path, options] = fetchMock.mock.calls[0];
    expect(new URL(path, window.location.href).pathname).toBe('/api/auth/login');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'user@example.com', password: 'password', role: 'candidate' });
  });

  it('sends the complete registration payload to the API', async () => {
    const payload = {
      email: 'user@example.com',
      password: 'password',
      role: 'candidate',
      fullName: 'Nguyễn Văn A',
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ role: 'candidate' }) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(registerApi(payload)).resolves.toEqual({ role: 'candidate' });

    const [path, options] = fetchMock.mock.calls[0];
    expect(new URL(path, window.location.href).pathname).toBe('/api/auth/register');
    expect(JSON.parse(options.body)).toEqual(payload);
  });

  it('propagates failed login API responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Rejected' }) }));
    await expect(loginApi('user@example.com', 'bad-password', 'candidate')).rejects.toThrow('Rejected');
  });

  it('propagates failed registration API responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Rejected' }) }));
    await expect(registerApi({ email: 'user@example.com' })).rejects.toThrow('Rejected');
  });
});
