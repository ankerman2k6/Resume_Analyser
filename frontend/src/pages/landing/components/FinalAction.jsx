import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FinalAction() {
  return (
    <section className="final-action" aria-labelledby="final-action-title">
      <div className="landing-shell">
        <div className="final-action__panel">
          <div>
            <p className="landing-eyebrow landing-eyebrow--inverse"><span /> Tín hiệu tiếp theo là của bạn</p>
            <h2 id="final-action-title">Bắt đầu từ đúng không gian KONEK.</h2>
            <p>Chọn vai trò của bạn để tiếp tục vào sản phẩm.</p>
          </div>
          <div className="final-action__buttons">
            <Link to="/register" className="landing-button landing-button--light">
              Tạo tài khoản
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/login" className="landing-button landing-button--outline-light">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
