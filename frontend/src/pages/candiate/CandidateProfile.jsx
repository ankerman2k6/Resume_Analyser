import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import {
  getCandidateProfileApi,
  updateCandidateProfileApi,
  getCandidateApplicationsApi,
  getCandidateCvsApi,
  withdrawApplicationApi,
  setDefaultCvApi,
  deleteCandidateCvApi
} from '../../services/candidateService';
import './CandidateProfile.css';

const formatSalary = (salary) => {
  if (!salary) return 'Thỏa thuận';
  if (salary.negotiable && (!salary.min || !salary.max)) return 'Thỏa thuận';
  const minM = salary.min ? `${Math.round(salary.min / 1000000)}` : '';
  const maxM = salary.max ? `${Math.round(salary.max / 1000000)} triệu` : 'triệu';
  return minM ? `${minM} - ${maxM} VND` : `${maxM} VND`;
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

const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) {
    return `${mb.toFixed(1).replace('.', ',')} MB`;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} KB`;
};

const STATUS_LABELS = {
  applied: { label: 'Đã nộp đơn', className: 'app-status-badge--applied' },
  reviewing: { label: 'Đang duyệt hồ sơ', className: 'app-status-badge--reviewing' },
  shortlisted: { label: 'Đạt vòng sơ loại', className: 'app-status-badge--reviewing' },
  interview_scheduled: { label: 'Lịch phỏng vấn', className: 'app-status-badge--interview_scheduled' },
  accepted: { label: 'Trúng tuyển', className: 'app-status-badge--accepted' },
  rejected: { label: 'Chưa phù hợp', className: 'app-status-badge--rejected' },
};

const CandidateProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'applications');
  const [appFilter, setAppFilter] = useState('all');

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, appsData, cvsData] = await Promise.all([
          getCandidateProfileApi(),
          getCandidateApplicationsApi(),
          getCandidateCvsApi()
        ]);
        setProfile(profileData);
        setApplications(appsData);
        setCvs(cvsData);
        setEditFormData({
          fullName: profileData.fullName || '',
          phone: profileData.phone || '',
          title: profileData.title || '',
          bio: profileData.bio || '',
          city: profileData.location?.city || '',
          country: profileData.location?.country || 'Việt Nam',
          searchStatus: profileData.searchStatus || 'actively_looking'
        });
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang cá nhân:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Xử lý cập nhật thông tin cá nhân
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateCandidateProfileApi({
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        title: editFormData.title,
        bio: editFormData.bio,
        location: {
          city: editFormData.city,
          country: editFormData.country
        },
        searchStatus: editFormData.searchStatus
      });
      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      setIsEditModalOpen(false);
    } catch (err) {
      alert('Không cập nhật được hồ sơ: ' + err.message);
    }
  };

  // Xử lý rút hồ sơ ứng tuyển
  const handleWithdrawApplication = async (applicationId) => {
    if (window.confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển cho vị trí này?')) {
      await withdrawApplicationApi(applicationId);
      setApplications((prev) => prev.filter((app) => app._id !== applicationId));
    }
  };

  // Xử lý đặt CV mặc định
  const handleSetDefaultCv = async (cvId) => {
    const updated = await setDefaultCvApi(cvId);
    setCvs(updated);
  };

  // Xử lý xóa CV
  const handleDeleteCv = async (cvId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tệp CV này khỏi danh sách?')) {
      const updated = await deleteCandidateCvApi(cvId);
      setCvs(updated);
    }
  };

  // Lọc danh sách ứng tuyển
  const filteredApplications = applications.filter((app) => {
    if (appFilter === 'all') return true;
    if (appFilter === 'interview') return app.status === 'interview_scheduled';
    if (appFilter === 'reviewing') return app.status === 'reviewing' || app.status === 'shortlisted';
    if (appFilter === 'applied') return app.status === 'applied';
    if (appFilter === 'rejected') return app.status === 'rejected';
    return true;
  });

  const primaryCv = cvs.find((c) => c.isDefault) || cvs[0] || null;

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

        {/* Hero Card */}
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
                  title="Tài khoản đang hoạt động"
                />
              </div>

              <div className="profile-hero-info">
                <div className="profile-name-row">
                  <h1 className="profile-name">{profile?.fullName || 'Ứng viên CMCV'}</h1>
                  <span className="profile-badge-status">
                    <span className="profile-status-dot" />
                    {profile?.searchStatus === 'actively_looking'
                      ? 'Đang tìm việc'
                      : profile?.searchStatus === 'open'
                      ? 'Mở cơ hội mới'
                      : 'Không tìm việc'}
                  </span>
                </div>

                <div className="profile-title">
                  {profile?.title || 'Lập trình viên / Kỹ sư phần mềm'}
                </div>

                <p className="profile-bio">
                  {profile?.bio ||
                    'Chưa có phần giới thiệu bản thân. Bấm Chỉnh sửa hồ sơ để thêm mô tả kinh nghiệm và thế mạnh của bạn.'}
                </p>

                <div className="profile-contact-chips">
                  <span className="contact-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {profile?.email || user?.email || 'chua_cap_nhat@gmail.com'}
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
                    {profile?.location?.city || 'Hồ Chí Minh'}, {profile?.location?.country || 'Việt Nam'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-hero-actions">
              <button
                type="button"
                className="btn-action btn-action--secondary"
                onClick={() => setIsEditModalOpen(true)}
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

          {/* Quick Metrics Bar */}
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
                <span className="metric-value">{cvs.length}</span>
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
                <span className="metric-value">{applications.length}</span>
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
                  {applications.filter((a) => a.status === 'interview_scheduled').length}
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
                  {profile?.stats?.avgMatchScore ? `${profile.stats.avgMatchScore}%` : '86%'}
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
              <span className="profile-tab-count">{applications.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'resumes'}
              className={`profile-tab-btn ${activeTab === 'resumes' ? 'is-active' : ''}`}
              onClick={() => handleTabChange('resumes')}
            >
              <span>CV đã tải lên</span>
              <span className="profile-tab-count">{cvs.length}</span>
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

              <div className="filter-pills-group">
                <button
                  type="button"
                  className={`filter-pill ${appFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setAppFilter('all')}
                >
                  Tất cả ({applications.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${appFilter === 'interview' ? 'is-active' : ''}`}
                  onClick={() => setAppFilter('interview')}
                >
                  Phỏng vấn ({applications.filter((a) => a.status === 'interview_scheduled').length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${appFilter === 'reviewing' ? 'is-active' : ''}`}
                  onClick={() => setAppFilter('reviewing')}
                >
                  Đang duyệt ({applications.filter((a) => a.status === 'reviewing' || a.status === 'shortlisted').length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${appFilter === 'applied' ? 'is-active' : ''}`}
                  onClick={() => setAppFilter('applied')}
                >
                  Đã nộp ({applications.filter((a) => a.status === 'applied').length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${appFilter === 'rejected' ? 'is-active' : ''}`}
                  onClick={() => setAppFilter('rejected')}
                >
                  Chưa phù hợp ({applications.filter((a) => a.status === 'rejected').length})
                </button>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
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
                            {app.company?.logoCode || app.company?.name?.slice(0, 2).toUpperCase() || 'CP'}
                          </div>
                          <div className="app-title-group">
                            <h3 className="app-job-title">{app.job?.title || 'Vị trí ứng tuyển'}</h3>
                            <div className="app-company-meta">
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {app.company?.name || 'Tên công ty'}
                              </span>
                              <span>•</span>
                              <span>{app.company?.industry || 'Công nghệ thông tin'}</span>
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
                          {app.job?.location?.city || 'Toàn quốc'}{' '}
                          {app.job?.location?.remote ? '(Cho phép làm từ xa / Remote)' : ''}
                        </span>

                        <span className="app-detail-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          {app.job?.employmentType === 'full_time' ? 'Toàn thời gian' : 'Bán thời gian / Dự án'}
                        </span>
                      </div>

                      {/* AI Screening Insights */}
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
                              AI Match: {app.aiAnalysis.overallScore}%
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

                      {/* Lịch phỏng vấn (nếu có) */}
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
                                Hình thức: {app.interview.mode === 'online' ? 'Trực tuyến qua Google Meet' : app.interview.location}
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
                          {app.status === 'applied' && (
                            <button
                              type="button"
                              className="btn-action btn-action--danger btn-action--sm"
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
                            Xem tin tuyển dụng
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

            <div className="resumes-grid">
              {cvs.map((cv) => (
                <div
                  key={cv._id}
                  className={`resume-card ${cv.isDefault ? 'is-default' : ''}`}
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
                        {cv.isDefault && <span className="badge-default-cv">Mặc định</span>}
                      </div>

                      <span className="resume-meta">
                        {formatFileSize(cv.source?.fileSize || 1542031)} • Tải lên ngày {formatDate(cv.createdAt)}
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
                    {!cv.isDefault ? (
                      <button
                        type="button"
                        className="btn-action btn-action--secondary btn-action--sm"
                        onClick={() => handleSetDefaultCv(cv._id)}
                      >
                        Đặt làm CV chính
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--status-success)', fontWeight: 500 }}>
                        ✓ Sử dụng khi nộp nhanh
                      </span>
                    )}

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-action btn-action--secondary btn-action--sm"
                        onClick={() => alert(`Xem file: ${cv.source?.fileName || cv.title}`)}
                      >
                        Xem
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-action--danger btn-action--sm"
                        onClick={() => handleDeleteCv(cv._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="upload-resume-box"
                onClick={() => navigate('/cv')}
                role="button"
                tabIndex={0}
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
                  Dữ liệu được trích xuất tự động từ CV chính của bạn: {primaryCv?.source?.fileName || 'Chưa chọn'}
                </p>
              </div>

              <button
                type="button"
                className="btn-action btn-action--secondary"
                onClick={() => setIsEditModalOpen(true)}
              >
                Cập nhật thông tin
              </button>
            </div>

            {/* Kỹ năng trích xuất */}
            <div className="career-section-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kỹ năng chuyên môn
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {primaryCv?.skills?.map((skill, idx) => (
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
                    <strong>{skill.name}</strong> • {skill.yearsOfExperience || 1} năm ({skill.level})
                  </span>
                )) || <p style={{ color: 'var(--text-secondary)' }}>Chưa có thông tin kỹ năng.</p>}
              </div>
            </div>

            {/* Kinh nghiệm làm việc */}
            <div className="career-section-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Kinh nghiệm làm việc
              </h3>
              <div className="timeline">
                {primaryCv?.experience?.map((exp, idx) => (
                  <div key={idx} className="timeline-item">
                    <span className="timeline-dot" />
                    <div className="timeline-role">{exp.position}</div>
                    <div className="timeline-company">{exp.company} • {exp.location}</div>
                    <div className="timeline-time">
                      {exp.startDate} - {exp.endDate}
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
                )) || <p style={{ color: 'var(--text-secondary)' }}>Chưa có kinh nghiệm nào được trích xuất.</p>}
              </div>
            </div>

            {/* Học vấn & Chứng chỉ */}
            <div className="career-section-card">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Học vấn & Chứng chỉ
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {primaryCv?.education?.map((edu, idx) => (
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
                  Cập nhật thông tin liên hệ và trạng thái nhận việc của bạn
                </p>
              </div>
            </div>

            <div className="career-section-card">
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="settings-grid">
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="form-control-input"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-control-input"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Chức danh chuyên môn
                    </label>
                    <input
                      type="text"
                      className="form-control-input"
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      placeholder="VD: Senior Frontend Developer"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Trạng thái tìm việc
                    </label>
                    <select
                      className="form-control-select"
                      value={editFormData.searchStatus || 'actively_looking'}
                      onChange={(e) => setEditFormData({ ...editFormData, searchStatus: e.target.value })}
                    >
                      <option value="actively_looking">Đang chủ động tìm việc (Hiện nổi bật cho HR)</option>
                      <option value="open">Mở cơ hội mới (Không vội, chỉ xem đề nghị tốt)</option>
                      <option value="not_looking">Tạm dừng tìm việc</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      className="form-control-input"
                      value={editFormData.city || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      placeholder="VD: TP. Hồ Chí Minh"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Quốc gia
                    </label>
                    <input
                      type="text"
                      className="form-control-input"
                      value={editFormData.country || 'Việt Nam'}
                      onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    />
                  </div>

                  <div className="form-group-full">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Giới thiệu bản thân (Bio)
                    </label>
                    <textarea
                      rows={4}
                      className="form-control-textarea"
                      value={editFormData.bio || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                      placeholder="Tóm tắt ngắn về kinh nghiệm và mục tiêu sự nghiệp..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <button type="submit" className="btn-action btn-action--primary">
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
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="form-control-input"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Chức danh chuyên môn
                    </label>
                    <input
                      type="text"
                      className="form-control-input"
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      placeholder="VD: Senior React Developer"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-control-input"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      className="form-control-input"
                      value={editFormData.city || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      rows={3}
                      className="form-control-textarea"
                      value={editFormData.bio || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    />
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
                  <button type="submit" className="btn-action btn-action--primary">
                    Lưu cập nhật
                  </button>
                </div>
              </form>
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
                      {selectedAnalysis.aiAnalysis?.overallScore || 0}%
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
