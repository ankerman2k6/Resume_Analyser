import React from 'react';
import { Quote, Sparkles, Building2, Check } from 'lucide-react';

export const EditorialQuote: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-white border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
      {/* Subtle background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          {/* Main Editorial Block */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              <Quote className="w-4 h-4 fill-[#2563EB]" />
              <span>Báo cáo Thực địa Biên tập · Mở rộng Series C</span>
            </div>

            <blockquote className="font-serif-instrument text-2xl sm:text-3xl md:text-4xl text-[#051A24] dark:text-[#000000] leading-snug tracking-tight text-balance">
              &ldquo;Công cụ tìm kiếm từ khóa ATS truyền thống từng loại bỏ những kỹ sư hệ thống tiềm năng nhất của chúng tôi chỉ vì họ không nhồi nhét thuật ngữ chuyên môn vào CV. KONEK đã đánh giá những đóng góp mã nguồn thực tế, kiến trúc hệ thống và độ phức tạp bài toán. Chúng tôi đã tuyển đủ bốn vị trí Staff Engineer chỉ trong ba tuần.&rdquo;
            </blockquote>

            <div className="pt-2 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0D212C] text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-slate-100 dark:ring-slate-800">
                ER
              </div>
              <div>
                <div className="text-base font-semibold text-[#051A24] dark:text-[#F8FAFC]">
                  Elena Rostova
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Trưởng bộ phận Nhân tài Kỹ thuật & Vận hành Con người · ScaleForge Technologies
                </div>
              </div>
            </div>
          </div>

          {/* Adjoining Concrete Outcome Card */}
          <div className="w-full lg:w-72 shrink-0 p-6 rounded-2xl bg-[#0D212C] text-white border border-slate-800 shadow-xl space-y-5">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Biến thiên Pipeline đã Kiểm chứng
            </div>

            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
                  -84%
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Giảm giờ sàng lọc ứng viên đầu phễu của nhà tuyển dụng
                </div>
              </div>

              <div className="border-b border-slate-800 pb-3">
                <div className="text-3xl font-bold font-mono tracking-tight text-sky-400 tabular-nums">
                  3.8x
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Tỷ lệ chuyển đổi từ phỏng vấn onsite thành thư mời nhận việc
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
                  0%
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Độ lệch điểm số nhân khẩu học (đã khử thiên kiến)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
