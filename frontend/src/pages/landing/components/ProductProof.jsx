import React from 'react';
import { CheckCircle2, FileText, PanelLeft, Search, ShieldCheck } from 'lucide-react';

const SIGNAL_ROWS = [
  ['Cấu trúc hồ sơ', 'Đã nhận diện', 'ready'],
  ['Ngữ cảnh kỹ năng', 'Đang xem xét', 'review'],
  ['Yêu cầu vai trò', 'Đã liên kết', 'ready'],
  ['Thông tin cần bổ sung', 'Cần làm rõ', 'attention'],
];

export function ProductProof() {
  return (
    <section id="proof" className="product-proof" aria-labelledby="product-proof-title">
      <div className="landing-shell">
        <div className="landing-section-heading product-proof__heading">
          <div>
            <p className="landing-eyebrow"><span /> Từ câu chuyện đến giao diện</p>
            <h2 id="product-proof-title">Tín hiệu được trình bày như một công cụ làm việc.</h2>
          </div>
          <p>
            Bản xem trước tập trung vào thứ người dùng cần đọc: nguồn dữ liệu, trạng thái phân tích, điểm cần chú ý và hành động tiếp theo.
          </p>
        </div>

        <div className="product-window" aria-label="Bản xem trước giao diện phân tích KONEK">
          <div className="product-window__topbar">
            <div className="product-window__traffic" aria-hidden="true"><span /><span /><span /></div>
            <span>Bản xem trước giao diện</span>
            <div className="product-window__search"><Search aria-hidden="true" /> Tìm trong hồ sơ</div>
          </div>
          <div className="product-window__body">
            <aside className="product-window__sidebar" aria-label="Các vùng phân tích">
              <strong><PanelLeft aria-hidden="true" /> Career Signal</strong>
              <span className="is-active">Tổng quan</span>
              <span>Cấu trúc CV</span>
              <span>Kỹ năng</span>
              <span>Đối chiếu vai trò</span>
              <span>Gợi ý</span>
            </aside>
            <div className="product-window__content">
              <header>
                <div>
                  <span className="product-window__kicker">Hồ sơ mẫu</span>
                  <h3>Tổng quan tín hiệu nghề nghiệp</h3>
                </div>
                <span className="product-window__status"><CheckCircle2 aria-hidden="true" /> Sẵn sàng xem</span>
              </header>
              <div className="product-window__grid">
                <div className="product-window__document">
                  <div className="product-window__document-title"><FileText aria-hidden="true" /><span>Tài liệu nguồn</span></div>
                  <div className="product-window__document-lines" aria-hidden="true">
                    <i /><i /><i /><i /><i /><i />
                  </div>
                  <div className="product-window__document-note">Các vùng nội dung giữ liên kết với tài liệu ban đầu.</div>
                </div>
                <div className="product-window__signals">
                  {SIGNAL_ROWS.map(([label, status, tone]) => (
                    <div key={label} className="product-window__signal-row">
                      <div><span className={`signal-dot signal-dot--${tone}`} />{label}</div>
                      <strong>{status}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="product-window__notice">
                <ShieldCheck aria-hidden="true" />
                <div>
                  <strong>Kết quả luôn đi kèm ngữ cảnh.</strong>
                  <span>Người dùng có thể quay lại vùng nội dung liên quan trước khi hành động.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
