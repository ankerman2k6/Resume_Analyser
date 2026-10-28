import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, UploadCloud, CheckCircle, RefreshCw, FileCheck } from 'lucide-react';

interface InteractiveCTAProps {
  onOpenDemoModal: () => void;
}

export const InteractiveCTA: React.FC<InteractiveCTAProps> = ({ onOpenDemoModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  // Mouse trail particles state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{ x: number; y: number; size: number; alpha: number; vx: number; vy: number }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 400;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        // Spawn 2-3 trail particles
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            size: Math.random() * 3.5 + 2,
            alpha: 0.7,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
          });
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter((p) => p.alpha > 0.02);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.94;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha})`;
        ctx.shadowColor = '#2563EB';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handleSimulateScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanComplete(false);
    setScanStep(1);

    setTimeout(() => {
      setScanStep(2);
    }, 600);

    setTimeout(() => {
      setScanStep(3);
    }, 1200);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      // Trigger festive confetti on successful calibrated parse
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#2563EB', '#38BDF8', '#0D212C', '#60A5FA'],
      });
    }, 1800);
  };

  return (
    <section className="py-24 bg-white dark:bg-[#ffffff] relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div
          ref={containerRef}
          className="relative rounded-3xl bg-white dark:bg-[#0C1724] text-[#051A24] dark:text-[#F8FAFC] p-8 sm:p-14 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl transition-colors duration-300"
        >
          {/* Canvas for mouse-trail */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
          />

          {/* Content Layer */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 7 cols: Copy & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>TRẢI NGHIỆM TƯƠNG TÁC KONEK</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#051A24] dark:text-[#F8FAFC] leading-tight text-balance">
                Kiểm tra cỗ máy sàng lọc trước khi đầu tư bất kỳ chi phí nào.
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl text-balance">
                Di chuyển con trỏ chuột để trải nghiệm vệt hạt neural. Chạy thử nghiệm trực tiếp bên dưới để chứng kiến cách KONEK loại bỏ CV sáo rỗng và đánh giá chính xác năng lực kỹ thuật thực chất.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={onOpenDemoModal}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#051A24] dark:bg-[#2563EB] hover:bg-[#0D212C] dark:hover:bg-[#1D4ED8] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Đặt Lịch Hiệu chỉnh Riêng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#051A24] dark:text-[#F8FAFC] border border-slate-200 dark:border-slate-700 font-semibold text-sm transition-all shadow-xs hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-[#2563EB] ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Đang phân tích cú pháp...' : 'Chạy Thử Sàng lọc Trực tiếp'}</span>
                </button>
              </div>
            </div>

            {/* Right 5 cols: Interactive Dropzone / Scan Inspector */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-md text-[#051A24] dark:text-[#F8FAFC]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>BỘ MÔ PHỎNG ĐO LƯỜNG TỪ XA</span>
                  <span className="text-emerald-500 font-bold">TRẠNG THÁI: SẴN SÀNG</span>
                </div>

                {/* Simulated file state */}
                <div className="my-5 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-[#2563EB] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#051A24] truncate">
                      sample_staff_engineer_dossier.pdf
                    </div>
                    <div className="text-[11px] text-slate-500">
                      4 Trang · 8 GitHub Repo · Go & C++
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${scanStep >= 1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={scanStep >= 1 ? 'text-[#051A24] font-medium' : 'text-slate-400'}>
                      1. Phân tích cây cú pháp trừu tượng (AST) từ commit của repo
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${scanStep >= 2 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={scanStep >= 2 ? 'text-[#051A24] font-medium' : 'text-slate-400'}>
                      2. Ẩn danh thông tin nhân khẩu học & trường lớp đào tạo
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${scanStep >= 3 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={scanStep >= 3 ? 'text-[#051A24] font-medium' : 'text-slate-400'}>
                      3. Đo chuẩn dựa trên 4.2M hồ sơ ứng viên đối chứng
                    </span>
                  </div>
                </div>

                {/* Outcome Display */}
                {scanComplete && (
                  <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Điểm Hiệu chỉnh: <strong className="text-[#051A24] font-mono text-sm">96/100 (Tuyển dụng Ngay)</strong></span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">0.14s</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
