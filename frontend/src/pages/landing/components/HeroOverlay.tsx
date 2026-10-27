import React from 'react';
import { ArrowRight, Play, Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';
import { Logo } from './Logo';

interface HeroOverlayProps {
  onOpenDemoModal: () => void;
  onScrollToDemo: () => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  onOpenDemoModal,
  onScrollToDemo,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 px-6 sm:px-12 py-10">
      {/* Top spacer so header content has breathing room */}
      <div className="h-16" />

      {/* Center Hero Content */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center my-auto">
        {/* Technical Protocol Status Kicker */}
        <div className="pointer-events-auto inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mb-6 shadow-xs hover:border-[#2563EB]/40 transition-colors">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="tracking-wider uppercase text-[11px] text-[#2563EB] font-bold">KONEK</span>
        </div>

        {/* Main Heading with High Craft Typography */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#051A24] dark:text-[#F8FAFC] max-w-4xl leading-[1.08] mb-6 text-balance">
          Thấu hiểu chiều sâu năng lực.{' '}
          <span className="text-[#2563EB] font-extrabold inline-block">Chuẩn xác đến từng kỹ năng.</span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mb-8 text-balance">
          Thay thế bộ lọc từ khóa thô sơ bằng trí tuệ nhân tạo đối chiếu chiều sâu mã nguồn thực tế. Đo lường cấu trúc tư duy, loại trừ 100% nhồi từ khóa và bảo vệ tính công bằng với tuyển dụng ẩn danh.
        </p>

        {/* 2 CTA Buttons */}
        <div className="pointer-events-auto flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onScrollToDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-semibold text-white bg-[#051A24] dark:bg-[#2563EB] hover:bg-[#0D212C] dark:hover:bg-[#1D4ED8] rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] group whitespace-nowrap cursor-pointer"
          >
            <span>Trải nghiệm Sandbox Sàng lọc</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Xác thực SOC2 Type II</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#2563EB]" />
            <span>Phân tích tốc độ cao</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>Triệt tiêu hoàn toàn Keyword Hallucination</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroOverlay;
