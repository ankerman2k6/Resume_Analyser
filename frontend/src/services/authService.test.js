import { afterEach, describe, expect, it, vi } from 'vitest';
import { loginApi, registerApi } from './authService';

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/');
});

describe('authentication API through the same-origin Nginx proxy', () => {
  it.each([
    ['login', loginApi],
    ['register', registerApi],
  ])('sends %s to an absolute /api path even from a nested route', async (action, api) => {
    window.history.replaceState({}, '', '/auth/account/');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'test-token' }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(api('user@example.com', 'password', 'candidate')).resolves.toEqual({ token: 'test-token' });
    const [path, options] = fetchMock.mock.calls[0];
    expect(new URL(path, window.location.href).pathname).toBe(`/api/auth/${action}`);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'user@example.com', password: 'password', role: 'candidate' });
  });

  it.each([loginApi, registerApi])('propagates failed API responses', async (api) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Rejected' }) }));
    await expect(api('user@example.com', 'bad-password', 'candidate')).rejects.toThrow('Rejected');
  });
});
