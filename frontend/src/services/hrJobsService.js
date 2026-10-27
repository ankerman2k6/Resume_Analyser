const HR_JOBS_ENDPOINT = '/api/hr/jobs';

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Vui lòng đăng nhập bằng tài khoản nhà tuyển dụng.');

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.detail || `Không thể xử lý yêu cầu (HTTP ${response.status}).`);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const getHrJobsApi = (options = {}) => request(HR_JOBS_ENDPOINT, options);

export const createHrJobApi = (payload) => request(HR_JOBS_ENDPOINT, {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const updateHrJobApi = (jobId, payload) => request(
  `${HR_JOBS_ENDPOINT}/${encodeURIComponent(jobId)}`,
  { method: 'PUT', body: JSON.stringify(payload) },
);

export const updateHrJobStatusApi = (jobId, status) => request(
  `${HR_JOBS_ENDPOINT}/${encodeURIComponent(jobId)}/status`,
  { method: 'PATCH', body: JSON.stringify({ status }) },
);

export const deleteHrJobApi = (jobId) => request(
  `${HR_JOBS_ENDPOINT}/${encodeURIComponent(jobId)}`,
  { method: 'DELETE' },
);
