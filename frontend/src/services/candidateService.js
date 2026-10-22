const CANDIDATE_API = '/api/candidates/me';

/**
 * JWT của phiên đăng nhập được gửi qua Authorization: Bearer <token>.
 * /api được Vite proxy tới backend khi chạy dev. Không fallback mock/localStorage.
 * Lỗi giữ status/code để UI phân biệt chưa có profile, hết phiên và lỗi nghiệp vụ.
 */
const request = async (url, { method = 'GET', body, signal, binary = false } = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw Object.assign(new Error('Vui lòng đăng nhập để xem hồ sơ.'), { status: 401 });
  }
  const response = await fetch(url, {
    method, signal,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(
      response.status === 401
        ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        : [data.message, ...Object.values(data.errors || {})].filter(Boolean).join(' ')
          || 'Không thể thực hiện yêu cầu. Vui lòng thử lại.'
    ), { status: response.status, code: data.code });
  }
  if (response.status === 204) return null;
  return binary ? response.blob() : response.json();
};

/** GET /api/candidates/me/profile → ProfileDto: fullName, email, avatarUrl,
 * phone, location, accountStatus... 404 PROFILE_NOT_FOUND: UI cho tạo bằng PUT. */
export const getCandidateProfileApi = (signal) =>
  request(`${CANDIDATE_API}/profile`, { signal });

/** PUT /api/candidates/me/profile; body: fullName, phone, location:{city,country}.
 * Trả ProfileDto: 201 tạo mới, 200 cập nhật. Chuỗi rỗng xóa field tùy chọn.
 */
export const updateCandidateProfileApi = ({ fullName, phone, location }) =>
  request(`${CANDIDATE_API}/profile`, {
    method: 'PUT',
    body: { fullName, phone, location: { city: location.city, country: location.country } }
  });

/** GET /api/candidates/me/stats → StatsDto, tổng toàn bộ dữ liệu:
 * cvCount, applicationCount, upcomingInterviewCount, avgMatchScore (có thể null),
 * applicationCounts theo filter. Không tính tổng từ danh sách đã phân trang.
 */
export const getCandidateStatsApi = (signal) =>
  request(`${CANDIDATE_API}/stats`, { signal });

/** GET /api/candidates/me/applications?filter=all&page=0&size=10
 * filter: all/applied/reviewing/interview/accepted/rejected/withdrawn.
 * Trả PageResponse: content[], page, size, totalElements, totalPages, last.
 * Mỗi ApplicationDto có job, company, aiAnalysis, interview và canWithdraw.
 */
export const getCandidateApplicationsApi = ({ filter = 'all', page = 0, size = 10, signal } = {}) =>
  request(`${CANDIDATE_API}/applications?${new URLSearchParams({ filter, page, size })}`, { signal });

/** POST /api/candidates/me/applications/{applicationId}/withdraw, không có body.
 * Trả ApplicationDto status=withdrawn; giữ đơn trong lịch sử.
 */
export const withdrawApplicationApi = (applicationId) =>
  request(`${CANDIDATE_API}/applications/${encodeURIComponent(applicationId)}/withdraw`, { method: 'POST' });

/** GET /api/candidates/me/cvs?page=0&size=10 → PageResponse<CvSummaryDto>.
 * content chứa source.fileName, skills, parseInfo, canViewFile, canDelete,
 * deleteBlockedReason; không có isDefault hoặc fileSize.
 */
export const getCandidateCvsApi = ({ page = 0, size = 10, signal } = {}) =>
  request(`${CANDIDATE_API}/cvs?${new URLSearchParams({ page, size })}`, { signal });

/** GET /api/candidates/me/cvs/{cvId}/file → binary PDF có kiểm tra JWT/owner.
 * Trả Blob để UI tạo object URL; không mở endpoint trực tiếp thiếu Bearer.
 */
export const getCandidateCvFileApi = (cvId) =>
  request(`${CANDIDATE_API}/cvs/${encodeURIComponent(cvId)}/file`, { binary: true });

/** DELETE /api/candidates/me/cvs/{cvId} → 204, không trả danh sách.
 * UI tải lại CV/stats/career. CV đã sử dụng có thể bị backend từ chối xóa.
 */
export const deleteCandidateCvApi = (cvId) =>
  request(`${CANDIDATE_API}/cvs/${encodeURIComponent(cvId)}`, { method: 'DELETE' });

/** GET /api/candidates/me/career[?cvId=...] → CareerDto:
 * cv (nguồn + parseInfo), skills[], experience[], education[], certificates[].
 * Bỏ cvId: backend chọn CV mới nhất. Không có CV: cv=null, các mảng rỗng.
 * Career chỉ đọc; tải mới qua POST /api/resumes/upload ở resumeService.js.
 */
export const getCandidateCareerApi = ({ cvId, signal } = {}) =>
  request(`${CANDIDATE_API}/career${cvId ? `?${new URLSearchParams({ cvId })}` : ''}`, { signal });
