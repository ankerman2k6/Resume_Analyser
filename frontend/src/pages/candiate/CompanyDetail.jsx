import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCompanyDetailApi } from '../../services/jobsService';
import './CompanyDetail.css';

const CompanyDetail = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const fetchCompanyDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // NHẬN API: gọi GET /api/companies/{companyId} qua service.
        const data = await getCompanyDetailApi(companyId);
        if (isCurrent) setCompany(data);
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || 'Không thể tải thông tin công ty.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchCompanyDetail();
    return () => { isCurrent = false; };
  }, [companyId]);

  if (loading) {
    return (
      <main className="company-detail-page" aria-busy="true">
        <div className="company-detail-shell">
          <div className="company-detail-skeleton company-detail-skeleton--hero" />
          <div className="company-detail-layout">
            <div className="company-detail-skeleton company-detail-skeleton--content" />
            <div className="company-detail-skeleton company-detail-skeleton--aside" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !company) {
    return (
      <main className="company-detail-page">
        <div className="company-detail-state">
          <h1>Không thể tải thông tin công ty</h1>
          <p>{error || 'Không tìm thấy công ty này.'}</p>
          <Link className="company-detail-button" to="/candidate">Quay lại danh sách việc làm</Link>
        </div>
      </main>
    );
  }

  const primaryLocation = company.locations?.[0];
  const locationText = primaryLocation
    ? [primaryLocation.city, primaryLocation.country].filter(Boolean).join(', ')
    : null;
  const description = company.description || 'Công ty chưa cung cấp phần giới thiệu.';

  return (
    <main className="company-detail-page">
      <div className="company-detail-shell">
        <Link className="company-detail-back" to="/candidate">← Quay lại danh sách việc làm</Link>
        <header className="company-detail-hero">
          <div className="company-detail-identity">
            <div className="company-detail-logo">
              {company.logoUrl ? <img src={company.logoUrl} alt={`Logo ${company.name}`} /> : company.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="company-detail-heading">
              <h1>{company.name || 'Công ty tuyển dụng'}</h1>
              <div className="company-detail-meta">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" /><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 7 20l1.15-1.15" /><path d="m8 12 8-8" /></svg>
                    <span>{company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </a>
                )}
                {locationText && (
                  <span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                    {locationText}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Nút này chỉ dựng theo design reference; backend chưa có API theo dõi công ty. */}
          <button type="button" className="company-detail-follow-button" aria-label={`Theo dõi ${company.name}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Theo dõi
          </button>
        </header>

        <nav className="company-detail-tabs" aria-label="Điều hướng thông tin công ty">
          <button type="button" className="company-detail-tab company-detail-tab--active" aria-current="page">Tổng quan</button>
          <button type="button" className="company-detail-tab">Tin tuyển dụng</button>
        </nav>

        <div className="company-detail-layout">
          <section className="company-detail-panel company-detail-about-panel">
            <h2>Giới thiệu công ty</h2>
            {/* HIỂN THỊ API: company.description được hiển thị trong vùng giới thiệu */}
            <p className={`company-detail-description${isDescriptionExpanded ? ' is-expanded' : ''}`}>{description}</p>
            {description.length > 260 && (
              <button type="button" className="company-detail-more" onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}>
                {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </section>

          <aside className="company-detail-panel company-detail-overview-panel">
            <h2>Thông tin chung</h2>
            <dl className="company-detail-info">
              <div className="company-detail-info-row">
                <span className="company-detail-info-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 4a3 3 0 0 1 0 6M18 13a5 5 0 0 1 3 4" /></svg></span>
                <div><dt>Quy mô</dt><dd>{company.size || 'Đang cập nhật'}</dd></div>
              </div>
              <div className="company-detail-info-row">
                <span className="company-detail-info-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg></span>
                <div><dt>Ngành nghề</dt><dd>{company.industry || 'Đang cập nhật'}</dd></div>
              </div>
              <div className="company-detail-info-row">
                <span className="company-detail-info-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg></span>
                <div><dt>Địa điểm</dt><dd>{locationText || 'Đang cập nhật'}</dd></div>
              </div>
              {company.website && <div className="company-detail-info-row">
                <span className="company-detail-info-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" /><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 7 20l1.15-1.15" /></svg></span>
                <div><dt>Website</dt><dd><a href={company.website} target="_blank" rel="noreferrer">Truy cập website</a></dd></div>
              </div>}
            </dl>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CompanyDetail;
