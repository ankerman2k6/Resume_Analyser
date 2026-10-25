import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCompanyDetailApi, getJobDetailApi } from '../../services/jobsService';
import './JobDetail.css';

const formatSalary = (salary) => {
  if (!salary || salary.negotiable && (!salary.min || !salary.max)) return 'Thoả thuận';
  const min = salary.min ? `${Math.round(salary.min / 1000000)} triệu` : '';
  const max = salary.max ? `${Math.round(salary.max / 1000000)} triệu` : '';
  return [min, max].filter(Boolean).join(' - ') + ` ${salary.currency || 'VND'}`;
};

const formatLocation = (location) => {
  if (!location) return 'Toàn quốc';
  const place = [location.city, location.country].filter(Boolean).join(', ');
  return [place, location.remote ? 'Từ xa (Remote)' : null].filter(Boolean).join(' • ') || 'Toàn quốc';
};

const employmentTypeLabels = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  internship: 'Thực tập',
  contract: 'Hợp đồng dự án',
  freelance: 'Freelance'
};

const formatDate = (date) => {
  if (!date) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(date));
};

const getSkillList = (requirements, key) => {
  const value = requirements?.[key];
  return Array.isArray(value) ? value : [];
};

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    const fetchJobDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // NHẬN API: gọi GET /api/jobs/{jobId} qua service đã tách riêng.
        const data = await getJobDetailApi(jobId);
        if (isCurrent) setJob(data);

        // NHẬN API BỔ SUNG: companyId từ job được dùng để lấy tên/logo công ty.
        if (data.companyId) {
          try {
            const companyData = await getCompanyDetailApi(data.companyId);
            if (isCurrent) setCompany(companyData);
          } catch {
            // Job vẫn hiển thị được nếu dữ liệu company bị thiếu hoặc companyId không còn tồn tại.
            if (isCurrent) setCompany(null);
          }
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || 'Không thể tải chi tiết việc làm.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchJobDetail();
    return () => { isCurrent = false; };
  }, [jobId]);

  const requirements = job?.requirements || {};
  const requiredSkills = useMemo(() => getSkillList(requirements, 'requiredSkills'), [requirements]);
  const preferredSkills = useMemo(() => getSkillList(requirements, 'preferredSkills'), [requirements]);

  if (loading) {
    return (
      <main className="job-detail-page" aria-busy="true">
        <div className="job-detail-shell">
          <div className="job-detail-skeleton job-detail-skeleton--hero" />
          <div className="job-detail-layout">
            <div className="job-detail-panel"><div className="job-detail-skeleton" /><div className="job-detail-skeleton" /><div className="job-detail-skeleton job-detail-skeleton--short" /></div>
            <div className="job-detail-panel"><div className="job-detail-skeleton job-detail-skeleton--button" /><div className="job-detail-skeleton" /><div className="job-detail-skeleton job-detail-skeleton--short" /></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="job-detail-page">
        <div className="job-detail-shell">
          <section className="job-detail-state" role="alert">
            <div className="job-detail-state-icon" aria-hidden="true">!</div>
            <h1>Không thể tải chi tiết việc làm</h1>
            <p>{error || 'Không tìm thấy tin tuyển dụng này.'}</p>
            <button type="button" className="job-detail-button job-detail-button--primary" onClick={() => navigate('/candidate')}>
              Quay lại danh sách
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="job-detail-page">
      <div className="job-detail-shell">
        <Link className="job-detail-back" to="/candidate">← Quay lại danh sách việc làm</Link>

        <header className="job-detail-hero">
          <div className="job-detail-company-mark" aria-hidden="true">{company.logoUrl ? <img src={company.logoUrl} alt={`Logo ${company.name}`} /> : company.name?.slice(0, 2).toUpperCase() || 'CO'}</div>
          <div className="job-detail-hero-content">
            <span className="job-detail-eyebrow">{job.category || 'Cơ hội nghề nghiệp'}</span>
            {/* HIỂN THỊ API: các field job.title, job.category, job.location và job.employmentType */}
            <h1>{job.title}</h1>
            <div className="job-detail-meta" aria-label="Thông tin tóm tắt">
              <span>{formatLocation(job.location)}</span>
              <span>{employmentTypeLabels[job.employmentType] || 'Toàn thời gian'}</span>
              <span>Hạn nộp {formatDate(job.deadline)}</span>
            </div>
          </div>
          <div className="job-detail-hero-salary">{formatSalary(job.salary)}</div>
        </header>

        <div className="job-detail-layout">
          <article className="job-detail-main-column">
            <section className="job-detail-panel">
              <h2>Mô tả công việc</h2>
              {/* HIỂN THỊ API: job.description được render trực tiếp và giữ xuống dòng bằng CSS white-space */}
              <p className="job-detail-description">{job.description || 'Nhà tuyển dụng chưa cung cấp mô tả cho vị trí này.'}</p>
            </section>

            <section className="job-detail-panel">
              <h2>Yêu cầu ứng viên</h2>
              {requiredSkills.length > 0 && (
                <div className="job-detail-requirement-group">
                  <h3>Kỹ năng bắt buộc</h3>
                  <div className="job-detail-chips">{requiredSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </div>
              )}
              {preferredSkills.length > 0 && (
                <div className="job-detail-requirement-group">
                  <h3>Kỹ năng ưu tiên</h3>
                  <div className="job-detail-chips">{preferredSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </div>
              )}
              {requirements.education && (
                <div className="job-detail-requirement-row"><strong>Học vấn</strong><span>{requirements.education.minimumDegree || 'Không yêu cầu cụ thể'}</span></div>
              )}
              {requirements.minimumGpa && (
                <div className="job-detail-requirement-row"><strong>GPA tối thiểu</strong><span>{requirements.minimumGpa.value}/{requirements.minimumGpa.scale}</span></div>
              )}
              {requirements.languages?.length > 0 && (
                <div className="job-detail-requirement-row"><strong>Ngôn ngữ</strong><span>{requirements.languages.map((language) => `${language.name}${language.minimumLevel ? ` (${language.minimumLevel})` : ''}`).join(', ')}</span></div>
              )}
              {requiredSkills.length === 0 && preferredSkills.length === 0 && !requirements.education && !requirements.minimumGpa && !requirements.languages?.length && <p className="job-detail-muted">Chưa có yêu cầu chi tiết.</p>}
            </section>

            <section className="job-detail-panel">
              <h2>Quyền lợi</h2>
              {/* HIỂN THỊ API: job.benefits được chuyển thành danh sách quyền lợi */}
              {job.benefits?.length > 0 ? <ul className="job-detail-benefits">{job.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul> : <p className="job-detail-muted">Chưa có thông tin quyền lợi.</p>}
            </section>
          </article>

          <aside className="job-detail-side-column">
            <section className="job-detail-panel job-detail-summary-panel">
              <button type="button" className="job-detail-button job-detail-button--primary job-detail-apply-button">
                Ứng tuyển ngay
              </button>
              <dl className="job-detail-summary-list">
                <div><dt>Mức lương</dt><dd>{formatSalary(job.salary)}</dd></div>
                <div><dt>Kinh nghiệm</dt><dd>{job.experience?.level || `${job.experience?.minYears || 0} - ${job.experience?.maxYears || 0} năm`}</dd></div>
                <div><dt>Địa điểm</dt><dd>{formatLocation(job.location)}</dd></div>
                <div><dt>Hạn nộp hồ sơ</dt><dd>{formatDate(job.deadline)}</dd></div>
              </dl>
            </section>
            <section className="job-detail-panel job-detail-company-panel">
              <h2>Công ty</h2>
              {company ? (
                <Link className="job-detail-company-link" to={`/candidate/companies/${company.id}`}>
                  <span className="job-detail-company-logo">{company.logoUrl ? <img src={company.logoUrl} alt={`Logo ${company.name}`} /> : company.name?.slice(0, 2).toUpperCase()}</span>
                  <span className="job-detail-company-copy"><strong>{company.name}</strong><small>{company.industry || 'Công ty tuyển dụng'}</small></span>
                  <span className="job-detail-company-arrow" aria-hidden="true">→</span>
                </Link>
              ) : <p className="job-detail-muted">Chưa có thông tin công ty.</p>}
            </section>
          </aside>
        </div>
      </div>
      <div className="job-detail-mobile-apply"><button type="button" className="job-detail-button job-detail-button--primary">Ứng tuyển ngay</button></div>
    </main>
  );
};

export default JobDetail;
