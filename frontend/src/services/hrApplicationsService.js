const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Vui lòng đăng nhập bằng tài khoản nhà tuyển dụng.');
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Không thể tải dữ liệu (HTTP ${response.status}).`);
  }
  return response;
};

export const getHrJobsApi = async () => (await request('/api/hr/jobs')).json();
export const getHrApplicationsApi = async (jobId) =>
  (await request(`/api/hr/jobs/${encodeURIComponent(jobId)}/applications`)).json();
export const updateHrApplicationStatusApi = async (id, status) =>
  (await request(`/api/hr/applications/${encodeURIComponent(id)}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  })).json();

export const downloadHrCvApi = async (applicationId) => {
  const response = await request(`/api/hr/applications/${encodeURIComponent(applicationId)}/cv/file`);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cv.pdf';
  link.click();
  URL.revokeObjectURL(url);
};
