import React, { useState, useMemo, useEffect } from 'react';
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

import { getHrJobsApi, getHrApplicationsApi, updateHrApplicationStatusApi, downloadHrCvApi } from '../../services/hrApplicationsService';

const STATUS_LABELS = {
  applied: 'Đã nộp', pending: 'Chờ duyệt', reviewing: 'Đang xem xét',
  shortlisted: 'Đạt', interview: 'Phỏng vấn', accepted: 'Đã nhận',
  rejected: 'Từ chối', withdrawn: 'Đã rút',
};
const STATUS_OPTIONS = ['Tất cả trạng thái', ...Object.values(STATUS_LABELS)];

export const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('Tất cả chiến dịch');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const CAMPAIGNS = ['Tất cả chiến dịch', ...jobs.map((job) => job.title)];

  useEffect(() => {
    let active = true;
    // Nhận API: lấy jobs của HR rồi lấy Applications của từng job.
    (async () => {
      try {
        const ownedJobs = await getHrJobsApi();
        const lists = await Promise.all(ownedJobs.map(async (job) => {
          const applications = await getHrApplicationsApi(job.id);
          return applications.map((app) => ({
            id: app.id, jobId: app.jobId,
            name: app.fullName || 'Chưa cập nhật tên',
            email: app.email || '', phone: app.phone || '',
            position: job.title, campaign: job.title,
            status: STATUS_LABELS[app.status] || app.status,
            rawStatus: app.status, cvUrl: app.cvUrl,
            applyDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật',
          }));
        }));
        if (active) { setJobs(ownedJobs); setCandidates(lists.flat()); }
      } catch (error) {
        if (active) setLoadError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // State cho Side Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Form State trong Drawer
  const [drawerStatus, setDrawerStatus] = useState('Chờ duyệt');
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
    setIsDrawerOpen(true);
  };

  // Đóng Drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Lưu thay đổi trạng thái và lịch phỏng vấn
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || saving) return;
    const rawStatus = Object.keys(STATUS_LABELS).find((key) => STATUS_LABELS[key] === drawerStatus);
    if (drawerStatus === selectedCandidate.status) { handleCloseDrawer(); return; }
    setSaving(true);
    try {
      const updated = await updateHrApplicationStatusApi(selectedCandidate.id, rawStatus);
      setCandidates((rows) => rows.map((row) => row.id === selectedCandidate.id
        ? { ...row, status: STATUS_LABELS[updated.status] || updated.status, rawStatus: updated.status }
        : row));
      showToast('Đã lưu trạng thái hồ sơ.');
      handleCloseDrawer();
    } catch (error) { showToast(error.message); }
    finally { setSaving(false); }
  };

  // Xuất báo cáo CSV
  const handleExportReport = () => {
    const headers = [
      'Họ và Tên,Email,Số điện thoại,Vị trí,Chiến dịch,Trạng thái,Ngày nộp,Link CV\n',
    ];
    const rows = filteredCandidates.map(
      (c) =>
        `"${c.name}","${c.email}","${c.phone}","${c.position}","${c.campaign}","${c.status}","${c.applyDate}","${c.cvUrl}"\n`
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
              Xem thông tin liên hệ, tải CV và cập nhật trạng thái hồ sơ ứng tuyển.
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
                  <th className="py-4 px-6 font-semibold">Điện thoại</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold">Ngày nộp</th>
                  <th className="py-4 px-6 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      {loading ? 'Đang tải hồ sơ ứng tuyển…' : loadError || 'Không có hồ sơ ứng tuyển phù hợp.'}
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
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

                        <td className="py-4 px-6">{candidate.phone || 'Chưa cập nhật'}</td>

                        {/* Cột Trạng thái */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {!['Đạt', 'Từ chối'].includes(candidate.status) && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{candidate.status}</span>
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

              {/* Nút Xem File CV */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                  HỒ SƠ ỨNG VIÊN (CV)
                </label>
                <button
                  type="button"
                  disabled={!selectedCandidate.cvUrl}
                  onClick={async () => {
                    try { await downloadHrCvApi(selectedCandidate.id); }
                    catch (error) { showToast(error.message); }
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-[#051A24] dark:text-[#F8FAFC] transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#2563EB] group-hover:scale-110 transition-transform" />
                    <span>{selectedCandidate.cvUrl ? 'Tải CV đã nộp' : 'Chưa có tệp CV'}</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                </button>
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
                      <option value={selectedCandidate.status}>{selectedCandidate.status}</option>
                      {Object.entries(STATUS_LABELS).filter(([key, label]) =>
                        !['applied', 'withdrawn'].includes(key) && label !== selectedCandidate.status
                      ).map(([key, label]) => <option key={key} value={label}>{label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

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
                disabled={saving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CandidatesPage;
