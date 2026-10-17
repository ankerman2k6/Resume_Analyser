export const getHrDashboard = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Hãy đăng nhập để xem dữ liệu Dashboard HR.');
  }

  const response = await fetch('/api/hr/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu Dashboard HR (HTTP ${response.status}).`);
  }

  return response.json();
};
