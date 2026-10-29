import * as SecureStore from 'expo-secure-store';
import { getApiBaseUrl } from '../../config/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    return null;
  }
}

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const token = await getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const errObj = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null;
      const message =
        (errObj?.message as string) ||
        (typeof data === 'string' ? data : `Lỗi yêu cầu (${response.status})`);
      const code = errObj?.code as string | undefined;
      throw new ApiError(message, response.status, code, data);
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Yêu cầu hết thời gian chờ (Timeout). Vui lòng thử lại.', 408);
    }
    const message = error instanceof Error ? error.message : 'Lỗi kết nối máy chủ.';
    throw new ApiError(message, 0);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, 'GET', undefined, options),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => request<T>(endpoint, 'POST', body, options),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => request<T>(endpoint, 'PUT', body, options),
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, 'DELETE', undefined, options),
};
