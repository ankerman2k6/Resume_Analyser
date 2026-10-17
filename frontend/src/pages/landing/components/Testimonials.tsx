import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Building, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  metricLabel: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Sarah Jenkins',
    role: 'VP of Engineering',
    company: 'CloudNode Infrastructure',
    quote: 'Chúng tôi sàng lọc 1.400 hồ sơ backend mỗi tháng. KONEK đã rút ngắn chu kỳ phân loại ứng viên từ 12 ngày xuống còn 38 giờ, đồng thời phát hiện những kỹ sư hệ thống phi truyền thống với hiệu suất vượt trội hơn tất cả các nhân sự trước đây.',
    metric: '12 ngày → 38h',
    metricLabel: 'Thời gian hoàn thành sàng lọc',
  },
  {
    id: 't-2',
    name: 'David Kasparov',
    role: 'Chief Talent Officer',
    company: 'Apex Quantitative',
    quote: 'Các Hiring Manager của chúng tôi từng rất hoài nghi về sàng lọc thuật toán vì các công cụ từ khóa ATS cũ hoạt động rất kém. KONEK đã thay đổi hoàn toàn quan điểm đó: hệ thống nhận diện quyền sở hữu codebase AST thực chất thay vì các từ khóa rỗng.',
    metric: 'Nhanh hơn 92%',
    metricLabel: 'Đánh giá của Hiring Manager',
  },
  {
    id: 't-3',
    name: 'Maya Lin',
    role: 'Head of People Operations',
    company: 'Orbit Distributed Labs',
    quote: 'Tính năng khử thiên kiến thuật toán thực sự xuất sắc. Nó đã ẩn danh các định kiến về danh tiếng, và chúng tôi đã tuyển được kiến trúc sư hệ thống phân tán cốt lõi từ một nền tảng tự học, người hiện đang dẫn dắt cụm Raft trung tâm của chúng tôi.',
    metric: '+180%',
    metricLabel: 'Đa dạng hóa ứng viên chất lượng',
  },
  {
    id: 't-4',
    name: 'Julian Ross',
    role: 'Co-Founder & CTO',
    company: 'HyperScale AI',
    quote: 'Điểm NPS của ứng viên đã tăng 42 điểm. Thay vì phải chờ đợi 2 tuần trong hố đen ATS, các ứng viên hàng đầu nhận được phản hồi ngữ cảnh và lời mời phỏng vấn kỹ thuật trong chưa đầy 24 giờ.',
    metric: '+42 NPS',
    metricLabel: 'Mức độ hài lòng của ứng viên',
  },
];

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll every 5.5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section id="case-studies" className="py-24 bg-[#F8FAFC] dark:bg-[#ffffff] border-b border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-[#2563EB] mb-2 font-mono">
              CHỨNG THỰC THỰC TẾ TỪ CÁC ĐỘI NGŨ KỸ THUẬT
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#000000] dark:text-[#000000
            ]">
              Các nhà lãnh đạo nhân tài nói gì
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#051A24] dark:hover:text-white hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#051A24] dark:hover:text-white hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container with Pause-on-Hover */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((item, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`p-6 rounded-2xl bg-white dark:bg-[#0C1724] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-[#2563EB] shadow-lg ring-2 ring-[#2563EB]/15 -translate-y-1'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Metric Highlight */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="font-mono text-2xl font-bold text-[#051A24] dark:text-[#F8FAFC] tabular-nums">
                        {item.metric}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.metricLabel}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="font-semibold text-sm text-[#051A24] dark:text-[#F8FAFC]">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.role}
                    </div>
                    <div className="text-xs text-[#2563EB] font-medium mt-0.5">
                      {item.company}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Jump to testimonial ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-[#2563EB]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
