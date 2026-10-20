import React from 'react';
import { ArrowDown, ArrowRight, Braces, FileSearch, Waypoints } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CareerSignalHero() {
  return (
    <section className="career-hero" aria-labelledby="career-signal-title">
      <div className="career-hero__glow" aria-hidden="true" />
      <div className="landing-shell career-hero__layout">
        <div className="career-hero__copy">
          <p className="landing-eyebrow"><span /> KONEK Career Signal</p>
          <h1 id="career-signal-title">
            Biến hồ sơ thành <em>tín hiệu nghề nghiệp</em> rõ ràng.
          </h1>
          <p className="career-hero__lede">
            KONEK đọc cấu trúc CV, nhận diện kỹ năng trong ngữ cảnh và đặt chúng cạnh yêu cầu công việc để làm rõ bước tiếp theo cho ứng viên lẫn nhà tuyển dụng.
          </p>
          <div className="career-hero__actions">
            <a className="landing-button landing-button--primary" href="#signal">
              Xem tín hiệu được giải mã
              <ArrowDown aria-hidden="true" />
            </a>
            <Link className="landing-button landing-button--secondary" to="/register">
              Bắt đầu với KONEK
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ul className="career-hero__principles" aria-label="Nguyên tắc phân tích">
            <li><FileSearch aria-hidden="true" /> Tài liệu là nguồn tín hiệu</li>
            <li><Braces aria-hidden="true" /> Cấu trúc tạo ngữ cảnh</li>
            <li><Waypoints aria-hidden="true" /> Kết quả dẫn tới hành động</li>
          </ul>
        </div>

        <div className="career-hero__visual" aria-label="Minh hoạ hồ sơ đang được phân tích">
          <div className="career-hero__orbit career-hero__orbit--one" aria-hidden="true" />
          <div className="career-hero__orbit career-hero__orbit--two" aria-hidden="true" />
          <div className="career-hero__document">
            <div className="career-hero__document-head">
              <span className="career-hero__avatar" />
              <div><i /><i /></div>
            </div>
            <div className="career-hero__document-body">
              <span /><span /><span /><span />
            </div>
            <div className="career-hero__tags">
              <span>Kỹ năng</span><span>Kinh nghiệm</span>
            </div>
            <div className="career-hero__scan" aria-hidden="true" />
          </div>
          <div className="career-hero__signal-card career-hero__signal-card--top">
            <span>Cấu trúc</span><strong>Đã nhận diện</strong>
          </div>
          <div className="career-hero__signal-card career-hero__signal-card--bottom">
            <span>Tín hiệu</span><strong>Sẵn sàng đối chiếu</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
