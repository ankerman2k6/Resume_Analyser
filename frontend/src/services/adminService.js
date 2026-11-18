export async function adminRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Vui lòng đăng nhập.");
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.message || `Không thể xử lý yêu cầu (${response.status}).`,
    );
  return data;
}
