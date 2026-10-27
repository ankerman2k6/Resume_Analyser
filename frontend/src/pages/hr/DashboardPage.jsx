import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { getHrDashboard } from '../../services/hrDashboardService';
import './DashboardPage.css';

const divisionColors = ['#2563EB', '#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B'];

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getHrDashboard()
      .then((data) => {
        if (isMounted) setDashboard(data);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const jobsBySpecialty = dashboard?.jobsBySpecialty || [];
  const jobsByDivision = (dashboard?.jobsByDivision || []).map((item, index) => ({
    ...item,
    color: divisionColors[index % divisionColors.length],
  }));
  const interestTrend = dashboard?.candidateInterestTrend || [];
  const summaryCards = dashboard ? [
    { label: 'Job đang tuyển', value: dashboard.totalOpenJobs, tone: 'primary' },
    { label: 'Ứng viên từng ứng tuyển', value: dashboard.interestedCandidates, tone: 'success' },
    { label: 'Tổng hồ sơ ứng tuyển', value: dashboard.totalApplications, tone: 'info' },
    { label: 'Chuyên môn có job', value: jobsBySpecialty.length, tone: 'warning' },
  ] : [];

  return (
    <div className="hr-dashboard-page">
      <div className="hr-dashboard-shell">
        <header className="hr-dashboard-header">
          <div>
            <span className="hr-dashboard-badge">HR Dashboard</span>
            <h1 className="hr-dashboard-title">Tổng quan tuyển dụng</h1>
          </div>

          <div className="hr-dashboard-actions">
            <button type="button" className="btn btn-secondary">
              Xuất báo cáo
            </button>
            <Link to="/hr" className="btn btn-primary">
              Về HR portal
            </Link>
          </div>
        </header>

        {error ? (
          <div className="dashboard-state dashboard-state--error" role="alert">
            <strong>Không tải được dữ liệu từ database</strong>
            <p>{error}</p>
            <p>Kiểm tra backend và MongoDB. API dashboard yêu cầu đăng nhập.</p>
          </div>
        ) : !dashboard ? (
          <div className="dashboard-state" role="status">Đang tải số liệu từ database…</div>
        ) : (
          <>
            <section className="hr-kpi-grid">
              {summaryCards.map((card) => (
                <article key={card.label} className={`kpi-card kpi-card--${card.tone}`}>
                  <p>{card.label}</p>
                  <div className="kpi-card__value-row">
                    <strong>{Number(card.value).toLocaleString('vi-VN')}</strong>
                  </div>
                </article>
              ))}
            </section>

            <section className="hr-chart-grid">
              <article className="panel panel-large">
                <div className="panel-header">
                  <div>
                    <span className="eyebrow">Theo chuyên môn</span>
                    <h2>Số lượng job theo chuyên môn</h2>
                  </div>
                  <strong>{dashboard.totalOpenJobs} vị trí</strong>
                </div>

                <div className="chart-wrapper chart-wrapper--bar">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobsBySpecialty} barCategoryGap={18}>
                      <CartesianGrid vertical={false} stroke="var(--dashboard-border)" strokeDasharray="4 4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }}
                        contentStyle={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--dashboard-border)',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      />
                      <Bar dataKey="count" name="Số job" radius={[10, 10, 0, 0]} fill="var(--chart-blue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="panel">
                <div className="panel-header panel-header--stacked">
                  <div>
                    <span className="eyebrow">Phân hệ</span>
                    <h2>Job theo phân hệ</h2>
                  </div>
                </div>

                <p className="panel-note">Database chưa có trường phân hệ riêng; hiện nhóm theo jobs.category.</p>

                <div className="donut-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobsByDivision}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={78}
                        paddingAngle={3}
                      >
                        {jobsByDivision.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} job`, 'Theo phân hệ']}
                        contentStyle={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--dashboard-border)',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="division-list">
                  {jobsByDivision.map((item) => (
                    <li key={item.name}>
                      <span className="dot" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="hr-panel-grid hr-panel-grid--single">
              <article className="panel">
                <div className="panel-header panel-header--stacked">
                  <div>
                    <span className="eyebrow">Ứng viên quan tâm</span>
                    <h2>Hồ sơ ứng tuyển theo tháng</h2>
                  </div>
                  <strong>{dashboard.interestedCandidates} ứng viên</strong>
                </div>

                <div className="chart-wrapper chart-wrapper--tall">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={interestTrend}>
                      <defs>
                        <linearGradient id="interestFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-cyan)" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="var(--chart-cyan)" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--dashboard-border)" strokeDasharray="4 4" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--dashboard-border)',
                          borderRadius: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="applicants" name="Hồ sơ" stroke="var(--chart-cyan)" fill="url(#interestFill)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>
            </>
          )}
      </div>
    </div>
  );
};

export default DashboardPage;
