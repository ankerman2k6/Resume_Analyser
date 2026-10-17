import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'General Calibration Session',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    volume: '500-2,000 resumes/month',
    ats: 'Greenhouse',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('Tomorrow, 2:00 PM EST');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#0D212C', '#38BDF8'],
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-[#051A24]">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB]">
              Phiên Trao đổi Riêng tư KONEK
            </div>
            <h3 className="text-lg font-bold text-[#051A24]">
              {initialPlan.includes('Tăng trưởng') || initialPlan.includes('Chuyên dụng') || initialPlan.includes('Tier') || initialPlan.includes('Enterprise')
                ? `Kích hoạt ${initialPlan}`
                : 'Đặt Demo Tương tác'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form or Success State */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Họ và Tên</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Elena Rostova"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#051A24] focus:outline-none focus:border-[#2563EB] bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Công việc</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="elena@scaleforge.io"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#051A24] focus:outline-none focus:border-[#2563EB] bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Công ty</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="ScaleForge"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#051A24] focus:outline-none focus:border-[#2563EB] bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">ATS Hiện tại</label>
                <select
                  value={formData.ats}
                  onChange={(e) => setFormData({ ...formData, ats: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#051A24] focus:outline-none focus:border-[#2563EB] bg-slate-50/50"
                >
                  <option value="Greenhouse">Greenhouse</option>
                  <option value="Ashby">Ashby</option>
                  <option value="Lever">Lever</option>
                  <option value="Workday">Workday</option>
                  <option value="Other">Khác / Tự phát triển</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Khung giờ còn trống</label>
              <div className="grid grid-cols-2 gap-2">
                {['Ngày mai, 14:00 (GMT+7)', 'Thứ Năm, 10:00 (GMT+7)', 'Thứ Năm, 15:30 (GMT+7)', 'Thứ Sáu, 14:00 (GMT+7)'].map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 rounded-lg text-[11px] font-medium border text-left transition-all ${
                      selectedSlot === slot
                        ? 'bg-blue-50/80 border-[#2563EB] text-[#2563EB] font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#051A24] hover:bg-[#0D212C] text-white font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang kết nối phòng họp...</span>
                ) : (
                  <>
                    <span>Xác nhận Đặt lịch Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Không ràng buộc · Bảo mật theo thỏa thuận NDA doanh nghiệp</span>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-[#051A24]">
              Lịch hẹn đã được Xác nhận
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Chúng tôi đã giữ chỗ khung giờ <strong className="text-[#051A24]">{selectedSlot}</strong> cho {formData.name || 'bạn'} tại {formData.company || 'doanh nghiệp'}. Thư mời Google Meet kèm thông tin tài khoản dùng thử sandbox đã được gửi tới email của bạn.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#051A24] text-white text-xs font-semibold hover:bg-[#0D212C] transition-colors"
              >
                Quay lại Trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
