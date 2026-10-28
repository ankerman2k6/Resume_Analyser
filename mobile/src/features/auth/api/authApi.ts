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

const API_BASE_URL = process.env.API_BASE_URL


