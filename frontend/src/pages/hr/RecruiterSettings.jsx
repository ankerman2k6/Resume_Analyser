import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RecruiterSettings.css';

const createEmptyLocation = () => ({
  address: '',
  city: '',
  country: '',
});

const RecruiterSettings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
  });
  const [company, setCompany] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    website: '',
    logoUrl: '',
  });
  const [locations, setLocations] = useState([createEmptyLocation()]);
  const [isSaved, setIsSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('personal-information');

  const updateProfile = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setIsSaved(false);
  };

  const updateCompany = (event) => {
    const { name, value } = event.target;
    setCompany((current) => ({ ...current, [name]: value }));
    setIsSaved(false);
  };

  const updateLocation = (index, event) => {
    const { name, value } = event.target;
    setLocations((current) =>
      current.map((location, locationIndex) =>
        locationIndex === index ? { ...location, [name]: value } : location
      )
    );
    setIsSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSaved(true);
  };

  return (
    <main className="hr-settings-page">
      <div className="hr-settings-container">
        <Link className="hr-settings-back" to="/hr">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Nhà tuyển dụng</span>
        </Link>

        <header className="hr-settings-heading">
          <div>
            <span className="hr-settings-eyebrow">TÀI KHOẢN NHÀ TUYỂN DỤNG</span>
            <h1>Cài đặt</h1>
            <p>Quản lý thông tin cá nhân và hồ sơ doanh nghiệp của bạn.</p>
          </div>
          <div className="hr-settings-heading-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.76 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.76a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.24 9c.2.46.65.76 1.15.76H21a2 2 0 1 1 0 4h-.09c-.5 0-.95.3-1.51 1Z" />
            </svg>
          </div>
        </header>

        <nav className="hr-settings-tabs" aria-label="Mục cài đặt">
          <a
            className={activeSection === 'personal-information' ? 'is-active' : ''}
            href="#personal-information"
            onClick={() => setActiveSection('personal-information')}
          >
            Thông tin cá nhân
          </a>
          <a
            className={activeSection === 'company-information' ? 'is-active' : ''}
            href="#company-information"
            onClick={() => setActiveSection('company-information')}
          >
            Thông tin doanh nghiệp
          </a>
        </nav>

        <form className="hr-settings-form" onSubmit={handleSubmit}>
          <section
            className="hr-settings-card"
            id="personal-information"
            aria-labelledby="personal-information-title"
          >
            <div className="hr-settings-card-heading">
              <div className="hr-settings-section-icon hr-settings-section-icon--person" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <div>
                <h2 id="personal-information-title">Thông tin cá nhân</h2>
                <p>Thông tin liên hệ của người đại diện tuyển dụng.</p>
              </div>
            </div>

            <div className="hr-settings-fields">
              <label className="hr-settings-field">
                <span>Họ và tên <em>*</em></span>
                <input
                  autoComplete="name"
                  name="fullName"
                  onChange={updateProfile}
                  placeholder="Nhập họ và tên"
                  required
                  value={profile.fullName}
                />
              </label>
              <label className="hr-settings-field">
                <span>Email <em>*</em></span>
                <input
                  autoComplete="email"
                  name="email"
                  onChange={updateProfile}
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={profile.email}
                />
              </label>
              <label className="hr-settings-field">
                <span>Số điện thoại</span>
                <input
                  autoComplete="tel"
                  name="phone"
                  onChange={updateProfile}
                  placeholder="Nhập số điện thoại"
                  type="tel"
                  value={profile.phone}
                />
              </label>
              <label className="hr-settings-field">
                <span>Chức vụ</span>
                <input
                  autoComplete="organization-title"
                  name="position"
                  onChange={updateProfile}
                  placeholder="Ví dụ: Chuyên viên tuyển dụng"
                  value={profile.position}
                />
              </label>
            </div>
          </section>

          <section
            className="hr-settings-card"
            id="company-information"
            aria-labelledby="company-information-title"
          >
            <div className="hr-settings-card-heading">
              <div className="hr-settings-section-icon hr-settings-section-icon--company" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" />
                </svg>
              </div>
              <div>
                <h2 id="company-information-title">Thông tin doanh nghiệp</h2>
                <p>Giới thiệu doanh nghiệp để ứng viên hiểu hơn về bạn.</p>
              </div>
            </div>

            <div className="hr-settings-fields">
              <label className="hr-settings-field hr-settings-field--wide">
                <span>Tên doanh nghiệp <em>*</em></span>
                <input
                  autoComplete="organization"
                  name="name"
                  onChange={updateCompany}
                  placeholder="Nhập tên doanh nghiệp"
                  required
                  value={company.name}
                />
              </label>
              <label className="hr-settings-field">
                <span>Ngành nghề</span>
                <input
                  name="industry"
                  onChange={updateCompany}
                  placeholder="Ví dụ: Công nghệ thông tin"
                  value={company.industry}
                />
              </label>
              <label className="hr-settings-field">
                <span>Quy mô doanh nghiệp</span>
                <input
                  name="size"
                  onChange={updateCompany}
                  placeholder="Ví dụ: 50–200 nhân viên"
                  value={company.size}
                />
              </label>
              <label className="hr-settings-field hr-settings-field--wide">
                <span>Website</span>
                <input
                  autoComplete="url"
                  name="website"
                  onChange={updateCompany}
                  placeholder="https://congty.com"
                  type="url"
                  value={company.website}
                />
              </label>
              <label className="hr-settings-field hr-settings-field--wide">
                <span>Đường dẫn logo</span>
                <input
                  name="logoUrl"
                  onChange={updateCompany}
                  placeholder="https://congty.com/logo.png"
                  type="url"
                  value={company.logoUrl}
                />
                <small>Dán đường dẫn logo công khai của doanh nghiệp.</small>
              </label>
              <label className="hr-settings-field hr-settings-field--wide">
                <span>Mô tả doanh nghiệp</span>
                <textarea
                  name="description"
                  onChange={updateCompany}
                  placeholder="Chia sẻ về lĩnh vực hoạt động, văn hóa và môi trường làm việc..."
                  rows="4"
                  value={company.description}
                />
              </label>
            </div>

            <div className="hr-settings-locations">
              <div className="hr-settings-location-heading">
                <div>
                  <h3>Địa điểm doanh nghiệp</h3>
                  <p>Thêm địa chỉ văn phòng hoặc địa điểm làm việc.</p>
                </div>
                <button
                  className="hr-settings-add-location"
                  onClick={() => {
                    setLocations((current) => [...current, createEmptyLocation()]);
                    setIsSaved(false);
                  }}
                  type="button"
                >
                  <span aria-hidden="true">+</span> Thêm địa điểm
                </button>
              </div>

              {locations.map((location, index) => (
                <div className="hr-settings-location" key={index}>
                  <div className="hr-settings-location-title">
                    <span>Địa điểm {index + 1}</span>
                    {locations.length > 1 && (
                      <button
                        aria-label={`Xóa địa điểm ${index + 1}`}
                        className="hr-settings-remove-location"
                        onClick={() => {
                          setLocations((current) =>
                            current.filter((_, locationIndex) => locationIndex !== index)
                          );
                          setIsSaved(false);
                        }}
                        type="button"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <div className="hr-settings-fields">
                    <label className="hr-settings-field hr-settings-field--wide">
                      <span>Địa chỉ</span>
                      <input
                        autoComplete="street-address"
                        name="address"
                        onChange={(event) => updateLocation(index, event)}
                        placeholder="Số nhà, tên đường"
                        value={location.address}
                      />
                    </label>
                    <label className="hr-settings-field">
                      <span>Thành phố</span>
                      <input
                        autoComplete="address-level2"
                        name="city"
                        onChange={(event) => updateLocation(index, event)}
                        placeholder="Nhập thành phố"
                        value={location.city}
                      />
                    </label>
                    <label className="hr-settings-field">
                      <span>Quốc gia</span>
                      <input
                        autoComplete="country-name"
                        name="country"
                        onChange={(event) => updateLocation(index, event)}
                        placeholder="Nhập quốc gia"
                        value={location.country}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="hr-settings-footer">
            <p role="status" aria-live="polite">
              {isSaved ? 'Đã cập nhật thông tin trên giao diện. Dữ liệu chưa được gửi đến máy chủ.' : ''}
            </p>
            <button className="hr-settings-save" type="submit">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8" />
              </svg>
              Lưu thay đổi
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
};

export default RecruiterSettings;
