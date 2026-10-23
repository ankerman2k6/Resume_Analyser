import React from 'react';
import { ArrowDown, ArrowRight, FileSearch, Waypoints } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CareerSignalHero({ activeChapter = 0 }) {
  return (
    <section className="career-hero" aria-labelledby="career-signal-title">
      <div className="landing-shell career-hero__layout">
        <div className="career-hero__copy">
          <p className="landing-eyebrow"><span /> KONEK Career Signal</p>
          <h1 id="career-signal-title">
            Biến hồ sơ thành <em>tín hiệu nghề nghiệp</em> rõ ràng.
          </h1>
          <p className="career-hero__lede">
            KONEK biến cấu trúc, kỹ năng và bằng chứng trong CV thành tín hiệu có thể đọc, đối chiếu và hành động.
          </p>
          <div className="career-hero__actions">
            <a className="landing-button landing-button--primary" href="#decode">
              Xem cách tín hiệu được giải mã
              <ArrowDown aria-hidden="true" />
            </a>
            <Link className="landing-button landing-button--secondary" to="/register">
              Bắt đầu với KONEK
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ul className="career-hero__principles" aria-label="Nguyên tắc phân tích">
            <li><FileSearch aria-hidden="true" /> Tài liệu là nguồn tín hiệu</li>
            <li><Waypoints aria-hidden="true" /> Từ CV đến đúng không gian làm việc</li>
          </ul>
        </div>
        <div className="career-hero__hud landing-glass" aria-hidden="true">
          <span className="career-hero__hud-dot" />
          <div><small>Tín hiệu đang xử lý</small><strong>{String(activeChapter + 1).padStart(2, '0')} / 05</strong></div>
        </div>
      </div>
      <a className="career-hero__scroll" href="#decode"><span /> Cuộn để giải mã</a>
    </section>
  );
}
