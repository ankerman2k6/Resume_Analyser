import { apiRequest } from '../../../core/apiClient';

export { ApiError, ApiNetworkError } from '../../../core/apiClient';
export type Role = 'candidate' | 'recruiter';
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; userId: string; email: string; role: Role };
export type AuthenticatedUser = { id: string; email: string; role: Role; emailVerified: boolean; status: string };

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    },
    { timeoutMs: 20_000, authenticated: false },
  );

  if (!data?.token || !data.userId || !data.email || !['candidate', 'recruiter'].includes(data.role)) {
    throw new Error('Phản hồi đăng nhập từ máy chủ không đầy đủ.');
  }
  return data;
}

export function getCurrentUserApi(): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>('/api/auth/me');
}
