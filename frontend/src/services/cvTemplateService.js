const API = '/api/cv-templates';

const readJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.message || 'Không thể tải mẫu CV.'), {
      status: response.status,
      code: data.code
    });
  }
  return data;
};

export const getCvTemplatesApi = ({ page = 0, size = 12, signal } = {}) =>
  fetch(`${API}?${new URLSearchParams({ page, size })}`, { signal }).then(readJson);

export const getCvTemplateDetailApi = (templateId, signal) =>
  fetch(`${API}/${encodeURIComponent(templateId)}`, { signal }).then(readJson);
