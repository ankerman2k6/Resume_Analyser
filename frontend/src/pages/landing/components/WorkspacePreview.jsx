import React from 'react';
import { ArrowRight, BriefcaseBusiness, FileCheck2, UserRoundSearch, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const WORKSPACES = [
  {
    role: 'Ứng viên',
    title: 'Hiểu hồ sơ trước khi gửi đi.',
    description: 'Xem cách nội dung trong CV tạo thành tín hiệu, nhận ra phần chưa rõ và chuẩn bị bước chỉnh sửa tiếp theo.',
    path: '/candidate',
    cta: 'Mở không gian Ứng viên',
    icon: FileCheck2,
    features: ['Góc nhìn theo hồ sơ', 'Phản hồi có ngữ cảnh', 'Hướng cải thiện rõ ràng'],
  },
  {
    role: 'Nhà tuyển dụng',
    title: 'Đọc ứng viên trong cùng một khung tham chiếu.',
    description: 'Đi từ yêu cầu công việc tới tín hiệu liên quan trong hồ sơ và giữ các điểm cần xem xét ở đúng ngữ cảnh.',
    path: '/hr',
    cta: 'Mở không gian Nhà tuyển dụng',
    icon: UserRoundSearch,
    features: ['Góc nhìn theo vai trò', 'Đối chiếu nhất quán', 'Điểm cần xem xét rõ ràng'],
  },
];

export function WorkspacePreview() {
  return (
    <section id="workspaces" className="workspaces" aria-labelledby="workspaces-title">
      <div className="landing-shell">
        <div className="landing-section-heading workspaces__heading">
          <div>
            <p className="landing-eyebrow"><span /> Hai vai trò sản phẩm</p>
            <h2 id="workspaces-title">Một Career Signal, hai không gian làm việc.</h2>
          </div>
          <p>
            Mỗi vai trò nhận đúng góc nhìn và hành động cần thiết, trong khi thuật ngữ và trạng thái vẫn nhất quán.
          </p>
        </div>

        <div className="workspaces__grid">
          {WORKSPACES.map(({ role, title, description, path, cta, icon: Icon, features }, index) => (
            <article key={role} className={`workspace-card workspace-card--${index === 0 ? 'candidate' : 'recruiter'}`}>
              <div className="workspace-card__top">
                <span className="workspace-card__icon"><Icon aria-hidden="true" /></span>
                <span className="workspace-card__role">{role}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <ul>
                {features.map((feature) => <li key={feature}><span />{feature}</li>)}
              </ul>
              <Link to={path}>
                {cta}
                <ArrowRight aria-hidden="true" />
              </Link>
              <div className="workspace-card__preview" aria-hidden="true">
                <div className="workspace-card__preview-head">
                  {index === 0 ? <WandSparkles /> : <BriefcaseBusiness />}
                  <span /><span />
                </div>
                <div className="workspace-card__preview-body"><i /><i /><i /></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
