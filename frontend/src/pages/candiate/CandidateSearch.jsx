import React, { useState, useEffect, useMemo, useRef } from 'react';
import './CandidateSearch.css';
import {
  VIETNAM_PROVINCES,
  MAJOR_CITIES,
  INDUSTRIES,
  POPULAR_KEYWORDS
} from './searchData';

/**
 * CandidateSearch Component
 * 
 * Tính năng chính theo quy chuẩn UI/UX:
 * 1. Thanh tìm kiếm đa năng (Search Bar) với hiển thị trạng thái lọc nhanh.
 * 2. Modal tìm kiếm 3 kiểu:
 *    - Kiểu 1: Tìm theo từ khoá (Keyword) + Gợi ý từ khoá phổ biến.
 *    - Kiểu 2: Tìm theo ngành nghề (Industry) + Tra cứu ngành nhanh.
 *    - Kiểu 3: Tìm theo vị trí thành phố (Location) + Box tick chọn cho tất cả 63 tỉnh thành Việt Nam.
 * 
 */
const CandidateSearch = ({ onSearch }) => {
  // Trạng thái tìm kiếm áp dụng chính thức
  const [keyword, setKeyword] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState([]);

  // Trạng thái Modal & Tab
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('keyword'); // 'keyword' | 'industry' | 'location'

  // Trạng thái bản nháp trong Modal (chỉ lưu khi bấm "Áp dụng")
  const [draftKeyword, setDraftKeyword] = useState('');
  const [draftIndustry, setDraftIndustry] = useState('');
  const [draftProvinces, setDraftProvinces] = useState([]);

  // Bộ lọc tìm kiếm nhanh trong Modal
  const [industrySearchTerm, setIndustrySearchTerm] = useState('');
  const [provinceSearchTerm, setProvinceSearchTerm] = useState('');

  // Ref cho modal input
  const keywordInputRef = useRef(null);

  // Khi mở modal, đồng bộ dữ liệu hiện tại vào bản nháp
  const openModal = (tab = 'keyword') => {
    setActiveTab(tab);
    setDraftKeyword(keyword);
    setDraftIndustry(selectedIndustry);
    setDraftProvinces([...selectedProvinces]);
    setIndustrySearchTerm('');
    setProvinceSearchTerm('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Đóng modal bằng phím ESC và khoá scroll của body
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Focus vào ô input khi chuyển sang tab từ khoá trong modal
  useEffect(() => {
    if (isModalOpen && activeTab === 'keyword') {
      setTimeout(() => {
        keywordInputRef.current?.focus();
      }, 50);
    }
  }, [isModalOpen, activeTab]);

  // Kiểm tra trạng thái "Chọn tất cả 63 tỉnh thành" trong bản nháp
  const isAllProvincesDraft = useMemo(() => {
    return (
      VIETNAM_PROVINCES.length > 0 &&
      draftProvinces.length === VIETNAM_PROVINCES.length
    );
  }, [draftProvinces]);

  const isIndeterminateProvincesDraft = useMemo(() => {
    return (
      draftProvinces.length > 0 &&
      draftProvinces.length < VIETNAM_PROVINCES.length
    );
  }, [draftProvinces]);

  // Xử lý toggle "Chọn tất cả tỉnh thành Việt Nam"
  const handleToggleAllProvinces = () => {
    if (isAllProvincesDraft) {
      setDraftProvinces([]);
    } else {
      setDraftProvinces([...VIETNAM_PROVINCES]);
    }
  };

  // Xử lý toggle từng tỉnh thành
  const handleToggleProvince = (provinceName) => {
    setDraftProvinces((prev) => {
      if (prev.includes(provinceName)) {
        return prev.filter((p) => p !== provinceName);
      } else {
        return [...prev, provinceName];
      }
    });
  };

  // Chọn nhanh các thành phố lớn
  const handleSelectMajorCities = () => {
    setDraftProvinces((prev) => {
      const allSelected = MAJOR_CITIES.every((city) => prev.includes(city));
      if (allSelected) {
        return prev.filter((city) => !MAJOR_CITIES.includes(city));
      } else {
        const uniqueSet = new Set([...prev, ...MAJOR_CITIES]);
        return Array.from(uniqueSet);
      }
    });
  };

  // Lọc ngành nghề theo từ khoá tra cứu trong modal
  const filteredIndustries = useMemo(() => {
    if (!industrySearchTerm.trim()) return INDUSTRIES;
    const term = industrySearchTerm.toLowerCase();
    return INDUSTRIES.filter((ind) => ind.name.toLowerCase().includes(term));
  }, [industrySearchTerm]);

  // Lọc tỉnh thành theo từ khoá tra cứu trong modal
  const filteredProvinces = useMemo(() => {
    if (!provinceSearchTerm.trim()) return VIETNAM_PROVINCES;
    const term = provinceSearchTerm.toLowerCase();
    return VIETNAM_PROVINCES.filter((p) => p.toLowerCase().includes(term));
  }, [provinceSearchTerm]);

  // Đếm tổng số tiêu chí đang được chọn trong bản nháp
  const draftFilterCount = useMemo(() => {
    let count = 0;
    if (draftKeyword.trim()) count += 1;
    if (draftIndustry) count += 1;
    if (draftProvinces.length > 0) count += 1;
    return count;
  }, [draftKeyword, draftIndustry, draftProvinces]);

  // Áp dụng các thay đổi từ modal
  const handleApplyFilters = () => {
    setKeyword(draftKeyword);
    setSelectedIndustry(draftIndustry);
    setSelectedProvinces([...draftProvinces]);
    setIsModalOpen(false);

    if (onSearch) {
      onSearch({
        keyword: draftKeyword,
        industry: draftIndustry,
        provinces: draftProvinces,
        isAllProvinces: draftProvinces.length === VIETNAM_PROVINCES.length
      });
    }
  };

  // Xoá toàn bộ bộ lọc trong bản nháp
  const handleResetDraftFilters = () => {
    setDraftKeyword('');
    setDraftIndustry('');
    setDraftProvinces([]);
  };

  // Xoá trực tiếp từng bộ lọc ở thanh ngoài
  const handleRemoveKeyword = () => {
    setKeyword('');
    if (onSearch) {
      onSearch({
        keyword: '',
        industry: selectedIndustry,
        provinces: selectedProvinces,
        isAllProvinces: selectedProvinces.length === VIETNAM_PROVINCES.length
      });
    }
  };

  const handleRemoveIndustry = () => {
    setSelectedIndustry('');
    if (onSearch) {
      onSearch({
        keyword,
        industry: '',
        provinces: selectedProvinces,
        isAllProvinces: selectedProvinces.length === VIETNAM_PROVINCES.length
      });
    }
  };

  const handleRemoveProvinces = () => {
    setSelectedProvinces([]);
    if (onSearch) {
      onSearch({
        keyword,
        industry: selectedIndustry,
        provinces: [],
        isAllProvinces: false
      });
    }
  };

  const handleClearAllActiveFilters = () => {
    setKeyword('');
    setSelectedIndustry('');
    setSelectedProvinces([]);
    if (onSearch) {
      onSearch({
        keyword: '',
        industry: '',
        provinces: [],
        isAllProvinces: false
      });
    }
  };

  // Thực hiện tìm kiếm nhanh từ input chính
  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        keyword,
        industry: selectedIndustry,
        provinces: selectedProvinces,
        isAllProvinces: selectedProvinces.length === VIETNAM_PROVINCES.length
      });
    }
  };

  // Lấy tên hiển thị cho ngành nghề đã chọn
  const selectedIndustryName = useMemo(() => {
    if (!selectedIndustry) return '';
    const found = INDUSTRIES.find((ind) => ind.id === selectedIndustry);
    return found ? found.name : '';
  }, [selectedIndustry]);

  // Lấy nhãn hiển thị cho tỉnh thành trên thanh tìm kiếm
  const locationDisplayLabel = useMemo(() => {
    if (selectedProvinces.length === 0) return 'Tất cả tỉnh thành';
    if (selectedProvinces.length === VIETNAM_PROVINCES.length) return 'Toàn quốc (63 tỉnh)';
    if (selectedProvinces.length === 1) return selectedProvinces[0];
    return `${selectedProvinces[0]} +${selectedProvinces.length - 1}`;
  }, [selectedProvinces]);

  // Kiểm tra có ít nhất 1 bộ lọc đang hoạt động
  const hasActiveFilters = Boolean(
    keyword.trim() || selectedIndustry || selectedProvinces.length > 0
  );

  return (
    <section className="candidate-search-section" aria-label="Tìm kiếm việc làm cho ứng viên">
      {/* --------------------------------------------------------------------
          1. Thanh tìm kiếm chính (Search Bar)
          -------------------------------------------------------------------- */}
      <form className="candidate-search-bar" onSubmit={handleQuickSearchSubmit} role="search">
        {/* Trường 1: Nhập từ khoá nhanh */}
        <div className="search-field search-field--keyword">
          <svg
            className="search-field-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-field-input"
            placeholder="Tìm theo chức danh, kỹ năng, công ty..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="search-bar-divider" aria-hidden="true" />

        {/* Trường 2: Chọn ngành nghề (bấm mở modal tab ngành) */}
        <div
          className="search-field search-field--select"
          onClick={() => openModal('industry')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openModal('industry')}
          aria-label="Chọn ngành nghề tìm kiếm"
        >
          <svg
            className="search-field-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <div className="search-field-content">
            <span className="search-field-label">Ngành nghề</span>
            <span
              className={`search-field-value ${!selectedIndustry ? 'is-placeholder' : ''}`}
              title={selectedIndustryName || 'Tất cả ngành nghề'}
            >
              {selectedIndustryName || 'Tất cả ngành nghề'}
            </span>
          </div>
          <svg
            className="search-field-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div className="search-bar-divider" aria-hidden="true" />

        {/* Trường 3: Chọn vị trí thành phố (bấm mở modal tab địa điểm) */}
        <div
          className="search-field search-field--select"
          onClick={() => openModal('location')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openModal('location')}
          aria-label="Chọn tỉnh thành tìm kiếm"
        >
          <svg
            className="search-field-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="search-field-content">
            <span className="search-field-label">Địa điểm</span>
            <span
              className={`search-field-value ${selectedProvinces.length === 0 ? 'is-placeholder' : ''}`}
              title={locationDisplayLabel}
            >
              {locationDisplayLabel}
            </span>
          </div>
          <svg
            className="search-field-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Cụm hành động */}
        <div className="search-bar-actions">
          {/* Nút mở Modal bộ lọc nâng cao */}
          <button
            type="button"
            className={`btn-filter-trigger ${hasActiveFilters ? 'has-filter' : ''}`}
            onClick={() => openModal('keyword')}
            title="Mở bộ lọc tìm kiếm nâng cao"
            aria-label="Mở bộ lọc tìm kiếm"
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
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Bộ lọc</span>
            {hasActiveFilters && (
              <span className="filter-badge-count">
                {(keyword ? 1 : 0) + (selectedIndustry ? 1 : 0) + (selectedProvinces.length > 0 ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Nút Tìm kiếm */}
          <button type="submit" className="btn-search-submit">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Tìm việc</span>
          </button>
        </div>
      </form>

      {/* --------------------------------------------------------------------
          2. Danh sách chip lọc đang áp dụng (Active Filter Chips)
          -------------------------------------------------------------------- */}
      {hasActiveFilters && (
        <div className="active-filters-bar" aria-label="Bộ lọc đang áp dụng">
          <span className="active-filters-label">Đang lọc theo:</span>

          {keyword.trim() && (
            <span className="filter-chip">
              <span>Từ khoá: <strong>{keyword}</strong></span>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={handleRemoveKeyword}
                aria-label={`Xoá lọc từ khoá ${keyword}`}
              >
                ✕
              </button>
            </span>
          )}

          {selectedIndustry && (
            <span className="filter-chip">
              <span>Ngành: <strong>{selectedIndustryName}</strong></span>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={handleRemoveIndustry}
                aria-label={`Xoá lọc ngành ${selectedIndustryName}`}
              >
                ✕
              </button>
            </span>
          )}

          {selectedProvinces.length > 0 && (
            <span className="filter-chip">
              <span>
                Khu vực:{' '}
                <strong>
                  {selectedProvinces.length === VIETNAM_PROVINCES.length
                    ? 'Toàn quốc (63 tỉnh thành)'
                    : `${selectedProvinces.slice(0, 2).join(', ')}${selectedProvinces.length > 2 ? ` (+${selectedProvinces.length - 2})` : ''}`}
                </strong>
              </span>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={handleRemoveProvinces}
                aria-label="Xoá lọc địa điểm tỉnh thành"
              >
                ✕
              </button>
            </span>
          )}

          <button
            type="button"
            className="btn-clear-all-filters"
            onClick={handleClearAllActiveFilters}
          >
            Xoá tất cả
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------
          3. Modal Tìm kiếm nâng cao gồm 3 kiểu (Keyword, Industry, Location)
          -------------------------------------------------------------------- */}
      {isModalOpen && (
        <div
          className="candidate-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="candidate-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <header className="modal-header">
              <div className="modal-header-info">
                <h2 id="modal-title" className="modal-header-title">
                  Tìm kiếm cơ hội việc làm
                </h2>
                <p className="modal-header-desc">
                  Tuỳ chỉnh tiêu chí theo từ khoá, ngành nghề và 63 tỉnh thành Việt Nam
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Đóng cửa sổ tìm kiếm"
              >
                ✕
              </button>
            </header>

            {/* Modal Navigation Tabs: 3 kiểu tìm kiếm */}
            <nav className="modal-tabs" aria-label="3 kiểu tìm kiếm">
              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'keyword' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('keyword')}
              >
                <span>1. Từ khoá</span>
                {draftKeyword.trim() && <span className="tab-badge">Đã nhập</span>}
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'industry' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('industry')}
              >
                <span>2. Ngành nghề</span>
                {draftIndustry && <span className="tab-badge">Đã chọn</span>}
              </button>

              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'location' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('location')}
              >
                <span>3. Tỉnh thành</span>
                {draftProvinces.length > 0 && (
                  <span className="tab-badge">
                    {draftProvinces.length === VIETNAM_PROVINCES.length
                      ? '63 tỉnh'
                      : `${draftProvinces.length} tỉnh`}
                  </span>
                )}
              </button>
            </nav>

            {/* Modal Body */}
            <div className="modal-body">
              {/* TAB 1: Tìm theo từ khoá */}
              {activeTab === 'keyword' && (
                <div className="tab-pane" role="tabpanel" aria-label="Tìm theo từ khoá">
                  <div className="keyword-input-wrap">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--text-secondary)' }}
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      ref={keywordInputRef}
                      type="text"
                      className="keyword-modal-input"
                      placeholder="Nhập chức danh, kỹ năng, chuyên môn, tên công ty..."
                      value={draftKeyword}
                      onChange={(e) => setDraftKeyword(e.target.value)}
                    />
                    {draftKeyword && (
                      <button
                        type="button"
                        className="keyword-clear-btn"
                        onClick={() => setDraftKeyword('')}
                        aria-label="Xoá nội dung từ khoá"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Gợi ý từ khoá phổ biến */}
                  <div className="keyword-suggestions">
                    <span className="suggestions-title">Từ khoá gợi ý phổ biến:</span>
                    <div className="suggestions-tags">
                      {POPULAR_KEYWORDS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="suggestion-pill"
                          onClick={() => setDraftKeyword(tag)}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Tìm theo ngành nghề */}
              {activeTab === 'industry' && (
                <div className="tab-pane" role="tabpanel" aria-label="Tìm theo ngành nghề">
                  {/* Ô tìm kiếm ngành nhanh */}
                  <div className="filter-search-box">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: 'var(--text-secondary)' }}
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder="Tìm kiếm ngành nghề nhanh..."
                      value={industrySearchTerm}
                      onChange={(e) => setIndustrySearchTerm(e.target.value)}
                    />
                    {industrySearchTerm && (
                      <button
                        type="button"
                        className="keyword-clear-btn"
                        onClick={() => setIndustrySearchTerm('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Grid lựa chọn ngành nghề */}
                  <div className="industry-options-grid">
                    {/* Tuỳ chọn: Tất cả ngành */}
                    <div
                      className={`industry-card-item ${draftIndustry === '' ? 'is-selected' : ''}`}
                      onClick={() => setDraftIndustry('')}
                      role="radio"
                      aria-checked={draftIndustry === ''}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setDraftIndustry('')}
                    >
                      <div className="industry-info">
                        <span className="industry-name">Tất cả ngành nghề</span>
                        <span className="industry-count">Toàn bộ việc làm khả dụng</span>
                      </div>
                      <div className="industry-check-indicator" aria-hidden="true">
                        ✓
                      </div>
                    </div>

                    {/* Danh sách ngành */}
                    {filteredIndustries.map((ind) => {
                      const isSelected = draftIndustry === ind.id;
                      return (
                        <div
                          key={ind.id}
                          className={`industry-card-item ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => setDraftIndustry(ind.id)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setDraftIndustry(ind.id)}
                        >
                          <div className="industry-info">
                            <span className="industry-name">{ind.name}</span>
                            <span className="industry-count">{ind.count}</span>
                          </div>
                          <div className="industry-check-indicator" aria-hidden="true">
                            ✓
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Tìm theo vị trí thành phố (63 tỉnh thành) */}
              {activeTab === 'location' && (
                <div className="tab-pane" role="tabpanel" aria-label="Tìm theo vị trí tỉnh thành">
                  {/* BOX TICK CHỌN CHO TẤT CẢ CÁC TỈNH THÀNH Ở VIỆT NAM (Theo yêu cầu cốt lõi) */}
                  <div
                    className={`provinces-all-box ${isAllProvincesDraft ? 'is-all-selected' : ''}`}
                    onClick={handleToggleAllProvinces}
                    role="checkbox"
                    aria-checked={isAllProvincesDraft ? true : isIndeterminateProvincesDraft ? 'mixed' : false}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggleAllProvinces()}
                  >
                    <div className="provinces-all-box-content">
                      <span className="provinces-all-box-title">
                        <span>🇻🇳 Chọn tất cả tỉnh thành ở Việt Nam (63 tỉnh thành)</span>
                      </span>
                      <span className="provinces-all-box-desc">
                        {isAllProvincesDraft
                          ? 'Đang chọn toàn bộ 63 tỉnh thành trên toàn quốc'
                          : isIndeterminateProvincesDraft
                          ? `Đang chọn ${draftProvinces.length}/63 tỉnh thành`
                          : 'Nhấp để áp dụng tìm kiếm cho tất cả các tỉnh thành'}
                      </span>
                    </div>

                    {/* Checkbox Visual chuẩn UI/UX */}
                    <div className="custom-checkbox-wrapper">
                      <div
                        className={`custom-checkbox-visual ${isAllProvincesDraft ? 'is-checked' : ''} ${isIndeterminateProvincesDraft ? 'is-indeterminate' : ''}`}
                        aria-hidden="true"
                      >
                        {isAllProvincesDraft ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : isIndeterminateProvincesDraft ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Thanh tiện ích & chọn nhanh */}
                  <div className="provinces-quick-actions">
                    <div className="quick-city-group">
                      <span className="quick-city-label">Chọn nhanh:</span>
                      <button
                        type="button"
                        className={`btn-quick-city ${MAJOR_CITIES.every((c) => draftProvinces.includes(c)) ? 'is-selected' : ''}`}
                        onClick={handleSelectMajorCities}
                      >
                        6 Thành phố lớn
                      </button>
                      <button
                        type="button"
                        className="btn-quick-city"
                        onClick={() => setDraftProvinces([])}
                      >
                        Bỏ chọn hết
                      </button>
                    </div>

                    <div className="provinces-stats-bar">
                      <span className="provinces-stats-count">
                        Đã chọn: <strong>{draftProvinces.length}</strong> / 63 tỉnh
                      </span>
                    </div>
                  </div>

                  {/* Ô tìm kiếm nhanh tỉnh thành */}
                  <div className="filter-search-box">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: 'var(--text-secondary)' }}
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder="Tìm kiếm nhanh tên tỉnh, thành phố..."
                      value={provinceSearchTerm}
                      onChange={(e) => setProvinceSearchTerm(e.target.value)}
                    />
                    {provinceSearchTerm && (
                      <button
                        type="button"
                        className="keyword-clear-btn"
                        onClick={() => setProvinceSearchTerm('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Grid 63 tỉnh thành cuộn mượt */}
                  <div className="provinces-grid-scroll" role="group" aria-label="Danh sách 63 tỉnh thành Việt Nam">
                    <div className="provinces-grid">
                      {filteredProvinces.map((prov) => {
                        const isChecked = draftProvinces.includes(prov);
                        return (
                          <label
                            key={prov}
                            className={`province-checkbox-item ${isChecked ? 'is-selected' : ''}`}
                          >
                            <div className="custom-checkbox-wrapper">
                              <input
                                type="checkbox"
                                className="custom-checkbox-native"
                                checked={isChecked}
                                onChange={() => handleToggleProvince(prov)}
                              />
                              <div
                                className={`custom-checkbox-visual ${isChecked ? 'is-checked' : ''}`}
                                aria-hidden="true"
                              >
                                {isChecked && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="province-name">{prov}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <footer className="modal-footer">
              <button
                type="button"
                className="btn-reset-filter"
                onClick={handleResetDraftFilters}
              >
                Thiết lập lại
              </button>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={closeModal}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  className="btn-modal-apply"
                  onClick={handleApplyFilters}
                >
                  Áp dụng {draftFilterCount > 0 ? `(${draftFilterCount})` : ''}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default CandidateSearch;
