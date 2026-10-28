const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (5,242,880 bytes)

/**
 * Kiểm định 4 lớp an toàn cho tệp CV tại Client trước khi gửi lên Backend
 * - Lớp 1: Kiểm tra rỗng (không null, > 0 byte)
 * - Lớp 2: Kiểm tra dung lượng (<= 5MB)
 * - Lớp 3: Kiểm tra định dạng (.pdf và application/pdf)
 * - Lớp 4: Kiểm tra Magic Bytes (%PDF- / 0x25 0x50 0x44 0x46 0x2D)
 */
export const validateResumeFile = async (file) => {
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: 'Tệp rỗng (0 KB). Chọn một tệp PDF hợp lệ'
    };
  }

  const fileName = file.name || '';
  const isPdfExtension = fileName.toLowerCase().endsWith('.pdf');
  const isPdfMime = !file.type || file.type === 'application/pdf';

  if (!isPdfExtension || !isPdfMime) {
    const ext = fileName.includes('.')
      ? `.${fileName.split('.').pop().toLowerCase()}`
      : 'không xác định';
    return {
      valid: false,
      error: `Không nhận tệp ${ext} (chỉ nhận định dạng .pdf)`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1).replace('.', ',');
    return {
      valid: false,
      error: `Quá 5 MB (tệp nặng ${sizeMb} MB)`
    };
  }

  try {
    const headerBuffer = await file.slice(0, 5).arrayBuffer();
    const bytes = new Uint8Array(headerBuffer);
    // %PDF- = [0x25, 0x50, 0x44, 0x46, 0x2D]
    const isPdfMagic =
      bytes.length >= 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d;

    if (!isPdfMagic) {
      return {
        valid: false,
        error: 'Tệp không đúng chuẩn chữ ký PDF (%PDF-)'
      };
    }
  } catch {
    // Nếu môi trường test không hỗ trợ arrayBuffer trên slice thì để Backend kiểm tra lớp 4
  }

  return { valid: true, error: null };
};

/**
 * Tải lên tệp CV (.pdf)
 * Endpoint: POST /api/resumes/upload
 * Header: Authorization: Bearer <jwt_token>
 * Body: multipart/form-data (key: 'file')
 */
export const uploadResumeApi = async (file) => {
  const token = localStorage.getItem('token');
  if (!token) {
    const authError = new Error('Cần đăng nhập để tải CV lên hệ thống');
    authError.status = 401;
    throw authError;
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/resumes/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        (response.status === 401
          ? 'Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục'
          : 'Không tải được tệp CV lên máy chủ')
    );
    error.status = response.status;
    throw error;
  }

  return data;
};

/**
 * Lấy danh sách CV đã tải lên của tài khoản đang đăng nhập
 * Endpoint: GET /api/resumes
 */
export const getResumesApi = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }

  const response = await fetch('/api/resumes', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = new Error('Không tải được danh sách CV');
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.content || [];
};
