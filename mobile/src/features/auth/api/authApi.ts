import { getApiBaseUrl } from '../../../config/api';

export type LoginRequest = {
    email: string;
    password: string;
}

export type LoginResponse = {
    token: string;
    userId: string;
    email: string;
    role: 'candidate' | 'recruiter';
}

type ApiErrorResponse = {
  code?: string;
  message?: string;
  errors?: Record<string, string>;
  requestId?: string;
  status?: number;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function isLoginResponse(
  data: unknown,
): data is LoginResponse {
  if (
    typeof data !== 'object' ||
    data === null
  ) {
    return false;
  }

  const response = data as Partial<LoginResponse>;

  return (
    typeof response.token === 'string' &&
    typeof response.userId === 'string' &&
    typeof response.email === 'string' &&
    (
      response.role === 'candidate' ||
      response.role === 'recruiter'
    )
  );
}

export async function loginApi(payload: LoginRequest,): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeoutID = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch (`${getApiBaseUrl()}/auth/login`, {
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

    let data: LoginResponse | ApiErrorResponse | null = null;
    try {
      data = responseText ? JSON.parse(responseText) as LoginResponse | ApiErrorResponse : null;
    } catch {
      throw new ApiError(
        response.ok
          ? 'Máy chủ trả về dữ liệu đăng nhập không hợp lệ. Hãy kiểm tra địa chỉ API.'
          : 'Máy chủ trả về lỗi không hợp lệ. Hãy kiểm tra địa chỉ API và trạng thái backend.',
        response.status,
      );
    }

    if(!response.ok) {
      const errorData = data as ApiErrorResponse | null;

      throw new ApiError(
        errorData?.message || (response.status >= 500
          ? 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
          : 'Đăng nhập thất bại'),
        response.status,
        errorData?.code
      );
    }

    if (!isLoginResponse(data)) {
      throw new Error(
        'Phản hồi đăng nhập không đầy đủ.',
      );
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Máy chủ phản hồi quá lâu. Hãy kiểm tra backend và MongoDB.');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Đăng nhập thất bại');
  } finally {
    clearTimeout(timeoutID);
  }


  


}
