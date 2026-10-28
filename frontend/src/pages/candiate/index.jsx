import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CandidateSearch from './CandidateSearch';
import './index.css';
import { searchJobsApi } from '../../services/jobsService';

//CAC HAM HELPER
const formatSalary = (salary) => {
  if (!salary) return 'Thoả thuận'
  if(salary.negotiable && (!salary.min || !salary.max)) return 'Thoả thuận'

  const minM = salary.min ? `${Math.round(salary.min / 1000000)}` : '';
  const maxM = salary.max ? `${Math.round(salary.max / 1000000)} triệu` : 'triệu';
  return minM ? `${minM} - ${maxM} VND` : `${maxM} VND`;
};

const formatLocation = (location) => {
  if(!location) return 'Toàn quốc'; 
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.remote) parts.push('Từ xa (Remote)');
  return parts.length > 0 ? parts.join(' • ') : 'Toàn quốc';
};

const formatEmploymentType = (type) => {
  const map = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    internship: 'Thực tập',
    contract: 'Hợp đồng dự án'
  };

  return map[type] || 'Toàn thời gian';
};

const formatTimeAgo = (dateString) =>{
  if (!dateString) return 'Gần đây';
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return 'Gần đây';

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Vừa đăng';
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays <= 30) return `${diffDays} ngày trước`;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const getCompanyLogoText = (title = '', companyId = '') => {
  const words = title.trim().split(/\s+/);
  if(words.length >= 2){
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return title.slice(0,2).toUpperCase() || 'JB'
};


// Dữ liệu mẫu danh sách công việc cho ứng viên


const CandidatePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  // 1. Quản lý danh sách việc làm và trạng thái từ BE
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //2. Quản lý phân trang theo DTO
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
   
  const [filterCriteria, setFilterCriteria] = useState({
    keyword: '',
    industry: '',
    provinces: [],
    isAllProvinces: false
  });

  //4 hàm thực hiện gọi API tìm kiếm việc làm từ backend
  const fetchJobs = useCallback(async(criteria, page) => {
    setLoading(true);
    setError(null);

    try{
      // Chuẩn bị tham số theo đúng backend API quy định:
      // - keyword: từ khoá
      // - profession: nếu chọn ngành nghề
      // - location: nếu chọn tỉnh thành (lấy tỉnh đầu tiên hoặc nối chuỗi)
      const locationParam = criteria.provinces && criteria.provinces.length > 0  && !criteria.isAllProvinces
      ? criteria.provinces[0] 
      : '';

      const data = await searchJobsApi({
        keyword: criteria.keyword,
        profession: criteria.industry,
        location: locationParam,
        page: page,
        size: 10
      });

      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(data.page ?? 0);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm việc làm:', error);
      setError(error.message || 'Đã xảy ra lỗi khi tìm kiếm việc làm.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 5. Tự động fetch dữ liệu khi filterCriteria hoặc currentPage thay đổi
  useEffect(() => {
    fetchJobs(filterCriteria, currentPage);
  }, [filterCriteria, currentPage]);

  // Xử lý callback khi người dùng tìm kiếm từ CandidateSearch
  const handleSearch = (criteria) => {
    setFilterCriteria(criteria);
    setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm mới
  };
  // 7. Chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }

  

  return (
    <div className="candidate-page-container">
      <div className="candidate-header">
        <div className="candidate-header-inner">
          <header className="candidate-hero-header">
            <div className="candidate-hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Không gian Ứng viên (Candidate Portal)</span>
            </div>

            <h1 className="candidate-hero-title">
              Tìm việc làm phù hợp với bạn
            </h1>
            <p className="candidate-hero-subtitle">
              Xin chào <strong>{user.email || 'Ứng viên'}</strong>. Khám phá hàng nghìn cơ hội việc làm hấp dẫn theo kỹ năng, chuyên ngành và 63 tỉnh thành Việt Nam.
            </p>
          </header>

          {/* Thanh tìm kiếm & Modal 3 kiểu tìm kiếm */}
          <CandidateSearch onSearch={handleSearch} />
        </div>
      </div>
      <div className="candidate-page-inner">
        {/* Hero Header */}

        {/* Kết quả tìm kiếm */}
        <section className="candidate-results-section" aria-label="Danh sách việc làm tìm thấy">
          <div className="results-header">
            <h2 className="results-title">Cơ hội việc làm gợi ý</h2>
            <span className="results-count">
              Tìm thấy <strong>{totalElements}</strong> việc làm phù hợp
            </span>
          </div>

          {/* Trạng thái 1: Đang tải dữ liệu (Loading) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <div className="empty-icon-wrap" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
              <p>Đang tìm kiếm việc làm phù hợp từ hệ thống...</p>
            </div>
          ) : error ? (
            /* Trạng thái 2: Lỗi kết nối */
            <div className="jobs-empty-state">
              <h3 className="empty-state-title" style={{ color: 'var(--status-danger)' }}>
                Không thể tải dữ liệu
              </h3>
              <p className="empty-state-desc">{error}</p>
              <button
                type="button"
                className="btn-apply-job"
                style={{ marginTop: '16px' }}
                onClick={() => fetchJobs(filterCriteria, currentPage)}
              >
                Thử lại
              </button>
            </div>
          ) : jobs.length > 0 ? (
            /* Trạng thái 3: Hiển thị danh sách việc làm từ Backend */
            <>
              <div className="jobs-list-grid">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="job-card"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/candidate/jobs/${job.id}`);
                      }
                    }}
                    aria-label={`Xem chi tiết ${job.title}`}
                  >
                    <div className="job-card-main">
                      <div className="job-company-logo" aria-hidden="true">
                        {getCompanyLogoText(job.title, job.companyId)}
                      </div>
                      <div className="job-details">
                        <div className="job-title-row">
                          <h3 className="job-title">{job.title}</h3>
                          <span className="job-salary-badge">{formatSalary(job.salary)}</span>
                        </div>
                        <span className="job-company-name">
                          {job.category || 'Công nghệ thông tin'}
                        </span>

                        <div className="job-meta-row">
                          <span className="job-meta-item">
                            <svg className="job-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {formatLocation(job.location)}
                          </span>

                          <span className="job-meta-item">
                            <svg className="job-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                            {formatEmploymentType(job.employmentType)}
                          </span>

                          <span className="job-meta-item">
                            <svg className="job-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatTimeAgo(job.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="job-card-action">
                      <button
                        type="button"
                        className="btn-apply-job"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/candidate/jobs/${job.id}`);
                        }}
                      >
                        Ứng tuyển ngay
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Thanh phân trang Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
                  <button
                    type="button"
                    className="filter-pill"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={{ opacity: currentPage === 0 ? 0.5 : 1, cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    ← Trang trước
                  </button>

                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Trang <strong>{currentPage + 1}</strong> / {totalPages}
                  </span>

                  <button
                    type="button"
                    className="filter-pill"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1, cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Trang sau →
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Trạng thái 4: Không có việc làm nào phù hợp (Empty State) */
            <div className="jobs-empty-state">
              <div className="empty-icon-wrap" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="empty-state-title">Không tìm thấy việc làm phù hợp</h3>
              <p className="empty-state-desc">
                Không có việc làm nào khớp với tiêu chí tìm kiếm hiện tại. Hãy thử tìm với từ khoá ngắn hơn hoặc thay đổi địa điểm.
              </p>
            </div>
          )}
        </section>

        <section className="application-ready-section" aria-labelledby="application-ready-title">
          <div className="application-ready-header">
            <div>
              <span className="application-ready-eyebrow">Chuẩn bị hồ sơ</span>
              <h2 id="application-ready-title" className="application-ready-title">
                Sẵn sàng ứng tuyển?
              </h2>
              <p className="application-ready-description">
                Hoàn thiện các bước quan trọng để ứng tuyển nhanh hơn khi gặp công việc phù hợp.
              </p>
            </div>

            <Link className="application-ready-primary" to="/cv">
              Quản lý CV
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>
          </div>

          <nav className="application-ready-actions" aria-label="Các bước chuẩn bị ứng tuyển">
            <Link className="application-ready-item" to="/cv">
              <span className="application-ready-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8M8 17h6" />
                </svg>
              </span>
              <span className="application-ready-copy">
                <strong>CV của bạn</strong>
                <span>Tạo mới hoặc cập nhật CV trước khi gửi đến nhà tuyển dụng.</span>
              </span>
              <svg className="application-ready-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>

            <Link className="application-ready-item" to="/candidate/profile?tab=settings">
              <span className="application-ready-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="application-ready-copy">
                <strong>Hồ sơ cá nhân</strong>
                <span>Bổ sung thông tin để nhà tuyển dụng hiểu rõ hơn về bạn.</span>
              </span>
              <svg className="application-ready-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>

            <Link className="application-ready-item" to="/candidate/profile?tab=applications">
              <span className="application-ready-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="15" rx="2" />
                  <path d="M8 5V3h8v2M8 11h8M8 15h5" />
                </svg>
              </span>
              <span className="application-ready-copy">
                <strong>Đơn ứng tuyển</strong>
                <span>Theo dõi các vị trí đã nộp và trạng thái xử lý hồ sơ.</span>
              </span>
              <svg className="application-ready-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </nav>
        </section>
      </div>
    </div>
  );
};

export default CandidatePage;
