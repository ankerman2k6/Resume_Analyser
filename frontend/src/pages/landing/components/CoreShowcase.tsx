import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  GitBranch,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Terminal,
  ArrowRight,
  Sparkles,
  Sliders,
  TrendingUp,
  Clock,
  DollarSign,
  UserCheck,
  Check,
  Activity
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  blindName: string;
  score: number;
  verdict: 'Tuyển dụng Ngay' | 'Phù hợp đã Hiệu chỉnh' | 'Nhồi Từ khóa Bề mặt';
  verdictType: 'hire' | 'calibrated' | 'warning';
  summary: string;
  strengths: string[];
  flags: string[];
  interviewProbe: string;
  codeDepth: number;
  systemScale: number;
  problemSolving: number;
  repoTruth: string;
}

const CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Alex Chen',
    role: 'Principal Systems Engineer',
    blindName: 'Ứng viên Alpha-09',
    score: 97,
    verdict: 'Tuyển dụng Ngay',
    verdictType: 'hire',
    summary: 'Xây dựng tầng đồng thuận phân tán xử lý 2.4M lượt ghi/giây. Thấu hiểu sâu sắc giao thức Raft, zero-allocation Go routines và bộ nhớ đệm LSM engine.',
    strengths: ['Bản chất giao thức đồng thuận Raft & Paxos', 'Mạng kernel bypass (eBPF)', 'Xử lý sự cố đa vùng trên production'],
    flags: ['Ít kinh nghiệm với Rust (chủ yếu chuyên sâu Go/C++)'],
    interviewProbe: 'Yêu cầu ứng viên thiết kế chiến lược phục hồi lỗi bầu chọn leader trong điều kiện phân vùng mạng Byzantine.',
    codeDepth: 98,
    systemScale: 96,
    problemSolving: 95,
    repoTruth: 'Verified: 480+ commits trong repo distributed consensus engine lõi.',
  },
  {
    id: 'cand-2',
    name: 'Marcus Vance',
    role: 'Staff Infrastructure Lead',
    blindName: 'Ứng viên Beta-44',
    score: 58,
    verdict: 'Nhồi Từ khóa Bề mặt',
    verdictType: 'warning',
    summary: 'CV khớp 19/20 từ khóa tuyển dụng, nhưng đối chiếu ngữ nghĩa phát hiện mức độ tham gia bề mặt: đóng góp chủ yếu là chỉnh sửa config yaml thay vì kiến trúc lõi.',
    strengths: ['Quen thuộc các công cụ AWS phổ biến', 'Thâm niên trong môi trường doanh nghiệp'],
    flags: ['Phát hiện nhồi từ khóa: ghi kinh nghiệm Raft nhưng commit thực tế chỉ là tinh chỉnh helm chart', 'Mức độ sở hữu code trong dịch vụ lõi dưới 12%'],
    interviewProbe: 'Đào sâu vào các nguyên hàm đồng thời (concurrency primitives) cụ thể được sử dụng trong bộ nhớ đệm phân tán.',
    codeDepth: 42,
    systemScale: 52,
    problemSolving: 60,
    repoTruth: 'Alert: Khớp 95% từ khóa nhưng chỉ sở hữu 12% code kiến trúc.',
  },
  {
    id: 'cand-3',
    name: 'Dr. Priya Nair',
    role: 'Founding ML / GPU Systems Architect',
    blindName: 'Ứng viên Gamma-21',
    score: 94,
    verdict: 'Phù hợp đã Hiệu chỉnh',
    verdictType: 'calibrated',
    summary: 'Lộ trình phát triển phi truyền thống. Năng lực thuật toán vượt trội được chứng minh qua các bài báo OSS về phân mảnh tensor tiết kiệm bộ nhớ và cụm GPU.',
    strengths: ['Tối ưu hóa custom CUDA kernel', 'Xử lý song song mô hình dạng pipeline', 'Không bị trừ điểm thiên kiến trường lớp'],
    flags: ['Cần hỗ trợ chi phí relocation linh hoạt'],
    interviewProbe: 'Phỏng vấn về tối ưu hóa layout bộ nhớ flash-attention trong các mô hình GPU băng thông thấp.',
    codeDepth: 96,
    systemScale: 92,
    problemSolving: 95,
    repoTruth: 'Verified: Tác giả chính của thư viện tối ưu hóa CUDA kernel mã nguồn mở.',
  },
];

export const CoreShowcase: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>(CANDIDATES[0]);
  const [blindMode, setBlindMode] = useState(true);
  const [resumeVolume, setResumeVolume] = useState<number>(600);

  // Dynamic calculations for Bento 4 (ROI & Time savings)
  const manualHours = Math.round(resumeVolume * 0.22);
  const konekHours = Math.round((resumeVolume * 0.004) * 10) / 10;
  const dollarsSaved = Math.round(manualHours * 32);

  return (
    <section id="features" className="py-24 bg-[#F8FAFC] dark:bg-[#070E18] border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>KIẾN TRÚC BENTO // NĂNG LỰC CỐT LÕI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#051A24] dark:text-[#F8FAFC] text-balance">
            Hệ điều hành Tuyển dụng Kỹ thuật Thế hệ mới.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-balance">
            Thay thế hoàn toàn phỏng đoán từ khóa bằng đối chiếu ngữ cảnh mã nguồn sâu. KONEK bóc tách tư duy kỹ thuật, bảo vệ tính công bằng và giải phóng hàng trăm giờ đọc CV mệt mỏi.
          </p>
        </div>

        {/* BENTO GRID CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* BENTO 1: HERO SANDBOX (Cols 2 on Desktop) */}
          <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300">
            {/* Header of Sandbox */}
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <div className="text-xs font-mono font-semibold text-[#2563EB] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>SANDBOX SÀNG LỌC TRỰC QUAN THEO NGỮ CẢNH</span>
                </div>
                <h3 className="text-xl font-bold text-[#051A24] dark:text-[#F8FAFC]">
                  Đối chiếu Chiều sâu Kỹ thuật vs Từ khóa Bề mặt
                </h3>
              </div>

              {/* Candidate Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl">
                {CANDIDATES.map((cand, idx) => (
                  <button
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCandidate.id === cand.id
                        ? 'bg-white dark:bg-[#2563EB] text-[#051A24] dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Ứng viên #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Analysis Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 dark:bg-[#2563EB]/25 text-[#2563EB] flex items-center justify-center font-bold text-lg">
                    {blindMode ? '?' : selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#051A24] dark:text-[#F8FAFC] text-lg">
                      {blindMode ? selectedCandidate.blindName : selectedCandidate.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {selectedCandidate.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      selectedCandidate.verdictType === 'hire'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : selectedCandidate.verdictType === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {selectedCandidate.verdict}
                  </span>

                  <div className="px-3.5 py-1.5 rounded-full bg-[#051A24] dark:bg-slate-800 text-white font-mono text-xs font-bold">
                    {selectedCandidate.score}/100 PTS
                  </div>
                </div>
              </div>

              {/* 3 Metric Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80">
                  <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold mb-1">
                    Chiều sâu Code (Code Depth)
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-[#051A24] dark:text-[#F8FAFC] mb-2">
                    <span>Kiến trúc hệ thống</span>
                    <span className="text-[#2563EB]">{selectedCandidate.codeDepth}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedCandidate.codeDepth}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80">
                  <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold mb-1">
                    Quy mô Chịu tải (System Scale)
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-[#051A24] dark:text-[#F8FAFC] mb-2">
                    <span>Throughput / Concurrency</span>
                    <span className="text-[#2563EB]">{selectedCandidate.systemScale}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedCandidate.systemScale}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80">
                  <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold mb-1">
                    Tư duy Thuật toán
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-[#051A24] dark:text-[#F8FAFC] mb-2">
                    <span>Problem Solving</span>
                    <span className="text-[#2563EB]">{selectedCandidate.problemSolving}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedCandidate.problemSolving}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Verified Truth vs Keyword Surface */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed border border-slate-800">
                <div className="text-[#38BDF8] font-bold mb-1.5 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>KONEK SEMANTIC SYNTHESIS LOG:</span>
                </div>
                <p className="text-slate-300 font-sans text-xs sm:text-sm">
                  {selectedCandidate.summary}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-emerald-400">
                  {selectedCandidate.repoTruth}
                </div>
              </div>

              {/* Auto Generated Interview Probe */}
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-xs sm:text-sm">
                <span className="font-bold text-[#2563EB] dark:text-[#60A5FA] block mb-1">
                  Đề xuất câu hỏi thử thách phỏng vấn (Auto Interview Probe):
                </span>
                <span className="text-slate-700 dark:text-slate-300 italic">
                  "{selectedCandidate.interviewProbe}"
                </span>
              </div>
            </div>
          </div>

          {/* BENTO 2: BLIND SCREENING MATRIX (Col 1 on Desktop) */}
          <div className="rounded-3xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                TRỤ CỘT CÔNG BẰNG
              </div>
              <h3 className="text-xl font-bold text-[#051A24] dark:text-[#F8FAFC] mb-3">
                Tuyển dụng Ẩn danh (Blind Screening)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Chống thiên kiến tiềm thức bằng cách che giấu danh tính, trường học và thông tin nhân khẩu học. Đảm bảo đánh giá 100% dựa trên năng lực giải quyết vấn đề thực tế.
              </p>

              {/* Interactive Toggle Control */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  {blindMode ? (
                    <EyeOff className="w-4 h-4 text-[#2563EB]" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="text-xs font-semibold text-[#051A24] dark:text-[#F8FAFC]">
                    {blindMode ? 'Chế độ Ẩn danh: ĐANG BẬT' : 'Chế độ Ẩn danh: ĐÃ TẮT'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBlindMode(!blindMode)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    blindMode ? 'bg-[#2563EB] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                  aria-label="Toggle Blind Mode"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                </button>
              </div>

              {/* Redacted Preview simulation */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 font-mono text-xs space-y-2 border border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Danh tính ứng viên:</span>
                  <span className={`font-semibold ${blindMode ? 'bg-slate-300 dark:bg-slate-700 text-transparent select-none rounded px-2' : 'text-[#051A24] dark:text-[#F8FAFC]'}`}>
                    {blindMode ? '████████████' : selectedCandidate.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bằng cấp / Trường:</span>
                  <span className={`font-semibold ${blindMode ? 'bg-slate-300 dark:bg-slate-700 text-transparent select-none rounded px-2' : 'text-[#051A24] dark:text-[#F8FAFC]'}`}>
                    {blindMode ? '████████████' : 'Top Tier CS Dept'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Chỉ số Năng lực:</span>
                  <span className="text-emerald-500 font-bold">
                    {selectedCandidate.score}/100 (Bảo toàn)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-4">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Tuân thủ tiêu chuẩn EEOC & EU AI-Act</span>
            </div>
          </div>

          {/* BENTO 3: KEYWORD STUFFING AUDIT (Col 1 on Desktop) */}
          <div className="rounded-3xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                CHỐNG GIAN LẬN AI
              </div>
              <h3 className="text-xl font-bold text-[#051A24] dark:text-[#F8FAFC] mb-3">
                Thanh tra Nhồi Từ khóa & AI Hallucination
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Các ứng viên dùng AI viết CV thường chèn hàng chục thuật toán cao cấp. KONEK đối chiếu lịch sử commit thực tế để phát hiện khoảng cách giữa từ ngữ và năng lực code.
              </p>

              {/* Code comparison mockup */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Đoạn CV tự xưng:</span>
                  <span className="text-amber-600 font-mono font-semibold">Chém gió</span>
                </div>
                <div className="text-xs font-mono bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  "Chuyên gia tối ưu cụm Kubernetes quy mô lớn & kiến trúc microservices"
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-slate-500">Thực tế đối chiếu Git:</span>
                  <span className="text-emerald-500 font-mono font-semibold">Xác minh</span>
                </div>
                <div className="text-xs font-mono bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                  Commit chủ yếu sửa port và ingress helm chart (chỉ số code lõi: 14%)
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono text-[#2563EB] flex items-center justify-between mt-4">
              <span>Độ tin cậy ngữ nghĩa:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">99.2% ACCURACY</span>
            </div>
          </div>

          {/* BENTO 4: INTERACTIVE EFFICIENCY & ROI SIMULATOR (Cols 2 on Desktop) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#051A24] dark:bg-[#0A131F] text-white p-6 sm:p-8 flex flex-col justify-between shadow-2xl border border-slate-800 relative overflow-hidden">
            {/* Background ambient decorative glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/20 text-[#38BDF8] text-xs font-mono font-semibold tracking-wider uppercase">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>MÔ PHỎNG HIỆU SUẤT VẬN HÀNH THỰC TẾ</span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  DỰA TRÊN DỮ LIỆU PIPELINE 40+ DOANH NGHIỆP
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Bộ tính toán Tiết kiệm Chi phí & Thời gian Sàng lọc
              </h3>
              <p className="text-slate-300 text-sm max-w-xl mb-8 leading-relaxed">
                Kéo thanh trượt để xem KONEK giải phóng bao nhiêu giờ làm việc cho đội ngũ kỹ sư và nhà tuyển dụng của bạn mỗi tháng:
              </p>

              {/* Slider Control */}
              <div className="space-y-3 mb-8 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-300">Quy mô hồ sơ CV tiếp nhận / tháng:</span>
                  <span className="text-xl font-mono text-[#38BDF8] font-bold">
                    {resumeVolume.toLocaleString()} CV
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={resumeVolume}
                  onChange={(e) => setResumeVolume(Number(e.target.value))}
                  className="w-full accent-[#2563EB] cursor-pointer h-2 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>100 CV (Startup)</span>
                  <span>1,500 CV (Mid-Market)</span>
                  <span>3,000+ CV (Enterprise)</span>
                </div>
              </div>

              {/* 3 Metric Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock className="w-4 h-4 text-[#38BDF8]" />
                    <span>Thời gian sàng lọc:</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {konekHours} giờ
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-through">
                    Thủ công: {manualHours} giờ
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Chi phí kỹ sư tiết kiệm:</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    ~${dollarsSaved.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Mỗi tháng cho bộ phận Tech
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <TrendingUp className="w-4 h-4 text-[#60A5FA]" />
                    <span>Rút ngắn Time-to-Hire:</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    -78% ngày
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Từ 28 ngày xuống ~6 ngày
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Sẵn sàng giải phóng năng lực tuyển dụng kỹ thuật của doanh nghiệp bạn?
              </span>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#38BDF8] hover:text-white transition-colors"
              >
                <span>Xem các gói giải pháp doanh nghiệp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CoreShowcase;
