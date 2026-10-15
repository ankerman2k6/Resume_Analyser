import {
  MOCK_CANDIDATE_PROFILE,
  MOCK_CANDIDATE_CVS,
  MOCK_CANDIDATE_APPLICATIONS
} from './mockCandidateData';

const STORAGE_KEYS = {
  PROFILE: 'cmcv_candidate_profile',
  CVS: 'cmcv_candidate_cvs',
  APPLICATIONS: 'cmcv_candidate_applications'
};

// Khởi tạo localStorage với mock data ban đầu nếu chưa có
const getLocalData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Lỗi lưu trữ dữ liệu local:', err);
  }
};

/**
 * Lấy thông tin hồ sơ cá nhân của ứng viên đang đăng nhập
 * Thử gọi GET /api/candidates/me/profile, nếu chưa có (404/500/offline) -> Dùng mock data
 */
export const getCandidateProfileApi = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch('/api/candidates/me/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend chưa có endpoint, fallback về mock
    }
  }

  // Fallback mock data
  const profile = getLocalData(STORAGE_KEYS.PROFILE, MOCK_CANDIDATE_PROFILE);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user && user.email) {
    return {
      ...profile,
      email: user.email,
      fullName: user.fullName || profile.fullName
    };
  }
  return profile;
};

/**
 * Cập nhật thông tin hồ sơ cá nhân của ứng viên
 * Gọi PUT /api/candidates/me/profile, fallback cập nhật localStorage
 */
export const updateCandidateProfileApi = async (updatedData) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch('/api/candidates/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
  }

  // Cập nhật local
  const current = getLocalData(STORAGE_KEYS.PROFILE, MOCK_CANDIDATE_PROFILE);
  const nextProfile = {
    ...current,
    ...updatedData,
    updatedAt: new Date().toISOString()
  };
  setLocalData(STORAGE_KEYS.PROFILE, nextProfile);
  return nextProfile;
};

/**
 * Lấy danh sách các đơn ứng tuyển của ứng viên
 * Gọi GET /api/candidates/me/applications, fallback mock data
 */
export const getCandidateApplicationsApi = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch('/api/candidates/me/applications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.content || [];
      }
    } catch {
      // Fallback
    }
  }

  return getLocalData(STORAGE_KEYS.APPLICATIONS, MOCK_CANDIDATE_APPLICATIONS);
};

/**
 * Lấy danh sách CV của ứng viên
 * Gọi GET /api/resumes (hoặc /api/candidates/me/cvs), fallback mock data
 */
export const getCandidateCvsApi = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch('/api/resumes', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.content || [];
        if (list.length > 0) return list;
      }
    } catch {
      // Fallback
    }
  }

  return getLocalData(STORAGE_KEYS.CVS, MOCK_CANDIDATE_CVS);
};

/**
 * Rút đơn ứng tuyển
 */
export const withdrawApplicationApi = async (applicationId) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch(`/api/candidates/me/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) return true;
    } catch {
      // Fallback
    }
  }

  const list = getLocalData(STORAGE_KEYS.APPLICATIONS, MOCK_CANDIDATE_APPLICATIONS);
  const updatedList = list.filter((app) => app._id !== applicationId);
  setLocalData(STORAGE_KEYS.APPLICATIONS, updatedList);
  return true;
};

/**
 * Đặt CV mặc định
 */
export const setDefaultCvApi = async (cvId) => {
  const list = getLocalData(STORAGE_KEYS.CVS, MOCK_CANDIDATE_CVS);
  const updated = list.map((cv) => ({
    ...cv,
    isDefault: cv._id === cvId
  }));
  setLocalData(STORAGE_KEYS.CVS, updated);
  return updated;
};

/**
 * Xóa CV
 */
export const deleteCandidateCvApi = async (cvId) => {
  const list = getLocalData(STORAGE_KEYS.CVS, MOCK_CANDIDATE_CVS);
  const updated = list.filter((cv) => cv._id !== cvId);
  setLocalData(STORAGE_KEYS.CVS, updated);
  return updated;
};
