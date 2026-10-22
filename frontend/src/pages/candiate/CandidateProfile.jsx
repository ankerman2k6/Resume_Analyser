import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import {
  getCandidateProfileApi,
  updateCandidateProfileApi,
  getCandidateApplicationsApi,
  getCandidateCvsApi,
  withdrawApplicationApi,
  getCandidateStatsApi,
  getCandidateCareerApi,
  getCandidateCvFileApi,
  deleteCandidateCvApi
} from '../../services/candidateService';
import './CandidateProfile.css';

const formatSalary = (salary) => {
  if (!salary) return 'Chưa cập nhật mức lương';
  if (salary.negotiable) return 'Thỏa thuận';
  const currency = salary.currency || 'VND';
  const format = (value) => `${Number(value).toLocaleString('vi-VN')} ${currency}`;
  if (salary.min != null && salary.max != null) return `${format(salary.min)} - ${format(salary.max)}`;
  if (salary.min != null) return `Từ ${format(salary.min)}`;
  if (salary.max != null) return `Đến ${format(salary.max)}`;
  return 'Chưa cập nhật mức lương';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${hours}:${minutes} ngày ${d}/${m}/${y}`;
};

const FILTERS = { all: 'Tất cả', interview: 'Phỏng vấn', reviewing: 'Đang duyệt',
  applied: 'Đã nộp', accepted: 'Trúng tuyển', rejected: 'Chưa phù hợp', withdrawn: 'Đã rút' };
const toForm = (profile) => ({
  fullName: profile?.fullName || '', phone: profile?.phone || '',
  city: profile?.location?.city || '', country: profile?.location?.country || ''
});
const Pagination = ({ data, page, onChange }) => data?.totalPages > 1 && (
  <div className="profile-pagination">
    <button className="btn-action btn-action--secondary" disabled={page === 0} onClick={() => onChange(page - 1)}>Trang trước</button>
    <span>Trang {page + 1}/{data.totalPages} · {data.totalElements} kết quả</span>
    <button className="btn-action btn-action--secondary" disabled={data.last} onClick={() => onChange(page + 1)}>Trang sau</button>
  </div>
);

const STATUS_LABELS = {
  applied: { label: 'Đã nộp đơn', className: 'app-status-badge--applied' },
  reviewing: { label: 'Đang duyệt hồ sơ', className: 'app-status-badge--reviewing' },
  shortlisted: { label: 'Đạt vòng sơ loại', className: 'app-status-badge--reviewing' },
  interview_scheduled: { label: 'Lịch phỏng vấn', className: 'app-status-badge--interview_scheduled' },
  accepted: { label: 'Trúng tuyển', className: 'app-status-badge--accepted' },
  rejected: { label: 'Chưa phù hợp', className: 'app-status-badge--rejected' },
  withdrawn: { label: 'Đã rút', className: 'app-status-badge--rejected' },
};

const CandidateProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState(() =>
    ['applications', 'resumes', 'career', 'settings'].includes(searchParams.get('tab'))
      ? searchParams.get('tab') : 'applications');
  const [appFilter, setAppFilter] = useState('all');

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [career, setCareer] = useState(null);
  const [appPage, setAppPage] = useState(0);
  const [cvPage, setCvPage] = useState(0);
  const [appsPagination, setAppsPagination] = useState(null);
  const [cvsPagination, setCvsPagination] = useState(null);
  const [errors, setErrors] = useState({});
  const [listLoading, setListLoading] = useState({});
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['applications', 'resumes', 'career', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Các đường dẫn /profile, /stats, /applications, /cvs, /career bên dưới
  // có tiền tố /api/candidates/me; candidateService gửi JWT và đọc response JSON.
  // GET /profile -> profile hiển thị Hero và toForm() điền settings/modal.
  // PROFILE_NOT_FOUND là tài khoản chưa tạo hồ sơ; PUT sẽ tạo mới.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setProfile(null);
    setEditFormData({});
    setErrors((prev) => ({ ...prev, profile: null }));
    getCandidateProfileApi(controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        setProfile(data);
        setEditFormData(toForm(data));
      }
    }).catch((err) => {
      if (!controller.signal.aborted) {
        if (err.code === 'PROFILE_NOT_FOUND') {
          setEditFormData(toForm(user));
          setNotice('Bạn chưa có hồ sơ. Hãy cập nhật thông tin cá nhân để tạo hồ sơ.');
        } else setErrors((prev) => ({ ...prev, profile: err.message }));
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, revision]);

  // GET /stats và /career độc lập: một API lỗi không làm mất dữ liệu phần khác.
  // career lấy CV mới nhất do backend chọn; không suy ra từ trang danh sách CV.
  useEffect(() => {
    const controller = new AbortController();
    for (const [key, fetchData, setData] of [
      ['stats', () => getCandidateStatsApi(controller.signal), setStats],
      ['career', () => getCandidateCareerApi({ signal: controller.signal }), setCareer]
    ]) {
      setData(null);
      setListLoading((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: null }));
      fetchData().then((data) => { if (!controller.signal.aborted) setData(data); })
        .catch((err) => { if (!controller.signal.aborted) setErrors((prev) => ({ ...prev, [key]: err.message })); })
        .finally(() => { if (!controller.signal.aborted) setListLoading((prev) => ({ ...prev, [key]: false })); });
    }
    return () => controller.abort();
  }, [token, revision]);

  // GET /applications?filter&page&size -> content render cards; metadata render phân trang.
  // Đổi filter/page hủy request cũ để response cũ không ghi đè lựa chọn mới.
  useEffect(() => {
    const controller = new AbortController();
    setListLoading((prev) => ({ ...prev, applications: true }));
    setErrors((prev) => ({ ...prev, applications: null }));
    setApplications([]);
    setAppsPagination(null);
    getCandidateApplicationsApi({ filter: appFilter, page: appPage, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (appPage > 0 && data.content.length === 0) { setAppPage(appPage - 1); return; }
        setApplications(data.content);
        setAppsPagination(data);
      }).catch((err) => { if (!controller.signal.aborted) setErrors((prev) => ({ ...prev, applications: err.message })); })
      .finally(() => { if (!controller.signal.aborted) setListLoading((prev) => ({ ...prev, applications: false })); });
    return () => controller.abort();
  }, [token, appFilter, appPage, revision]);

  // GET /cvs?page&size -> content render thẻ CV, canViewFile/canDelete điều khiển nút.
  useEffect(() => {
    const controller = new AbortController();
    setListLoading((prev) => ({ ...prev, resumes: true }));
    setErrors((prev) => ({ ...prev, resumes: null }));
    setCvs([]);
    setCvsPagination(null);
    getCandidateCvsApi({ page: cvPage, signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      if (cvPage > 0 && data.content.length === 0) { setCvPage(cvPage - 1); return; }
      setCvs(data.content);
      setCvsPagination(data);
    }).catch((err) => { if (!controller.signal.aborted) setErrors((prev) => ({ ...prev, resumes: err.message })); })
      .finally(() => { if (!controller.signal.aborted) setListLoading((prev) => ({ ...prev, resumes: false })); });
    return () => controller.abort();
  }, [token, cvPage, revision]);

  // Blob PDF từ GET /cvs/{id}/file; thu hồi object URL khi đóng hoặc rời trang.
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);

  const openEditModal = () => {
    setEditFormData(toForm(profile || user));
    setIsEditModalOpen(true);
  };

  // Xử lý cập nhật thông tin cá nhân
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      // PUT /profile chỉ nhận các field được phép sửa; response là ProfileDto mới.
      const updated = await updateCandidateProfileApi({
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        location: {
          city: editFormData.city,
          country: editFormData.country
        }
      });
      setProfile(updated);
      setEditFormData(toForm(updated));
      updateUser({ fullName: updated.fullName });
      setIsEditModalOpen(false);
      setNotice('Đã lưu thông tin hồ sơ.');
      setRevision((prev) => prev + 1);
    } catch (err) {
      setNotice('Không cập nhật được hồ sơ: ' + err.message);
    } finally { setBusy(false); }
  };

  // Xử lý rút hồ sơ ứng tuyển
  const handleWithdrawApplication = async (applicationId) => {
    if (window.confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển cho vị trí này?')) {
      setBusy(true);
      try {
        // POST /applications/{id}/withdraw trả đơn status=withdrawn, không xóa lịch sử.
        const updated = await withdrawApplicationApi(applicationId);
        setApplications((prev) => prev.map((app) => app._id === applicationId ? updated : app));
        setNotice('Đã rút đơn ứng tuyển.');
        setRevision((prev) => prev + 1);
      } catch (err) { setNotice(err.message); }
      finally { setBusy(false); }
    }
  };

  const handleViewCv = async (cvId) => {
    setBusy(true);
    try {
      const blob = await getCandidateCvFileApi(cvId);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  };

  // Xử lý xóa CV
  const handleDeleteCv = async (cvId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tệp CV này khỏi danh sách?')) {
      setBusy(true);
      try {
        // DELETE trả 204 không body; tải lại CV, stats và career sau khi xóa thành công.
        await deleteCandidateCvApi(cvId);
        setNotice('Đã xóa CV.');
        setRevision((prev) => prev + 1);
      } catch (err) { setNotice(err.message); }
      finally { setBusy(false); }
    }
  };

  // Danh sách đã được server lọc; tổng theo trạng thái lấy từ stats.applicationCounts.
  const filteredApplications = applications;

  if (!token) return <Navigate to="/login" replace />;

  if (loading && !profile) {
    return (
      <div className="candidate-profile-page">
        <div className="profile-container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Đang tải thông tin hồ sơ ứng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-profile-page">
      <div className="profile-container">
        {/* Breadcrumb */}
        <div className="profile-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="profile-breadcrumb-separator">/</span>
          <Link to="/candidate">Ứng viên</Link>
          <span className="profile-breadcrumb-separator">/</span>
          <span>Trang cá nhân</span>
        </div>

        {notice && <p role="status">{notice}</p>}
        {Object.entries(errors).filter(([, message]) => message).map(([key, message]) => (
          <div key={key} role="alert">
            {message}{' '}
            <button type="button" className="btn-action btn-action--secondary" onClick={() => setRevision((value) => value + 1)}>Thử lại</button>
          </div>
        ))}
        {/* GET /profile: avatarUrl/fullName/email/phone/location/accountStatus -> Hero. */}
        <div className="profile-hero-card">
          <div className="profile-hero-main">
            <div className="profile-hero-left">
              <div className="profile-avatar-container">
                <Avatar
                  src={profile?.avatarUrl}
                  name={profile?.fullName || user?.fullName || 'Ứng viên'}
                  seed={profile?.userId || user?.id || user?.email}
                  size="xl"
                />
                <span
                  className="profile-status-indicator"
                  title={profile?.accountStatus === 'active' ? 'Tài khoản đang hoạt động' : 'Chưa xác định trạng thái'}
                  hidden={profile?.accountStatus !== 'active'}
                />
              </div>

              <div className="profile-hero-info">
                <div className="profile-name-row">
                  <h1 className="profile-name">{profile?.fullName || 'Ứng viên CMCV'}</h1>
                </div>

                <div className="profile-contact-chips">
                  <span className="contact-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {profile?.email || user?.email || 'Chưa cập nhật email'}
                  </span>

                  {profile?.phone && (
                    <span className="contact-chip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {profile.phone}
                    </span>
                  )}

                  <span className="contact-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {[profile?.location?.city, profile?.location?.country].filter(Boolean).join(', ') || 'Chưa cập nhật địa điểm'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-hero-actions">
              <button
                type="button"
                className="btn-action btn-action--secondary"
                onClick={openEditModal}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Chỉnh sửa hồ sơ</span>
              </button>

              <button
                type="button"
                className="btn-action btn-action--primary"
                onClick={() => navigate('/cv')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Tải CV mới</span>
              </button>
            </div>
          </div>

          {/* GET /stats -> 4 số tổng toàn bộ DB, không dùng length của trang hiện tại. Null score hiển thị —. */}
          <div className="profile-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-box metric-icon-box--blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-value">{stats?.cvCount ?? '—'}</span>
                <span className="metric-label">CV đã tải lên</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box metric-icon-box--green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-value">{stats?.applicationCount ?? '—'}</span>
                <span className="metric-label">Việc làm đã ứng tuyển</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box metric-icon-box--purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-value">
                  {stats?.upcomingInterviewCount ?? '—'}
                </span>
                <span className="metric-label">Lịch hẹn phỏng vấn</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box metric-icon-box--amber">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="metric-content">
                <span className="metric-value">
                  {stats?.avgMatchScore != null ? `${stats.avgMatchScore}%` : '—'}
                </span>
                <span className="metric-label">Điểm AI Match trung bình</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-wrapper" role="tablist">
          <div className="profile-tab-list">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'applications'}
              className={`profile-tab-btn ${activeTab === 'applications' ? 'is-active' : ''}`}
              onClick={() => handleTabChange('applications')}
            >
              <span>Việc làm đã ứng tuyển</span>
              <span className="profile-tab-count">{stats?.applicationCount ?? '—'}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'resumes'}
              className={`profile-tab-btn ${activeTab === 'resumes' ? 'is-active' : ''}`}
              onClick={() => handleTabChange('resumes')}
            >
              <span>CV đã tải lên</span>
              <span className="profile-tab-count">{stats?.cvCount ?? '—'}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'career'}
              className={`profile-tab-btn ${activeTab === 'career' ? 'is-active' : ''}`}
              onClick={() => handleTabChange('career')}
            >
              <span>Chi tiết kinh nghiệm & Kỹ năng</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'settings'}
              className={`profile-tab-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <span>Cài đặt tài khoản</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: VIỆC LÀM ĐÃ ỨNG TUYỂN
           ========================================================================= */}
        {activeTab === 'applications' && (
          <div className="profile-content-section">
            <div className="section-header-row">
              <div className="section-title-group">
                <h2 className="section-title">Danh sách công ty & việc làm đã ứng tuyển</h2>
                <p className="section-description">
                  Theo dõi trạng thái duyệt hồ sơ, điểm đánh giá AI và lịch hẹn phỏng vấn
                </p>
              </div>

              {/* GET /stats.applicationCounts -> số trên từng bộ lọc; click gọi GET /applications?filter=... */}
              <div className="filter-pills-group">
                {Object.entries(FILTERS).map(([key, label]) => (
                  <button key={key} type="button" className={`filter-pill ${appFilter === key ? 'is-active' : ''}`}
                    onClick={() => { setAppFilter(key); setAppPage(0); }}>
                    {label} ({stats?.applicationCounts?.[key] ?? '—'})
                  </button>
                ))}
              </div>
            </div>

            {listLoading.applications ? <p role="status">Đang tải đơn ứng tuyển...</p> : errors.applications ? null :
            filteredApplications.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}
              >
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Không tìm thấy đơn ứng tuyển nào trong mục này.
                </p>
                <button
                  type="button"
                  className="btn-action btn-action--primary"
                  onClick={() => navigate('/candidate')}
                >
                  Khám phá việc làm ngay
                </button>
              </div>
            ) : (
              <div className="applications-list">
                {filteredApplications.map((app) => {
                  const statusConfig = STATUS_LABELS[app.status] || {
                    label: app.status,
                    className: 'app-status-badge--applied'
                  };

                  return (
                    <div key={app._id} className="application-card">
                      <div className="application-card-header">
                        <div className="app-company-info">
                          <div className="app-company-logo">
                            {app.company?.logoUrl
                              ? <img src={app.company.logoUrl} alt={app.company.name || 'Logo công ty'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              : app.company?.name?.slice(0, 2).toUpperCase() || 'CP'}
                          </div>
                          <div className="app-title-group">
                            <h3 className="app-job-title">{app.job?.title || 'Vị trí ứng tuyển'}</h3>
                            <div className="app-company-meta">
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {app.company?.name || 'Tên công ty'}
                              </span>
                              <span>•</span>
                              <span>{app.company?.industry || 'Chưa cập nhật lĩnh vực'}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`app-status-badge ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="app-details-grid">
                        <span className="app-detail-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          {formatSalary(app.job?.salary)}
                        </span>

                        <span className="app-detail-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {app.job?.location?.city || 'Chưa cập nhật địa điểm'}{' '}
                          {app.job?.location?.remote ? '(Cho phép làm từ xa / Remote)' : ''}
                        </span>

                        <span className="app-detail-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          {({ full_time: 'Toàn thời gian', part_time: 'Bán thời gian', contract: 'Hợp đồng', internship: 'Thực tập', freelance: 'Tự do' })[app.job?.employmentType] || app.job?.employmentType || 'Chưa cập nhật'}
                        </span>
                      </div>

                      {/* GET /applications.content[].aiAnalysis -> điểm và modal chi tiết; null thì ẩn. */}
                      {app.aiAnalysis && (
                        <div className="app-ai-screening-box">
                          <div className="ai-screening-info">
                            <span
                              className={`ai-score-pill ${
                                app.aiAnalysis.overallScore >= 80
                                  ? 'ai-score-pill--high'
                                  : app.aiAnalysis.overallScore >= 60
                                  ? 'ai-score-pill--med'
                                  : 'ai-score-pill--low'
                              }`}
                            >
                              AI Match: {app.aiAnalysis.overallScore != null ? `${app.aiAnalysis.overallScore}%` : 'Chưa có điểm'}
                            </span>
                            <span className="ai-recommendation-text">
                              {app.aiAnalysis.recommendation}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn-action btn-action--secondary btn-action--sm"
                            onClick={() => setSelectedAnalysis(app)}
                          >
                            Chi tiết đánh giá AI
                          </button>
                        </div>
                      )}

                      {/* GET /applications.content[].interview -> lịch, hình thức và meetingLink. */}
                      {app.interview && app.status === 'interview_scheduled' && (
                        <div className="app-interview-banner">
                          <div className="interview-banner-content">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <div className="interview-banner-text">
                              <span className="interview-time">
                                Lịch phỏng vấn: {formatDateTime(app.interview.scheduledAt)} ({app.interview.durationMinutes} phút)
                              </span>
                              <span className="interview-mode">
                                Hình thức: {app.interview.mode === 'online' ? 'Trực tuyến' : app.interview.location}
                              </span>
                            </div>
                          </div>

                          {app.interview.meetingLink && (
                            <a
                              href={app.interview.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action btn-action--primary btn-action--sm"
                              style={{ textDecoration: 'none' }}
                            >
                              Tham gia phòng họp
                            </a>
                          )}
                        </div>
                      )}

                      <div className="application-card-footer">
                        <span className="app-applied-time">
                          Ngày nộp đơn: {formatDate(app.appliedAt)}
                        </span>

                        <div className="app-actions">
                          {app.canWithdraw && (
                            <button
                              type="button"
                              className="btn-action btn-action--danger btn-action--sm"
                              disabled={busy}
                              onClick={() => handleWithdrawApplication(app._id)}
                            >
                              Rút hồ sơ
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-action btn-action--secondary btn-action--sm"
                            onClick={() => navigate(`/candidate`)}
                          >
                            Khám phá việc làm
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!listLoading.applications && !errors.applications && <Pagination data={appsPagination} page={appPage} onChange={setAppPage} />}
          </div>
        )}

        {/* =========================================================================
            TAB 2: CV ĐÃ TẢI LÊN
           ========================================================================= */}
        {activeTab === 'resumes' && (
          <div className="profile-content-section">
            <div className="section-header-row">
              <div className="section-title-group">
                <h2 className="section-title">Quản lý sơ yếu lý lịch (CVs)</h2>
                <p className="section-description">
                  Hệ thống hỗ trợ lưu nhiều bản CV và tự động trích xuất kỹ năng bằng mô hình AI
                </p>
              </div>

              <button
                type="button"
                className="btn-action btn-action--primary"
                onClick={() => navigate('/cv')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Tải lên CV mới (.pdf)</span>
              </button>
            </div>

            {/* GET /cvs.content -> tên file, createdAt, skills, parseInfo; quyền xem/xóa từ backend. */}
            {listLoading.resumes && <p role="status">Đang tải danh sách CV...</p>}
            {!listLoading.resumes && !errors.resumes && cvs.length === 0 && <p>Bạn chưa tải CV nào.</p>}
            <div className="resumes-grid">
              {cvs.map((cv) => (
                <div
                  key={cv._id}
                  className="resume-card"
                >
                  <div className="resume-card-header">
                    <div className="resume-pdf-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>

                    <div className="resume-header-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="resume-filename" title={cv.source?.fileName || cv.title}>
                          {cv.source?.fileName || cv.title}
                        </span>

                      </div>

                      <span className="resume-meta">
                        Tải lên ngày {formatDate(cv.createdAt)}{cv.parseInfo?.status && ` • Trích xuất: ${cv.parseInfo.status}`}
                      </span>
                    </div>
                  </div>

                  {cv.skills && cv.skills.length > 0 && (
                    <div className="resume-skills-preview">
                      {cv.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill.name}
                        </span>
                      ))}
                      {cv.skills.length > 5 && (
                        <span className="skill-tag" style={{ opacity: 0.7 }}>
                          +{cv.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="resume-card-actions">
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-action btn-action--secondary btn-action--sm"
                        disabled={busy || !cv.canViewFile}
                        onClick={() => handleViewCv(cv._id)}
                      >
                        Xem
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-action--danger btn-action--sm"
                        disabled={busy || !cv.canDelete}
                        title={cv.deleteBlockedReason || undefined}
                        onClick={() => handleDeleteCv(cv._id)}
                      >
                        Xóa
                      </button>
                      {!cv.canDelete && cv.deleteBlockedReason && <small>{cv.deleteBlockedReason}</small>}
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="upload-resume-box"
                onClick={() => navigate('/cv')}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate('/cv'); } }}
              >
                <div className="upload-icon-circle">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    Tải thêm bản CV khác
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Hỗ trợ tệp PDF tối đa 5MB
                  </div>
                </div>
              </div>
            </div>
            {!listLoading.resumes && !errors.resumes && <Pagination data={cvsPagination} page={cvPage} onChange={setCvPage} />}
          </div>
        )}

        {/* =========================================================================
            TAB 3: CHI TIẾT KINH NGHIỆM & KỸ NĂNG (Trích xuất từ CV)
           ========================================================================= */}
        {activeTab === 'career' && (
          <div className="profile-content-section">
            <div className="section-header-row">
              <div className="section-title-group">
                <h2 className="section-title">Hồ sơ năng lực & Trích xuất AI</h2>
                <p className="section-description">
                  Dữ liệu từ CV mới nhất: {career?.cv?.fileName || career?.cv?.title || 'Chưa có CV'}
                </p>
              </div>

              <button
                type="button"
                className="btn-action btn-action--secondary"
                onClick={() => navigate('/cv')}
              >
                Tải CV mới
              </button>
            </div>

            {/* GET /career -> skills/experience/education/certificates từ CV mới nhất; chỉ đọc. */}
            {listLoading.career && <p role="status">Đang tải hồ sơ năng lực...</p>}
            {career?.cv?.parseInfo?.status && <p>Trạng thái trích xuất: {career.cv.parseInfo.status}</p>}
            {!listLoading.career && !errors.career && !career?.cv && <p>Chưa có CV để trích xuất thông tin.</p>}
            {career && <>
            {/* Kỹ năng trích xuất */}
            <div className="career-section-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kỹ năng chuyên môn
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {career?.skills?.length > 0 ? career.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-default)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <strong>{skill.name}</strong> • {skill.yearsOfExperience != null ? `${skill.yearsOfExperience} năm` : 'Chưa cập nhật số năm'} {skill.level && `(${skill.level})`}
                  </span>
                )) : <p style={{ color: 'var(--text-secondary)' }}>Chưa có thông tin kỹ năng.</p>}
              </div>
            </div>

            {/* Kinh nghiệm làm việc */}
            <div className="career-section-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kinh nghiệm làm việc
              </h3>
              <div className="timeline">
                {career?.experience?.length > 0 ? career.experience.map((exp, idx) => (
                  <div key={idx} className="timeline-item">
                    <span className="timeline-dot" />
                    <div className="timeline-role">{exp.position}</div>
                    <div className="timeline-company">{exp.company} • {exp.location}</div>
                    <div className="timeline-time">
                      {exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}
                    </div>
                    <p className="timeline-description">{exp.description}</p>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="timeline-achievements">
                        {exp.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )) : <p style={{ color: 'var(--text-secondary)' }}>Chưa có kinh nghiệm nào được trích xuất.</p>}
              </div>
            </div>

            {/* Học vấn */}
            <div className="career-section-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Học vấn
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {career?.education?.length === 0 && <p>Chưa có thông tin học vấn.</p>}
                {career?.education?.map((edu, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                      {edu.degree} - {edu.major}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--brand-secondary)' }}>
                      {edu.institution} ({edu.startDate} - {edu.endDate})
                    </div>
                    {edu.gpa && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Điểm GPA: {edu.gpa.value}/{edu.gpa.scale} • Trạng thái: {edu.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* GET /career.certificates[] -> chứng chỉ được trích xuất từ CV nguồn. */}
            <div className="career-section-card">
              <h3>Chứng chỉ</h3>
              {career?.certificates?.length ? career.certificates.map((cert, index) => (
                <div key={index}>
                  <strong>{cert.name}</strong>
                  <p>{cert.issuer}{cert.issueDate && ` • Cấp ngày ${cert.issueDate}`}</p>
                  {cert.credentialId && <p>Mã chứng chỉ: {cert.credentialId}</p>}
                  {cert.expirationDate && <p>Hết hạn: {cert.expirationDate}</p>}
                </div>
              )) : <p>Chưa có thông tin chứng chỉ.</p>}
            </div>
            </>}
          </div>
        )}

        {/* =========================================================================
            TAB 4: CÀI ĐẶT TÀI KHOẢN
           ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="profile-content-section">
            <div className="section-header-row">
              <div className="section-title-group">
                <h2 className="section-title">Cài đặt tài khoản & Thông tin cá nhân</h2>
                <p className="section-description">
                  Cập nhật họ tên, số điện thoại và địa điểm của bạn
                </p>
              </div>
            </div>

            <div className="career-section-card">
              {/* GET /profile -> editFormData; PUT /profile -> lưu 4 trường bên dưới. */}
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="settings-grid">
                  <div>
                    <label htmlFor="profile-fullName-0" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Họ và tên
                    </label>
                    <input id="profile-fullName-0" maxLength={120}
                      type="text"
                      className="form-control-input"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-phone-0" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Số điện thoại
                    </label>
                    <input id="profile-phone-0" maxLength={30}
                      type="tel"
                      className="form-control-input"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-city-0" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Tỉnh / Thành phố
                    </label>
                    <input id="profile-city-0" maxLength={120}
                      type="text"
                      className="form-control-input"
                      value={editFormData.city || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      placeholder="VD: TP. Hồ Chí Minh"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-country-0" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Quốc gia
                    </label>
                    <input id="profile-country-0" maxLength={120}
                      type="text"
                      className="form-control-input"
                      value={editFormData.country || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    />
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <button type="submit" disabled={busy || Boolean(errors.profile)} className="btn-action btn-action--primary">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>

            <div className="career-section-card" style={{ borderColor: 'rgba(231, 0, 11, 0.2)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--status-danger)' }}>
                Đăng xuất tài khoản
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Đăng xuất khỏi phiên làm việc hiện tại trên thiết bị này.
              </p>
              <div>
                <button
                  type="button"
                  className="btn-action btn-action--danger"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 1: CHỈNH SỬA THÔNG TIN CÁ NHÂN
           ========================================================================= */}
        {/* Settings và modal dùng chung editFormData từ GET /profile; submit PUT chỉ fullName/phone/location. */}
        {isEditModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Chỉnh sửa thông tin ứng viên</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="modal-body">
                  {notice && <p role="status">{notice}</p>}
                  <div>
                    <label htmlFor="profile-fullName-1" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Họ và tên
                    </label>
                    <input id="profile-fullName-1" maxLength={120}
                      type="text"
                      className="form-control-input"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-phone-1" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Số điện thoại
                    </label>
                    <input id="profile-phone-1" maxLength={30}
                      type="tel"
                      className="form-control-input"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-city-1" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Tỉnh / Thành phố
                    </label>
                    <input id="profile-city-1" maxLength={120}
                      type="text"
                      className="form-control-input"
                      value={editFormData.city || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    />
                  </div>

                <div>
                  <label htmlFor="modal-country">Quốc gia</label>
                  <input id="modal-country" className="form-control-input" maxLength={120}
                    value={editFormData.country || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })} />
                </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-action btn-action--secondary"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" disabled={busy || Boolean(errors.profile)} className="btn-action btn-action--primary">
                    Lưu cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {pdfUrl && (
          <div className="modal-backdrop">
            <div className="modal-dialog" role="dialog" aria-modal="true" aria-label="Xem CV">
              <div className="modal-header"><h3>Xem CV</h3><button type="button" className="modal-close-btn" onClick={() => setPdfUrl(null)}>Đóng</button></div>
              <iframe title="Nội dung CV" src={pdfUrl} style={{ width: '100%', height: '65vh', border: 0 }} />
              <a href={pdfUrl} target="_blank" rel="noreferrer">Mở PDF trong tab mới</a>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: CHI TIẾT ĐÁNH GIÁ AI (AI SCREENING INSIGHTS)
           ========================================================================= */}
        {selectedAnalysis && (
          <div className="modal-backdrop" onClick={() => setSelectedAnalysis(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Báo cáo phân tích AI Screening</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {selectedAnalysis.job?.title} • {selectedAnalysis.company?.name}
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedAnalysis(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {/* Overall Score */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Điểm tương thích tổng quát</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--status-success)' }}>
                      {selectedAnalysis.aiAnalysis?.overallScore != null ? `${selectedAnalysis.aiAnalysis.overallScore}%` : 'Chưa có điểm'}
                    </div>
                  </div>
                  <div style={{ maxWidth: '320px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {selectedAnalysis.aiAnalysis?.recommendation}
                  </div>
                </div>

                {/* Score Breakdown */}
                {selectedAnalysis.aiAnalysis?.scores && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Điểm thành phần theo tiêu chuẩn ATS:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <div style={{ padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kỹ năng</div>
                        <div style={{ fontWeight: 700 }}>{selectedAnalysis.aiAnalysis.scores.skills}%</div>
                      </div>
                      <div style={{ padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kinh nghiệm</div>
                        <div style={{ fontWeight: 700 }}>{selectedAnalysis.aiAnalysis.scores.experience}%</div>
                      </div>
                      <div style={{ padding: '8px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Học vấn</div>
                        <div style={{ fontWeight: 700 }}>{selectedAnalysis.aiAnalysis.scores.education}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Matched Skills */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--status-success)' }}>
                    ✓ Kỹ năng trùng khớp ({selectedAnalysis.aiAnalysis?.matchedSkills?.length || 0}):
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedAnalysis.aiAnalysis?.matchedSkills?.map((skill, i) => (
                      <span key={i} className="skill-tag" style={{ borderColor: 'rgba(0, 212, 146, 0.4)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                {selectedAnalysis.aiAnalysis?.missingSkills?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--status-warning)' }}>
                      ⚠ Kỹ năng còn thiếu hoặc cần bổ sung:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedAnalysis.aiAnalysis.missingSkills.map((skill, i) => (
                        <span key={i} className="skill-tag" style={{ borderColor: 'rgba(254, 154, 0, 0.4)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {selectedAnalysis.aiAnalysis?.strengths?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                      Điểm mạnh nổi bật:
                    </h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {selectedAnalysis.aiAnalysis.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-action btn-action--primary"
                  onClick={() => setSelectedAnalysis(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
