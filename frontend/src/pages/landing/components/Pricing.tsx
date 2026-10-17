import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Sparkles, HelpCircle } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (planName: string, billing: 'monthly' | 'annual') => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-[#F8FAFC] dark:bg-[#070E18] border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="text-xs uppercase font-semibold tracking-wider text-[#2563EB] mb-2 font-mono">
            BẢNG GIÁ NỀN TẢNG MINH BẠCH
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#051A24] dark:text-[#F8FAFC] text-balance">
            Bảng giá rõ ràng được thiết kế cho quy mô kỹ thuật.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 text-balance">
            Không tính phí phạt theo từng tài khoản. Mở rộng quy mô phân loại ứng viên dựa trên lưu lượng sàng lọc thực tế.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                !isAnnual
                  ? 'bg-white dark:bg-[#2563EB] text-[#051A24] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#051A24] dark:hover:text-white'
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isAnnual
                  ? 'bg-white dark:bg-[#2563EB] text-[#051A24] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#051A24] dark:hover:text-white'
              }`}
            >
              <span>Hàng năm</span>
              <span className="text-[10px] font-bold text-[#2563EB] dark:text-white bg-blue-50 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>

        {/* 2-Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plan 1: Growth */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Quy mô Tăng trưởng
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đội ngũ công nghệ tăng trưởng nhanh</span>
              </div>

              <h3 className="text-2xl font-bold text-[#051A24] dark:text-[#F8FAFC] mb-2">Gói Tăng trưởng</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Bộ máy phân loại ATS ngữ nghĩa toàn diện cho các đội ngũ tuyển dụng 10–50 vị trí kỹ thuật mỗi quý.
              </p>

              <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-[#051A24] dark:text-[#F8FAFC] tabular-nums">
                  đ{isAnnual ? '390,000' : '490,000'}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  / tháng {isAnnual && '(thanh toán hàng năm)'}
                </span>
              </div>

              <div className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Lên đến 1.500 lượt sàng lọc hồ sơ ứng viên / tháng</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Phân tích cú pháp AST code & xác thực mã nguồn repository</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Công cụ khử thiên kiến thuật toán đã hiệu chỉnh (chứng nhận EEOC)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Tự động tạo câu hỏi thử thách kỹ thuật cho phỏng vấn</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Tích hợp hai chiều với Greenhouse, Lever, Ashby & Slack</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Cam kết SLA thời gian hoạt động 99.9% và hỗ trợ qua email</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('Gói Tăng trưởng', isAnnual ? 'annual' : 'monthly')}
              className="w-full py-3.5 px-6 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#051A24] dark:text-white font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              Bắt đầu 14 Ngày Thử nghiệm Miễn phí
            </button>
          </div>

          {/* Plan 2: Enterprise (Solid Navy #051A24) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#051A24] text-white border border-slate-800 shadow-xl relative flex flex-col justify-between">
            {/* Subtle top badge */}
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#2563EB] text-white">
                Khuyên dùng
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                  Quy mô Toàn cầu
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Doanh nghiệp Chuyên dụng</h3>
              <p className="text-sm text-slate-300 mb-6">
                Hạ tầng chuyên dụng, tinh chỉnh mô hình theo yêu cầu và cô lập dữ liệu trên VPC riêng biệt.
              </p>

              <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-slate-800">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-white tabular-nums">
                  đ{isAnnual ? '1,190,000' : '1,490,000'}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">
                  / tháng {isAnnual && '(thanh toán hàng năm)'}
                </span>
              </div>

              <div className="space-y-3.5 mb-8 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Không giới hạn số lượng đánh giá hồ sơ và quyền truy cập lưu trữ</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Mô hình hiệu chỉnh riêng dựa trên nhân sự xuất sắc nhất của bạn</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Tùy chọn triển khai VPC nội bộ hoặc hạ tầng On-premise</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Đường ống Webhook tùy chỉnh và tích hợp Workday, SAP SuccessFactors</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Chuyên gia Giải pháp Nhân tài Kỹ thuật riêng & SLA phản hồi 1 giờ</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Toàn bộ lịch sử kiểm toán thuật toán & chứng nhận tuân thủ EEOC</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('Doanh nghiệp Chuyên dụng', isAnnual ? 'annual' : 'monthly')}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Yêu cầu Bản thử nghiệm Doanh nghiệp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
