import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { registerApi } from '../../services/authService';
import Logo from '../../components/common/Logo';
import './Register.css';

const emptyLocation = {
  address: '',
  city: '',
  country: 'Việt Nam',
};

const RecruiterCompanyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registration = location.state?.registration;

  const [company, setCompany] = useState({
    name: '',
    industry: '',
    logoUrl: '',
    description: '',
    size: '',
    website: '',
  });
  const [companyLocation, setCompanyLocation] = useState(emptyLocation);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!registration) {
    return <Navigate to="/register" replace />;
  }

  const updateCompany = (event) => {
    const { name, value } = event.target;
    setCompany((current) => ({ ...current, [name]: value }));
  };

  const updateLocation = (event) => {
    const { name, value } = event.target;
    setCompanyLocation((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!company.name.trim()) {
      setErrorMessage('Vui lòng nhập tên công ty');
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        ...registration,
        company: {
          ...company,
          name: company.name.trim(),
          industry: company.industry.trim(),
          logoUrl: company.logoUrl.trim(),
          description: company.description.trim(),
          size: company.size.trim(),
          website: company.website.trim(),
          locations: [{
            address: companyLocation.address.trim(),
            city: companyLocation.city.trim(),
            country: companyLocation.country.trim(),
          }],
        },
      });

      navigate('/login', {
        replace: true,
        state: {
          message: 'Đăng ký nhà tuyển dụng thành công. Vui lòng đăng nhập.',
        },
      });
    } catch (error) {
      setErrorMessage(error.message || 'Không thể đăng ký nhà tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-logo">
          <Link to="/">
            <Logo size="lg" />
          </Link>
        </div>

        <h1 className="register-title">Thông tin công ty</h1>
        <p className="register-subtitle">
          Hoàn thiện hồ sơ doanh nghiệp để bắt đầu tuyển dụng.
        </p>

        {errorMessage && (
          <div className="register-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên công ty <span className="required-mark">*</span></label>
            <input name="name" value={company.name} onChange={updateCompany} required autoFocus />
          </div>

          <div className="register-grid">
            <div className="form-group">
              <label>Ngành nghề</label>
              <input name="industry" value={company.industry} onChange={updateCompany} />
            </div>
            <div className="form-group">
              <label>Quy mô</label>
              <input
                name="size"
                placeholder="50–200 nhân viên"
                value={company.size}
                onChange={updateCompany}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website</label>
            <input type="url" name="website" value={company.website} onChange={updateCompany} />
          </div>

          <div className="form-group">
            <label>Logo</label>
            <input type="url" name="logoUrl" value={company.logoUrl} onChange={updateCompany} />
          </div>

          <div className="form-group">
            <label>Mô tả công ty</label>
            <textarea
              name="description"
              rows="4"
              value={company.description}
              onChange={updateCompany}
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ công ty</label>
            <input name="address" value={companyLocation.address} onChange={updateLocation} />
          </div>

          <div className="register-grid">
            <div className="form-group">
              <label>Thành phố</label>
              <input name="city" value={companyLocation.city} onChange={updateLocation} />
            </div>
            <div className="form-group">
              <label>Quốc gia</label>
              <input name="country" value={companyLocation.country} onChange={updateLocation} />
            </div>
          </div>

          <button className="submit-btn" disabled={loading} type="submit">
            {loading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecruiterCompanyPage;
