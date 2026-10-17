import React from 'react';
import { Shield, Zap, Sparkles, Building2, CheckCircle2, TrendingUp } from 'lucide-react';

const LOGO_PARTNERS = [
  { name: 'Linear', domain: 'Vận hành Kỹ thuật' },
  { name: 'Vercel', domain: 'Hạ tầng Frontend' },
  { name: 'Ramp', domain: 'Tài chính Doanh nghiệp' },
  { name: 'Stripe', domain: 'Kiến trúc Thanh toán' },
  { name: 'Scale AI', domain: 'Đánh giá Mô hình AI' },
  { name: 'Figma', domain: 'Hệ thống Sản phẩm' },
  { name: 'Supabase', domain: 'Cơ sở dữ liệu Phân tán' },
  { name: 'Retool', domain: 'Phần mềm Nội bộ' },
  { name: 'Notion', domain: 'Đồ thị Tri thức' },
  { name: 'Datadog', domain: 'Giám sát Đám mây' },
];

export const Marquee: React.FC = () => {
  return (
    <section className="border-y border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070D17] py-10 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 dark:text-slate-400 font-mono">
            ĐƯỢC TIN CẬY BỞI CÁC NHÀ LÃNH ĐẠO KỸ THUẬT & NHÂN TÀI
          </p>
          <p className="text-sm text-[#051A24] dark:text-[#F8FAFC] font-medium mt-0.5">
            Hiệu chỉnh Pipeline tuyển dụng tốc độ cao tại các công ty công nghệ Tier-1
          </p>
        </div>

        {/* Quantified claim strip */}
        <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-semibold text-[#051A24] dark:text-[#F8FAFC] tabular-nums">4.2M+</span>
            <span className="text-slate-500">Hồ sơ đã Sàng lọc</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-[#051A24] dark:text-[#F8FAFC] tabular-nums">99.4%</span>
            <span className="text-slate-500">Độ chính xác Cú pháp</span>
          </div>
        </div>
      </div>

      {/* Infinite Scrolling Track */}
      <div className="relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex items-center gap-12 py-2">
          {/* Duplicate list 3 times for seamless infinite loop */}
          {[...LOGO_PARTNERS, ...LOGO_PARTNERS, ...LOGO_PARTNERS].map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-2xs shrink-0 hover:border-[#2563EB]/40 transition-colors cursor-default"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0D212C] dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {partner.name[0]}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-[#051A24] dark:text-[#F8FAFC] leading-tight tracking-tight">
                  {partner.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {partner.domain}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
