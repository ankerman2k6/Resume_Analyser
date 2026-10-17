import React, { useState, useMemo } from 'react';
import CandidateSearch from './CandidateSearch';
import './index.css';

// Dữ liệu mẫu danh sách công việc cho ứng viên
const INITIAL_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer (ReactJS / TypeScript)',
    company: 'FPT Software & Solutions',
    logo: 'FP',
    salary: '25 - 40 triệu',
    location: 'TP. Hồ Chí Minh',
    industryId: 'it',
    industryName: 'Công nghệ thông tin',
    type: 'Toàn thời gian',
    posted: '2 giờ trước'
  },
  {
    id: 2,
    title: 'UI/UX Designer (Figma, Design System)',
    company: 'VNG Corporation',
    logo: 'VN',
    salary: '18 - 28 triệu',
    location: 'Hà Nội',
    industryId: 'design',
    industryName: 'Thiết kế / Sáng tạo',
    type: 'Toàn thời gian',
    posted: '5 giờ trước'
  },
  {
    id: 3,
    title: 'Fullstack NodeJS & React Engineer',
    company: 'Techcombank Digital Lab',
    logo: 'TC',
    salary: '30 - 50 triệu',
    location: 'Đà Nẵng',
    industryId: 'it',
    industryName: 'Công nghệ thông tin',
    type: 'Toàn thời gian',
    posted: '1 ngày trước'
  },
  {
    id: 4,
    title: 'Digital Marketing Lead (SEO, Performance)',
    company: 'Shopee Vietnam',
    logo: 'SP',
    salary: '20 - 35 triệu',
    location: 'TP. Hồ Chí Minh',
    industryId: 'marketing',
    industryName: 'Marketing / Truyền thông',
    type: 'Toàn thời gian',
    posted: '1 ngày trước'
  },
  {
    id: 5,
    title: 'Chuyên viên Kế toán Tổng hợp & Thuế',
    company: 'Vinamilk Group',
    logo: 'VM',
    salary: '15 - 22 triệu',
    location: 'Bình Dương',
    industryId: 'accounting',
    industryName: 'Kế toán / Kiểm toán',
    type: 'Toàn thời gian',
    posted: '2 ngày trước'
  },
  {
    id: 6,
    title: 'Backend Developer (Java, Spring Boot, Microservices)',
    company: 'Viettel Telecom',
    logo: 'VT',
    salary: '22 - 38 triệu',
    location: 'Hà Nội',
    industryId: 'it',
    industryName: 'Công nghệ thông tin',
    type: 'Toàn thời gian',
    posted: '3 ngày trước'
  },
  {
    id: 7,
    title: 'Chuyên viên Quản trị Nhân sự & Tuyển dụng',
    company: 'Masan Consumer',
    logo: 'MS',
    salary: '16 - 25 triệu',
    location: 'Cần Thơ',
    industryId: 'hr',
    industryName: 'Nhân sự / Tuyển dụng',
    type: 'Toàn thời gian',
    posted: '3 ngày trước'
  },
  {
    id: 8,
    title: 'Chuyên viên Phân tích Tài chính Doanh nghiệp',
    company: 'VPBank Securities',
    logo: 'VP',
    salary: '20 - 32 triệu',
    location: 'Hải Phòng',
    industryId: 'finance',
    industryName: 'Tài chính / Ngân hàng',
    type: 'Toàn thời gian',
    posted: '4 ngày trước'
  }
];

const CandidatePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [filterCriteria, setFilterCriteria] = useState({
    keyword: '',
    industry: '',
    provinces: [],
    isAllProvinces: false
  });

  // Xử lý callback khi người dùng tìm kiếm từ CandidateSearch
  const handleSearch = (criteria) => {
    setFilterCriteria(criteria);
  };

  // Lọc danh sách công việc dựa theo tiêu chí
  const filteredJobs = useMemo(() => {
    return INITIAL_JOBS.filter((job) => {
      // 1. Lọc theo từ khoá
      if (filterCriteria.keyword.trim()) {
        const query = filterCriteria.keyword.toLowerCase().trim();
        const matchTitle = job.title.toLowerCase().includes(query);
        const matchCompany = job.company.toLowerCase().includes(query);
        if (!matchTitle && !matchCompany) return false;
      }

      // 2. Lọc theo ngành nghề
      if (filterCriteria.industry) {
        if (job.industryId !== filterCriteria.industry) return false;
      }

      // 3. Lọc theo vị trí thành phố (tỉnh thành)
      if (
        filterCriteria.provinces.length > 0 &&
        !filterCriteria.isAllProvinces
      ) {
        const matchProvince = filterCriteria.provinces.some((p) =>
          job.location.toLowerCase().includes(p.toLowerCase())
        );
        if (!matchProvince) return false;
      }

      return true;
    });
  }, [filterCriteria]);

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
              Tìm thấy <strong>{filteredJobs.length}</strong> việc làm phù hợp
            </span>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="jobs-list-grid">
              {filteredJobs.map((job) => (
                <article key={job.id} className="job-card">
                  <div className="job-card-main">
                    <div className="job-company-logo" aria-hidden="true">
                      {job.logo}
                    </div>
                    <div className="job-details">
                      <div className="job-title-row">
                        <h3 className="job-title">{job.title}</h3>
                        <span className="job-salary-badge">{job.salary}</span>
                      </div>
                      <span className="job-company-name">{job.company}</span>

                      <div className="job-meta-row">
                        <span className="job-meta-item">
                          <svg className="job-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {job.location}
                        </span>

                        <span className="job-meta-item">
                          <svg className="job-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          {job.industryName}
                        </span>

                        <span className="job-meta-item">
                          <svg className="job-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {job.posted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="job-card-action">
                    <button type="button" className="btn-apply-job">
                      Ứng tuyển ngay
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="jobs-empty-state">
              <div className="empty-icon-wrap" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="empty-state-title">Không tìm thấy việc làm phù hợp</h3>
              <p className="empty-state-desc">
                Không có việc làm nào khớp với tiêu chí tìm kiếm hiện tại. Hãy thử chọn thêm tỉnh thành, đổi ngành nghề hoặc tìm với từ khoá ngắn hơn.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CandidatePage;