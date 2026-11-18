import { clearSession, getAuthToken } from '../services/storage/authSession';
import { getApiBaseUrl } from '../config/api';
export { clearSession } from '../services/storage/authSession';

type ApiErrorBody = { code?: string; message?: string };
type RequestOptions = { timeoutMs?: number; authenticated?: boolean };
export type NetworkErrorKind = 'cancelled' | 'offline' | 'timeout';

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiNetworkError extends Error {
  constructor(public kind: NetworkErrorKind, message: string) {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

function normalizeNetworkError(error: unknown, timedOut: boolean): Error {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (timedOut || message.includes('timed out') || message.includes('timeout')) {
    return new ApiNetworkError('timeout', 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
  }
  if ((error instanceof Error && error.name === 'AbortError') || message.includes('canceled') || message.includes('cancelled') || message.includes('aborted')) {
    return new ApiNetworkError('cancelled', 'Yêu cầu đã bị hủy. Vui lòng thử đăng nhập lại.');
  }
  if (error instanceof TypeError || message.includes('network request failed') || message.includes('fetch failed')) {
    return new ApiNetworkError('offline', 'Không thể kết nối tới máy chủ. Hãy kiểm tra Wi-Fi, địa chỉ API và Windows Firewall.');
  }
  return error instanceof Error ? error : new Error('Đã xảy ra lỗi không xác định.');
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!/^https?:\/\//i.test(baseUrl)) throw new Error('EXPO_PUBLIC_API_BASE_URL phải là URL http hoặc https hợp lệ.');
  if (!path.startsWith('/')) throw new Error('Đường dẫn API phải bắt đầu bằng /.');

  const token = options.authenticated === false
    ? null
    : await getAuthToken();
  const timeoutMs = options.timeoutMs ?? 15_000;
  const controller = timeoutMs > 0 ? new AbortController() : undefined;
  let timedOut = false;
  const timeout = controller ? setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs) : undefined;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      ...(controller ? { signal: controller.signal } : {}),
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    const responseText = await response.text();
    let body: unknown;
    try { body = responseText ? JSON.parse(responseText) : undefined; } catch { body = responseText; }

    if (!response.ok) {
      if (response.status === 401 && path !== '/api/auth/login') await clearSession();
      const data = typeof body === 'object' && body ? body as ApiErrorBody : undefined;
      const fallback = response.status === 401 ? 'Email hoặc mật khẩu không chính xác.'
        : response.status === 403 ? 'Tài khoản không có quyền thực hiện thao tác này.'
        : response.status === 404 ? 'Không tìm thấy dữ liệu yêu cầu.'
        : response.status >= 500 ? 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
        : 'Yêu cầu không thành công.';
      throw new ApiError(response.status, data?.message || fallback, data?.code);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw normalizeNetworkError(error, timedOut);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
