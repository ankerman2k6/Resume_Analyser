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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export async function loginApi(payload: LoginRequest,): Promise<LoginResponse> {
  if(!API_BASE_URL){
    throw new Error('Chưa cấu hình API')
  };
  const controller = new AbortController();
  const timeoutID = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch (`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await response.text();

    const data = responseText ? (JSON.parse(responseText) as LoginResponse | ApiErrorResponse) : null;

    if(!response.ok) {
      const errorData = data as ApiErrorResponse | null;

      throw new ApiError(
        errorData?.message || 'Đăng nhập thất bại',
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
      throw new Error('Máy chủ phản hồi quá lâu');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Đăng nhập thất bại');
  } finally {
    clearTimeout(timeoutID);
  }


  


}


