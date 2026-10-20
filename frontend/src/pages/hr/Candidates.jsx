import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  FileText,
  Download,
  Filter,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Briefcase,
  ExternalLink,
  Check,
  Sparkles,
  UserCheck
} from 'lucide-react';

// 5 ứng viên mẫu theo yêu cầu
export const candidatesData = [
  {
    id: 'cand-1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0912 345 678',
    position: 'Senior Fullstack Engineer',
    campaign: 'Tuyển dụng Kỹ sư Phần mềm Q4/2026',
    matchScore: 94,
    status: 'Chờ duyệt',
    applyDate: '2026-10-12',
    cvUrl: 'https://example.com/resumes/nguyen-van-an-cv.pdf',
    interviewDate: '',
    interviewTime: '',
  },
  {
    id: 'cand-2',
    name: 'Trần Thị Mai',
    email: 'mai.tran@example.com',
    phone: '0988 765 432',
    position: 'Frontend React/TypeScript Lead',
    campaign: 'Đội ngũ Core Frontend 2026',
    matchScore: 88,
    status: 'Đạt',
    applyDate: '2026-10-14',
    cvUrl: 'https://example.com/resumes/tran-thi-mai-cv.pdf',
    interviewDate: '2026-10-20',
    interviewTime: '14:30',
  },
  {
    id: 'cand-3',
    name: 'Lê Hoàng Long',
    email: 'long.le@example.com',
    phone: '0903 112 233',
    position: 'Backend Go / Distributed Architect',
    campaign: 'Hệ thống Phân tán & High-throughput',
    matchScore: 96,
    status: 'Chờ duyệt',
    applyDate: '2026-10-15',
    cvUrl: 'https://example.com/resumes/le-hoang-long-cv.pdf',
    interviewDate: '',
    interviewTime: '',
  },
  {
    id: 'cand-4',
    name: 'Phạm Thu Hương',
    email: 'huong.pham@example.com',
    phone: '0977 445 566',
    position: 'DevOps / Kubernetes Platform Engineer',
    campaign: 'Hạ tầng Cloud & SRE',
    matchScore: 54,
    status: 'Từ chối',
    applyDate: '2026-10-10',
    cvUrl: 'https://example.com/resumes/pham-thu-huong-cv.pdf',
    interviewDate: '',
    interviewTime: '',
  },
  {
    id: 'cand-5',
    name: 'Đỗ Minh Trí',
    email: 'tri.do@example.com',
    phone: '0933 889 900',
    position: 'AI / Machine Learning Engineer',
    campaign: 'R&D KONEK Engine v3.2',
    matchScore: 91,
    status: 'Đạt',
    applyDate: '2026-10-16',
    cvUrl: 'https://example.com/resumes/do-minh-tri-cv.pdf',
    interviewDate: '2026-10-22',
    interviewTime: '09:00',
  },
];

const CAMPAIGNS = [
  'Tất cả chiến dịch',
  'Tuyển dụng Kỹ sư Phần mềm Q4/2026',
  'Đội ngũ Core Frontend 2026',
  'Hệ thống Phân tán & High-throughput',
  'Hạ tầng Cloud & SRE',
  'R&D KONEK Engine v3.2',
];

const STATUS_OPTIONS = ['Tất cả trạng thái', 'Chờ duyệt', 'Đạt', 'Từ chối'];

export const CandidatesPage = () => {
  const [candidates, setCandidates] = useState(candidatesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('Tất cả chiến dịch');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');

  // State cho Side Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Form State trong Drawer
  const [drawerStatus, setDrawerStatus] = useState('Chờ duyệt');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Lọc danh sách ứng viên
  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery);

      const matchCampaign =
        selectedCampaign === 'Tất cả chiến dịch' || item.campaign === selectedCampaign;

      const matchStatus =
        selectedStatus === 'Tất cả trạng thái' || item.status === selectedStatus;

      return matchSearch && matchCampaign && matchStatus;
    });
  }, [candidates, searchQuery, selectedCampaign, selectedStatus]);

  // Mở Drawer xem chi tiết
  const handleOpenDrawer = (candidate) => {
    setSelectedCandidate(candidate);
    setDrawerStatus(candidate.status);
    setInterviewDate(candidate.interviewDate || '');
    setInterviewTime(candidate.interviewTime || '');
    setIsDrawerOpen(true);
  };

  // Đóng Drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Lưu thay đổi trạng thái và lịch phỏng vấn
  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setCandidates((prev) =>
      prev.map((item) => {
        if (item.id === selectedCandidate.id) {
          return {
            ...item,
            status: drawerStatus,
            interviewDate: drawerStatus === 'Đạt' ? interviewDate : '',
            interviewTime: drawerStatus === 'Đạt' ? interviewTime : '',
          };
        }
        return item;
      })
    );

    // Cập nhật lại candidate đang chọn trong Drawer
    setSelectedCandidate((prev) => ({
      ...prev,
      status: drawerStatus,
      interviewDate: drawerStatus === 'Đạt' ? interviewDate : '',
      interviewTime: drawerStatus === 'Đạt' ? interviewTime : '',
    }));

    showToast(`Đã lưu thay đổi cho ứng viên "${selectedCandidate.name}"!`);
    handleCloseDrawer();
  };

  // Xuất báo cáo CSV
  const handleExportReport = () => {
    const headers = [
      'Họ và Tên,Email,Số điện thoại,Vị trí,Chiến dịch,Điểm Matching,Trạng thái,Ngày nộp,Lịch phỏng vấn,Link CV\n',
    ];
    const rows = filteredCandidates.map(
      (c) =>
        `"${c.name}","${c.email}","${c.phone}","${c.position}","${c.campaign}","${c.matchScore}%","${c.status}","${c.applyDate}","${
          c.interviewDate ? `${c.interviewDate} ${c.interviewTime}` : 'Chưa có'
        }","${c.cvUrl}"\n`
    );

    const blob = new Blob([headers.concat(rows).join('')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `danh_sach_ung_vien_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Đã xuất báo cáo danh sách ứng viên thành công!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Màu sắc theo Điểm Matching
  const getScoreTheme = (score) => {
    if (score >= 90) {
      return {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        stroke: '#10B981',
        label: 'Rất phù hợp (Top Pick)',
      };
    }
    if (score >= 75) {
      return {
        text: 'text-[#2563EB] dark:text-[#60A5FA]',
        bg: 'bg-[#2563EB]',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        stroke: '#2563EB',
        label: 'Tiềm năng cao',
      };
    }
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      stroke: '#F59E0B',
      label: 'Cần cân nhắc thêm',
    };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070E18] text-[#051A24] dark:text-[#F8FAFC] p-4 sm:p-8 lg:p-10 font-sans transition-colors duration-300 relative overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#051A24] dark:bg-[#2563EB] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down border border-white/10 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* =========================================================================
            1. HEADER SECTION
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-mono font-semibold tracking-wider uppercase mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>PHÂN HỆ TUYỂN DỤNG HR // KONEK ATS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#051A24] dark:text-[#F8FAFC]">
              Quản lý Ứng viên
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Theo dõi danh sách hồ sơ, đối sánh điểm AI Matching và quản lý lịch phỏng vấn.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#0C1724] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#051A24] dark:text-[#F8FAFC] border border-slate-200/80 dark:border-slate-800 font-semibold text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#2563EB]" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. FILTERS SECTION
           ========================================================================= */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>BỘ LỌC TÌM KIẾM HỒ SƠ</span>
            </span>
            <span>Hiển thị: {filteredCandidates.length}/{candidates.length} ứng viên</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Tên, Email, SĐT */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên ứng viên, email, SĐT hoặc vị trí..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Chiến dịch */}
            <div className="md:col-span-4 relative">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer"
              >
                {CAMPAIGNS.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#0C1724]">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Dropdown Trạng thái */}
            <div className="md:col-span-3 relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-white dark:bg-[#0C1724]">
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. DATA TABLE SECTION
           ========================================================================= */}
        <div className="rounded-3xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6 font-semibold">Tên Ứng viên</th>
                  <th className="py-4 px-6 font-semibold">Vị trí</th>
                  <th className="py-4 px-6 font-semibold">Điểm Matching</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold">Ngày nộp</th>
                  <th className="py-4 px-6 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy ứng viên nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const theme = getScoreTheme(candidate.matchScore);
                    const isSelected = selectedCandidate?.id === candidate.id && isDrawerOpen;

                    return (
                      <tr
                        key={candidate.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-[#2563EB]/5 dark:bg-[#2563EB]/15'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Cột Tên */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
                              {candidate.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(-2)
                                .join('')
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#051A24] dark:text-[#F8FAFC] truncate">
                                {candidate.name}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {candidate.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột Vị trí */}
                        <td className="py-4 px-6">
                          <div className="font-medium text-[#051A24] dark:text-slate-200">
                            {candidate.position}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">{candidate.campaign}</span>
                          </div>
                        </td>

                        {/* Cột Điểm Matching */}
                        <td className="py-4 px-6">
                          <div className="w-36 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-mono font-bold ${theme.text}`}>
                                {candidate.matchScore}%
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                {candidate.matchScore >= 90
                                  ? 'Rất cao'
                                  : candidate.matchScore >= 75
                                  ? 'Khá'
                                  : 'Thấp'}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${theme.bg}`}
                                style={{ width: `${candidate.matchScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Cột Trạng thái */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {candidate.status === 'Chờ duyệt' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Chờ duyệt</span>
                              </span>
                            )}
                            {candidate.status === 'Đạt' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Đạt</span>
                              </span>
                            )}
                            {candidate.status === 'Từ chối' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Từ chối</span>
                              </span>
                            )}

                            {/* Ngày giờ phỏng vấn nếu đạt */}
                            {candidate.status === 'Đạt' && candidate.interviewDate && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#2563EB]" />
                                <span>
                                  {candidate.interviewDate}{' '}
                                  {candidate.interviewTime && `(${candidate.interviewTime})`}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Cột Ngày nộp */}
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {candidate.applyDate}
                        </td>

                        {/* Cột Hành động: Nút "Xem chi tiết" */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(candidate)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#2563EB] hover:text-white dark:bg-[#2563EB]/20 dark:text-[#60A5FA] dark:hover:bg-[#2563EB] dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            <span>Xem chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. SIDE DRAWER (THANH TRƯỢT TỪ BÊN PHẢI SANG)
         ========================================================================= */}
      {/* Backdrop overlay mờ đen */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseDrawer}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white dark:bg-[#0C1724] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 dark:border-slate-800 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {selectedCandidate && (
          <>
            {/* Drawer Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-3">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#2563EB]">
                  HỒ SƠ ỨNG VIÊN // KONEK
                </div>
                <h2
                  id="drawer-title"
                  className="text-lg font-bold text-[#051A24] dark:text-[#F8FAFC] truncate mt-0.5"
                >
                  {selectedCandidate.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                aria-label="Đóng Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Thông tin cơ bản */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200/50 dark:border-slate-800">
                  THÔNG TIN LIÊN HỆ & VỊ TRÍ
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-200">
                    <Briefcase className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">{selectedCandidate.position}</div>
                      <div className="text-xs text-slate-400">{selectedCandidate.campaign}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedCandidate.email}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono">{selectedCandidate.phone}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs font-mono pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Ngày nộp: {selectedCandidate.applyDate}</span>
                  </div>
                </div>
              </div>

              {/* Điểm Matching (Hiển thị dạng vòng tròn tiến trình trực quan) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    ĐIỂM MATCHING TỰ ĐỘNG (AI ATS)
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                </div>

                <div className="flex items-center gap-4">
                  {/* Circular Progress SVG */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="transition-all duration-1000 ease-out"
                        strokeDasharray={`${selectedCandidate.matchScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke={getScoreTheme(selectedCandidate.matchScore).stroke}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-sm text-[#051A24] dark:text-[#F8FAFC]">
                      {selectedCandidate.matchScore}%
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block ${
                        getScoreTheme(selectedCandidate.matchScore).badge
                      }`}
                    >
                      {getScoreTheme(selectedCandidate.matchScore).label}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Phân tích ngữ nghĩa kinh nghiệm, kỹ năng công nghệ và sự phù hợp với JD.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút Xem File CV */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                  HỒ SƠ ỨNG VIÊN (CV)
                </label>
                <a
                  href={selectedCandidate.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-[#051A24] dark:text-[#F8FAFC] transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#2563EB] group-hover:scale-110 transition-transform" />
                    <span>Xem file CV ({selectedCandidate.name.split(' ').pop()}_CV.pdf)</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                </a>
              </div>

              {/* Khu vực Cập nhật Trạng thái */}
              <form id="drawer-form" onSubmit={handleSaveStatus} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                    Cập nhật Trạng thái *
                  </label>
                  <div className="relative">
                    <select
                      value={drawerStatus}
                      onChange={(e) => setDrawerStatus(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="Chờ duyệt">Chờ duyệt</option>
                      <option value="Đạt">Đạt</option>
                      <option value="Từ chối">Từ chối</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Logic: Nếu chọn trạng thái "Đạt" -> Hiển thị thêm 2 ô Input Ngày & Giờ phỏng vấn */}
                {drawerStatus === 'Đạt' && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3.5 animate-slide-down">
                    <div className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Lên lịch phỏng vấn (Dành cho ứng viên Đạt)</span>
                    </div>

                    <div className="space-y-3">
                      {/* Date Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Chọn ngày phỏng vấn *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                          />
                        </div>
                      </div>

                      {/* Time Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Chọn giờ phỏng vấn *
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            required
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Drawer Footer: Nút "Lưu thay đổi" & "Hủy" ở dưới cùng */}
            <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all cursor-pointer text-center"
              >
                Hủy
              </button>

              <button
                type="submit"
                form="drawer-form"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CandidatesPage;
