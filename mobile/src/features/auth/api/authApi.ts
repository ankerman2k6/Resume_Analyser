import { getApiBaseUrl } from '../../../config/api';
import type { AuthSession } from '../../../services/storage/authSession';
export { saveAuthSession } from '../../../services/storage/authSession';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = AuthSession & {
  needsCompany?: boolean;
};

export type RegisterRequest = LoginRequest & {
  fullName: string;
  phone: string;
  role: LoginResponse['role'];
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function requestSession(
  action: 'login' | 'register',
  payload: LoginRequest | RegisterRequest,
): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const actionName = action === 'login' ? 'đăng nhập' : 'đăng ký';

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/${action}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      const parsed: unknown = responseText ? JSON.parse(responseText) : null;
      if (parsed && typeof parsed === 'object') data = parsed as Record<string, unknown>;
    } catch {
      throw new ApiError('Máy chủ trả về dữ liệu không hợp lệ. Hãy kiểm tra địa chỉ API.', response.status);
    }

    if (!response.ok) {
      throw new ApiError(
        typeof data.message === 'string' ? data.message : `Yêu cầu ${actionName} thất bại.`,
        response.status,
        typeof data.code === 'string' ? data.code : undefined,
      );
    }

    // Older backend releases create the account but do not return a session.
    if (action === 'register' && typeof data.id === 'string' && !data.token) {
      return requestSession('login', { email: payload.email, password: payload.password });
    }

    const userId = action === 'register' ? data.id : data.userId;
    if (typeof userId !== 'string' || !userId ||
        typeof data.token !== 'string' || !data.token ||
        typeof data.email !== 'string' || !data.email ||
        (data.role !== 'candidate' && data.role !== 'recruiter')) {
      throw new Error(`Phản hồi ${actionName} không đầy đủ.`);
    }

    return {
      userId,
      email: data.email,
      role: data.role,
      token: data.token,
      needsCompany: data.role === 'recruiter' && (action === 'register' || data.needsCompany === true),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  return requestSession('login', payload);
}

export function registerApi(payload: RegisterRequest): Promise<LoginResponse> {
  return registerAndVerify(payload);
}

async function registerAndVerify(payload: RegisterRequest): Promise<LoginResponse> {
  const session = await requestSession('register', payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${session.token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      signal: controller.signal,
    });
    const user = await response.json();
    if (!response.ok || user.id !== session.userId || user.email !== session.email || user.role !== payload.role) {
      throw new Error('Chưa xác nhận được tài khoản trên máy chủ. Vui lòng thử đăng nhập bằng email vừa đăng ký.');
    }
    return { ...session, needsCompany: session.role === 'recruiter' };
  } finally {
    clearTimeout(timeout);
  }
}
