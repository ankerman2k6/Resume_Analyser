import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit3,
  X,
  Briefcase,
  MapPin,
  Users,
  Calendar,
  Check,
  Search,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Building2,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// Mock Data 4 bài tuyển dụng mẫu theo yêu cầu
export const jobsData = [
  {
    id: 'job-1',
    title: 'Senior Fullstack Engineer (React / Node.js)',
    location: 'Hà Nội (Hybrid)',
    applicants: 28,
    deadline: '2026-11-15',
    status: 'Đang mở',
    experience: 'Senior (4 - 6 năm)',
    description:
      'Chịu trách nhiệm thiết kế kiến trúc và phát triển các tính năng phân tích CV bằng AI trên nền tảng KONEK ATS.',
    requirements:
      'Tối thiểu 4 năm kinh nghiệm với React & Node.js/TypeScript. Thành thạo tối ưu hóa cơ sở dữ liệu MongoDB/PostgreSQL và hệ thống Microservices.',
  },
  {
    id: 'job-2',
    title: 'AI / Machine Learning Engineer (NLP & LLMs)',
    location: 'Hà Nội / Remote',
    applicants: 42,
    deadline: '2026-11-20',
    status: 'Đang mở',
    experience: 'Senior (4 - 6 năm)',
    description:
      'Nghiên cứu và tối ưu các mô hình ngôn ngữ lớn (LLM), vector embeddings và thuật toán matching hồ sơ ứng viên tự động.',
    requirements:
      '3+ năm kinh nghiệm với Python, PyTorch/TensorFlow, LangChain. Hiểu biết sâu về Vector Databases (Qdrant, Pinecone) và RAG pipeline.',
  },
  {
    id: 'job-3',
    title: 'DevOps / SRE Platform Engineer',
    location: 'Hồ Chí Minh (On-site)',
    applicants: 15,
    deadline: '2026-10-31',
    status: 'Đang mở',
    experience: 'Middle (2 - 4 năm)',
    description:
      'Vận hành hạ tầng Kubernetes trên AWS/GCP, thiết lập quy trình CI/CD tự động và giám sát hệ thống bảo mật dữ liệu.',
    requirements:
      '2+ năm kinh nghiệm quản trị cụm Kubernetes (EKS/GKE), Terraform, Docker. Khả năng viết script tự động hóa tốt với Bash/Python.',
  },
  {
    id: 'job-4',
    title: 'Product Designer / UI-UX Lead',
    location: 'Đà Nẵng (Hybrid)',
    applicants: 19,
    deadline: '2026-10-15',
    status: 'Đã đóng',
    experience: 'Lead / Quản lý (> 6 năm)',
    description:
      'Định hình hệ thống KONEK Design System, nghiên cứu trải nghiệm tuyển dụng và thiết kế luồng người dùng tối ưu hóa hiệu suất làm việc.',
    requirements:
      '5+ năm kinh nghiệm thiết kế sản phẩm SaaS B2B. Thành thạo Figma nâng cao (Auto Layout, Tokens, Variables) và phối hợp cùng Engineering.',
  },
];

const EXPERIENCE_OPTIONS = [
  'Thực tập (Intern)',
  'Junior (1 - 2 năm)',
  'Middle (2 - 4 năm)',
  'Senior (4 - 6 năm)',
  'Lead / Quản lý (> 6 năm)',
];

const EMPTY_FORM = {
  title: '',
  description: '',
  location: '',
  experience: 'Senior (4 - 6 năm)',
  requirements: '',
  deadline: '',
  status: 'Đang mở',
};

export const JobsPage = () => {
  const [jobs, setJobs] = useState(jobsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  // State cho Side Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [validationError, setValidationError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Lọc bài tuyển dụng
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'Tất cả' || job.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Mở Drawer thêm mới
  const handleOpenCreate = () => {
    setEditingJobId(null);
    setFormData(EMPTY_FORM);
    setValidationError('');
    setIsDrawerOpen(true);
  };

  // Mở Drawer chỉnh sửa có sẵn dữ liệu
  const handleOpenEdit = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      experience: job.experience || 'Senior (4 - 6 năm)',
      requirements: job.requirements || '',
      deadline: job.deadline || '',
      status: job.status || 'Đang mở',
    });
    setValidationError('');
    setIsDrawerOpen(true);
  };

  // Đóng Drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setValidationError('');
  };

  // Cập nhật giá trị trường trong form
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'title' && value.trim()) {
      setValidationError('');
    }
  };

  // Lưu Job (Thêm mới hoặc Cập nhật)
  const handleSaveJob = (e) => {
    e.preventDefault();

    // Validate: Tiêu đề không được để trống
    if (!formData.title.trim()) {
      setValidationError('Vui lòng nhập Tiêu đề Job (không được để trống).');
      return;
    }

    if (editingJobId) {
      // Chế độ chỉnh sửa
      setJobs((prev) =>
        prev.map((job) =>
          job.id === editingJobId
            ? {
                ...job,
                ...formData,
              }
            : job
        )
      );
      showToast(`Đã cập nhật bài tuyển dụng "${formData.title}"!`);
    } else {
      // Chế độ tạo mới
      const newJob = {
        id: `job-${Date.now()}`,
        ...formData,
        applicants: 0,
      };
      setJobs((prev) => [newJob, ...prev]);
      showToast(`Đã tạo bài tuyển dụng mới "${formData.title}"!`);
    }

    handleCloseDrawer();
  };

  // Xóa Job
  const handleDeleteJob = (jobId, jobTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài tuyển dụng "${jobTitle}"?`)) {
      setJobs((prev) => prev.filter((item) => item.id !== jobId));
      showToast(`Đã xóa bài tuyển dụng "${jobTitle}".`);
    }
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
              <Briefcase className="w-3.5 h-3.5" />
              <span>PHÂN HỆ TUYỂN DỤNG HR // KONEK ATS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#051A24] dark:text-[#F8FAFC]">
              Chiến dịch Tuyển dụng
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý các vị trí đang tuyển, theo dõi tiến độ ứng tuyển và cấu hình thông tin chiến dịch.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo Job mới</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. FILTERS & SEARCH BAR
           ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Ô Tìm kiếm */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề job hoặc địa điểm..."
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

          {/* Lọc Trạng thái */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {['Tất cả', 'Đang mở', 'Đã đóng'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
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
                  <th className="py-4 px-6 font-semibold">Tiêu đề Job</th>
                  <th className="py-4 px-6 font-semibold">Địa điểm</th>
                  <th className="py-4 px-6 font-semibold">Số lượng Apply</th>
                  <th className="py-4 px-6 font-semibold">Hạn nộp</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy bài tuyển dụng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const isOpen = job.status === 'Đang mở';

                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Tiêu đề Job */}
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#051A24] dark:text-[#F8FAFC] group-hover:text-[#2563EB] transition-colors">
                                {job.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                                  {job.experience || 'Mọi cấp bậc'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Địa điểm */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">{job.location}</span>
                          </div>
                        </td>

                        {/* Số lượng Apply */}
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/60 dark:border-blue-900/60 font-mono">
                            <Users className="w-3.5 h-3.5" />
                            <span>{job.applicants} hồ sơ</span>
                          </div>
                        </td>

                        {/* Hạn nộp */}
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.deadline || 'Không thời hạn'}</span>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-4 px-6">
                          {isOpen ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Đang mở</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Đã đóng</span>
                            </span>
                          )}
                        </td>

                        {/* Hành động (Nút "Sửa" và tùy chọn Xóa) */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(job)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#2563EB] hover:text-white dark:bg-[#2563EB]/20 dark:text-[#60A5FA] dark:hover:bg-[#2563EB] dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
                              title="Chỉnh sửa bài tuyển dụng"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Xóa bài tuyển dụng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
          4. SIDE DRAWER (THÊM / CHỈNH SỬA JOB)
         ========================================================================= */}
      {/* Backdrop overlay mờ đen */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseDrawer}
        aria-hidden="true"
      />

      {/* Drawer Container trượt mượt mà bằng translate-x */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[460px] bg-white dark:bg-[#0C1724] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 dark:border-slate-800 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-drawer-title"
      >
        {/* Drawer Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#2563EB]">
              CHIẾN DỊCH TUYỂN DỤNG // KONEK
            </div>
            <h2
              id="job-drawer-title"
              className="text-lg font-bold text-[#051A24] dark:text-[#F8FAFC] mt-0.5"
            >
              {editingJobId ? 'Chỉnh sửa Job' : 'Thêm Job mới'}
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

        {/* Drawer Scrollable Body: Form nhập liệu xếp dọc */}
        <form
          id="job-drawer-form"
          onSubmit={handleSaveJob}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Thông báo lỗi validation */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Tiêu đề Job (Input) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Tiêu đề Job <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 lowercase font-sans">bắt buộc</span>
            </label>
            <input
              type="text"
              placeholder="VD: Senior Fullstack Engineer (React / Node.js)"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                validationError
                  ? 'border-rose-400 focus:ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-700/80 focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
              }`}
            />
          </div>

          {/* 2. Địa điểm (Input) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300">
              Địa điểm làm việc
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="VD: Hà Nội (Hybrid) hoặc Hồ Chí Minh"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>

          {/* 3. Kinh nghiệm (Select) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300">
              Yêu cầu kinh nghiệm
            </label>
            <div className="relative">
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer"
              >
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <option key={exp} value={exp} className="bg-white dark:bg-[#0C1724]">
                    {exp}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. Hạn nộp (Date input) & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300">
                Hạn nộp hồ sơ
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300">
                Trạng thái
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm font-medium text-[#051A24] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="Đang mở" className="bg-white dark:bg-[#0C1724]">
                    Đang mở
                  </option>
                  <option value="Đã đóng" className="bg-white dark:bg-[#0C1724]">
                    Đã đóng
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 5. Mô tả công việc (Textarea) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300">
              Mô tả công việc (Job Description)
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả tóm tắt vai trò, trách nhiệm chính của vị trí..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-y"
            />
          </div>

          {/* 6. Yêu cầu ứng viên (Textarea) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300">
              Yêu cầu ứng viên (Requirements)
            </label>
            <textarea
              rows={4}
              placeholder="Kỹ năng chuyên môn, kinh nghiệm công nghệ, bằng cấp hoặc chứng chỉ..."
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-y"
            />
          </div>
        </form>

        {/* Drawer Footer: Nút "Hủy" & "Lưu Job" */}
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
            form="job-drawer-form"
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Lưu Job</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default JobsPage;
