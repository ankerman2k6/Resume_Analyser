import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  validateResumeFile,
  uploadResumeApi,
  getResumesApi
} from '../../services/resumeService';
import './index.css';

// Dữ liệu mẫu phủ ca biên (tên dài cắt giữa giữ đuôi .pdf, tệp đã tải xong, tệp vượt quá 5MB bị từ chối)
const INITIAL_SAMPLE_ITEMS = [
  {
    id: 'sample-1',
    originalFileName:
      'Nguyen-Thanh-An-Senior-Frontend-Developer-Resume-2026-Cap-Nhat.pdf',
    fileSize: 1542031,
    status: 'uploaded',
    progress: 100,
    uploadedAtLabel: '11/10',
    errorMessage: null,
    fileObject: null
  },
  {
    id: 'sample-2',
    originalFileName: 'CV_Ung_Tuyen_Java_Spring_Boot_Developer.pdf',
    fileSize: 2411724,
    status: 'uploaded',
    progress: 100,
    uploadedAtLabel: '10/10',
    errorMessage: null,
    fileObject: null
  },
  {
    id: 'sample-3',
    originalFileName: 'Ho_So_Nang_Luc_Portfolio_Full_Resolution.pdf',
    fileSize: 7130316,
    status: 'rejected',
    progress: 0,
    uploadedAtLabel: null,
    errorMessage: 'Quá 5 MB (tệp nặng 6,8 MB)',
    fileObject: null
  }
];

/**
 * Định dạng dung lượng tệp sang MB/KB theo chuẩn tiếng Việt (dấu phẩy thập phân)
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) {
    return `${mb.toFixed(1).replace('.', ',')} MB`;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} KB`;
};

/**
 * Định dạng ngày tải lên ngắn gọn (bỏ năm nếu trong năm hiện tại)
 */
const formatUploadedDate = (isoString) => {
  if (!isoString) return 'Hôm nay';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Hôm nay';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

/**
 * Cắt tên tệp ở GIỮA, giữ lại ~8 ký tự cuối của phần tên + đuôi .pdf (luật T14)
 */
const splitFileNameMiddle = (fileName = '') => {
  const threshold = 36;
  if (fileName.length <= threshold) {
    return {
      isTruncated: false,
      head: fileName,
      tail: ''
    };
  }

  const dotIndex = fileName.lastIndexOf('.');
  const ext = dotIndex !== -1 ? fileName.slice(dotIndex) : '';
  const baseName = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;

  const tailChars = Math.min(8, Math.max(4, baseName.length - 10));
  const tail = `${baseName.slice(-tailChars)}${ext}`;
  const head = baseName.slice(0, baseName.length - tailChars);

  return {
    isTruncated: true,
    head,
    tail
  };
};

const CVUploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropzoneLabelRef = useRef(null);

  const [fileItems, setFileItems] = useState(INITIAL_SAMPLE_ITEMS);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Tự động đồng bộ danh sách CV thật từ Backend nếu đã đăng nhập
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    getResumesApi()
      .then((serverList) => {
        if (!isMounted || !Array.isArray(serverList) || serverList.length === 0) {
          return;
        }
        const mapped = serverList.map((item) => ({
          id: item.id,
          originalFileName: item.originalFileName || 'CV_Ung_Vien.pdf',
          fileSize: item.fileSize || 0,
          status: 'uploaded',
          progress: 100,
          uploadedAtLabel: formatUploadedDate(item.uploadedAt),
          errorMessage: null,
          fileObject: null
        }));
        setFileItems(mapped);
      })
      .catch(() => {
        // Giữ nguyên danh sách mẫu nếu chưa kết nối được Backend
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Thực thi tải 1 tệp lên Backend
  const startUploadItem = async (itemId, file) => {
    setFileItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, status: 'uploading', progress: 28, errorMessage: null }
          : it
      )
    );

    const progressTimer = setInterval(() => {
      setFileItems((prev) =>
        prev.map((it) =>
          it.id === itemId && it.status === 'uploading'
            ? { ...it, progress: Math.min(88, it.progress + 15) }
            : it
        )
      );
    }, 180);

    try {
      const created = await uploadResumeApi(file);
      clearInterval(progressTimer);

      setFileItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
              ...it,
              id: created.id || created._id || itemId,
              originalFileName: created.originalFileName || created.source?.fileName || file.name,
              fileSize: created.fileSize || file.size,
              status: 'uploaded',
              progress: 100,
              uploadedAtLabel: formatUploadedDate(created.uploadedAt || created.createdAt),
              errorMessage: null
            }
            : it
        )
      );

      showToast('Đã tải lên 1 bản CV');
    } catch (err) {
      clearInterval(progressTimer);
      setFileItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
              ...it,
              status: 'error',
              progress: 0,
              isAuthError: err.status === 401,
              errorMessage:
                err.message || 'Không tải được tệp lên máy chủ'
            }
            : it
        )
      );
    }
  };

  // Xử lý danh sách tệp khi người dùng chọn hoặc kéo thả
  const processSelectedFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    for (const file of files) {
      const tempId = `local-${Date.now()}-${crypto.randomUUID()}`;
      const validation = await validateResumeFile(file);

      if (!validation.valid) {
        setFileItems((prev) => [
          ...prev,
          {
            id: tempId,
            originalFileName: file.name || 'Tep_khong_hop_le',
            fileSize: file.size || 0,
            status: 'rejected',
            progress: 0,
            uploadedAtLabel: null,
            errorMessage: validation.error,
            fileObject: null
          }
        ]);
      } else {
        setFileItems((prev) => [
          ...prev,
          {
            id: tempId,
            originalFileName: file.name,
            fileSize: file.size,
            status: 'uploading',
            progress: 15,
            uploadedAtLabel: null,
            errorMessage: null,
            fileObject: file
          }
        ]);
        startUploadItem(tempId, file);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    processSelectedFiles(e.target.files);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processSelectedFiles(e.dataTransfer.files);
  };

  // Xoá dòng tệp lỗi / huỷ tải và giữ focus hợp lệ (luật I31)
  const handleRemoveItem = (id) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
    requestAnimationFrame(() => {
      dropzoneLabelRef.current?.focus();
    });
  };

  const handleRetryItem = (item) => {
    if (item.isAuthError) {
      navigate('/login');
      return;
    }
    if (item.fileObject) {
      startUploadItem(item.id, item.fileObject);
    }
  };

  return (
    <div className="cv-upload-page">
      <div className="cv-upload-container">
        {/* Đầu trang: Đúng một thẻ h1 */}
        <header className="cv-page-header">
          <h1 className="cv-page-title">Tải lên &amp; Quản lý CV</h1>
          <p className="cv-page-subtitle">
            Tải hồ sơ định dạng PDF để hệ thống kiểm định an toàn và phân tích mức độ phù hợp với công việc.
          </p>
        </header>

        {/* Card duy nhất: Khung kéo thả ở trên, danh sách tệp ở dưới (components/file-upload.md) */}
        <section className="cv-upload-card" aria-label="Khu vực tải tệp CV">
          <label
            ref={dropzoneLabelRef}
            tabIndex={0}
            className={`cv-dropzone ${isDragging ? 'is-dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="cv-sr-only"
              onChange={handleFileChange}
            />

            <p className="cv-dropzone-title">
              {isDragging ? 'Thả tệp để tải lên' : 'Kéo thả tài liệu CV vào đây'}
            </p>
            <p className="cv-dropzone-hint">
              Định dạng PDF (.pdf). Tối đa 5 MB mỗi tệp
            </p>

            {/* Span mang dáng nút viền h-9 có icon upload, không dùng <button> bên trong <label> */}
            <span className="cv-dropzone-btn">
              <svg
                className="cv-dropzone-btn-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Chọn tệp PDF</span>
            </span>
          </label>

          {/* Danh sách tệp CV */}
          {fileItems.length === 0 ? (
            <p className="cv-empty-text">Chưa có bản CV nào được tải lên</p>
          ) : (
            <ul className="cv-file-list" aria-label="Danh sách tệp CV">
              {fileItems.map((item) => {
                const { isTruncated, head, tail } = splitFileNameMiddle(
                  item.originalFileName
                );

                return (
                  <li key={item.id} className="cv-file-row">
                    {/* Icon file-text: 20px, 1 màu trung tính, đường viền tờ giấy khép kín */}
                    <svg
                      className="cv-file-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>

                    <div className="cv-file-body">
                      <div className="cv-file-top">
                        <p
                          className="cv-file-name"
                          title={isTruncated ? item.originalFileName : undefined}
                        >
                          <span className="cv-file-name-head">{head}</span>
                          {tail && (
                            <span className="cv-file-name-tail">{tail}</span>
                          )}
                        </p>

                        {item.status === 'uploading' && (
                          <p className="cv-file-percent">{item.progress}%</p>
                        )}
                      </div>

                      {/* Tầng dưới cao cố định min-h-5 (20px): chứa THANH hoặc MỘT DÒNG CHỮ */}
                      <div className="cv-file-bottom">
                        {item.status === 'uploading' && (
                          <div
                            role="progressbar"
                            aria-valuenow={item.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Đang tải ${item.originalFileName}`}
                            className="cv-progress-track"
                          >
                            <div
                              className="cv-progress-fill"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}

                        {item.status === 'waiting' && (
                          <p className="cv-file-meta">
                            Đang chờ · {formatFileSize(item.fileSize)}
                          </p>
                        )}

                        {item.status === 'uploaded' && (
                          <p className="cv-file-meta">
                            <svg
                              className="cv-status-check"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="m9 12 2 2 4-4" />
                            </svg>
                            <span>
                              Đã tải xong · {formatFileSize(item.fileSize)}
                              {item.uploadedAtLabel
                                ? ` · ${item.uploadedAtLabel}`
                                : ''}
                            </span>
                          </p>
                        )}

                        {item.status === 'rejected' && (
                          <p className="cv-file-error">{item.errorMessage}</p>
                        )}

                        {item.status === 'error' && (
                          <p className="cv-file-error-row">
                            <span className="cv-file-error">
                              {item.errorMessage}
                            </span>
                            <span className="cv-file-dot" aria-hidden="true">
                              {' · '}
                            </span>
                            <button
                              type="button"
                              className="cv-retry-link"
                              onClick={() => handleRetryItem(item)}
                            >
                              {item.isAuthError ? 'Đăng nhập' : 'Thử lại'}
                            </button>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cột phải rộng cố định 32px (w-8) ở mọi dòng để giữ thẳng cột */}
                    <div className="cv-file-action">
                      {item.status !== 'uploaded' && (
                        <button
                          type="button"
                          className="cv-remove-btn"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={
                            item.status === 'uploading'
                              ? `Huỷ tải ${item.originalFileName}`
                              : `Bỏ tệp ${item.originalFileName}`
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Toast thông báo khi hoàn tất lượt tải */}
      {toastMessage && (
        <div className="cv-toast" role="status" aria-live="polite">
          <svg
            className="cv-toast-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CVUploadPage;
