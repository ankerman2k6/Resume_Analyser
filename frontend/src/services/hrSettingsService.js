const HR_SETTINGS_ENDPOINT = '/api/hr/settings';

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Vui lòng đăng nhập bằng tài khoản nhà tuyển dụng.');

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.detail || `Không thể xử lý cài đặt (HTTP ${response.status}).`);
  }

  return response.json();
};

export const getHrSettingsApi = () => request(HR_SETTINGS_ENDPOINT);

export const updateHrSettingsApi = (payload) => request(HR_SETTINGS_ENDPOINT, {
  method: 'PUT',
  body: JSON.stringify(payload),
});
