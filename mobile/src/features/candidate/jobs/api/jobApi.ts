import { apiClient } from '../../../../services/api/apiClient';
import type {
  JobResponse,
  CompanyResponse,
  PageResponse,
  JobSearchParams,
} from '../types/job.types';

export const jobApi = {
  /**
   * Tìm kiếm việc làm trực tiếp từ Backend Spring Boot:
   * GET /api/jobs/search?keyword=...&profession=...&location=...&page=...&size=...
   */
  async searchJobs(params: JobSearchParams = {}): Promise<PageResponse<JobResponse>> {
    return apiClient.get<PageResponse<JobResponse>>('/jobs/search', {
      params: {
        keyword: params.keyword,
        profession: params.profession,
        location: params.location,
        page: params.page ?? 0,
        size: params.size ?? 15,
      },
    });
  },

  /**
   * Lấy chi tiết một việc làm theo ID từ Backend Spring Boot:
   * GET /api/jobs/{id}
   */
  async getJobById(id: string): Promise<JobResponse> {
    return apiClient.get<JobResponse>(`/jobs/${id}`);
  },

  /**
   * Lấy thông tin công ty theo ID từ Backend Spring Boot:
   * GET /api/companies/{id}
   */
  async getCompanyById(companyId: string): Promise<CompanyResponse> {
    return apiClient.get<CompanyResponse>(`/companies/${companyId}`);
  },

  /**
   * Lấy danh sách các công ty tuyển dụng trực tiếp từ database:
   * Backend Spring Boot hỗ trợ GET /api/jobs/search để lấy các việc làm đang công khai trong database.
   * Ta tổng hợp danh sách companyId thực tế từ các tin tuyển dụng và gọi GET /api/companies/{id}
   * để trả về chính xác các công ty đang có trong MongoDB.
   */
  async getFeaturedCompanies(): Promise<CompanyResponse[]> {
    try {
      const response = await apiClient.get<PageResponse<JobResponse>>('/jobs/search', {
        params: { page: 0, size: 50 },
      });
      const jobs = response?.content || [];
      const companyIds = Array.from(
        new Set(
          jobs
            .map((j) => j.companyId)
            .filter((id): id is string => Boolean(id) && typeof id === 'string')
        )
      );

      const companies = await Promise.all(
        companyIds.map(async (companyId) => {
          try {
            return await apiClient.get<CompanyResponse>(`/companies/${companyId}`);
          } catch {
            return null;
          }
        })
      );

      return companies.filter((c): c is CompanyResponse => c !== null);
    } catch (err) {
      console.warn('Lỗi khi tải danh sách công ty từ database:', err);
      return [];
    }
  },
};
