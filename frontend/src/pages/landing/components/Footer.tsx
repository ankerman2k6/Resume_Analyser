import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Vui lòng nhập địa chỉ email công việc hợp lệ.');
      return;
    }
    setError('');
    setSubscribed(true);
  };

  return (
    <footer className="bg-white dark:bg-[#060B12] border-t border-slate-200/80 dark:border-slate-800 pt-16 pb-28 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Nền tảng sàng lọc hồ sơ ứng viên & ATS AI-Powered cao cấp. Được thiết kế để nhận diện chiều sâu kỹ thuật thực chất mà không bị thiên kiến từ khóa hay kiệt sức sàng lọc.
            </p>
            <div className="pt-2">
              <form onSubmit={handleSubscribe} className="space-y-2">
                <span className="text-xs font-semibold text-[#051A24] dark:text-[#F8FAFC]">
                  Bản tin Kỹ thuật & Nhân tài (Hàng tháng)
                </span>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="truong.nhan.tai@congty.com"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] bg-slate-50/50 dark:bg-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#051A24] dark:bg-[#2563EB] text-white font-medium hover:bg-[#0D212C] dark:hover:bg-[#1D4ED8] transition-colors shrink-0 cursor-pointer"
                  >
                    {subscribed ? <Check className="w-4 h-4 text-emerald-400" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
                {subscribed && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Cảm ơn bạn. Bạn đã được thêm vào danh sách nhận bản tin nhân tài kỹ thuật chuyên sâu.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Links Col 1: Platform */}
          <div className="space-y-3">
            <div className="font-semibold text-[#051A24] uppercase tracking-wider text-[11px]">
              Kiến trúc Nền tảng
            </div>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-[#051A24] transition-colors">Bộ máy AST Ngữ nghĩa</a></li>
              <li><a href="#features" className="hover:text-[#051A24] transition-colors">Khử Thiên kiến Thuật toán</a></li>
              <li><a href="#features" className="hover:text-[#051A24] transition-colors">Câu hỏi Phỏng vấn Tự động</a></li>
              <li><a href="#case-studies" className="hover:text-[#051A24] transition-colors">Đồng bộ Greenhouse & Ashby</a></li>
              <li><a href="#pricing" className="hover:text-[#051A24] transition-colors">Cô lập Tenant trên VPC</a></li>
            </ul>
          </div>

          {/* Links Col 2: Compliance */}
          <div className="space-y-3">
            <div className="font-semibold text-[#051A24] uppercase tracking-wider text-[11px]">
              Tin cậy & Tuân thủ
            </div>
            <ul className="space-y-2">
              <li><span className="hover:text-[#051A24] cursor-pointer">Báo cáo SOC2 Type II</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">Kiểm toán Thuật toán EEOC</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">EU AI-Act Điều 14</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">Hiến chương Quyền riêng tư Ứng viên</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">Nguồn gốc Trọng số Mô hình</span></li>
            </ul>
          </div>

          {/* Links Col 3: Company */}
          <div className="space-y-3">
            <div className="font-semibold text-[#051A24] uppercase tracking-wider text-[11px]">
              Tổ chức
            </div>
            <ul className="space-y-2">
              <li><span className="hover:text-[#051A24] cursor-pointer">Về KONEK</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">Bài báo Nghiên cứu</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">Câu chuyện Khách hàng</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">Trạng thái Hệ thống</span></li>
              <li><span className="hover:text-[#051A24] cursor-pointer">Công bố Lỗ hổng Bảo mật</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>&copy; 2026</span>
            <Logo variant="light" size="sm" className="inline-block" />
            <span>Intelligence Technologies, Inc. Bảo lưu mọi quyền.</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-[#051A24] cursor-pointer">Điều khoản Dịch vụ</span>
            <span>·</span>
            <span className="hover:text-[#051A24] cursor-pointer">Chính sách Bảo mật</span>
            <span>·</span>
            <span className="hover:text-[#051A24] cursor-pointer">Công bố Thuật toán</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
