import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit3,
  LoaderCircle,
  MapPin,
  Plus,
  RotateCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  createHrJobApi,
  deleteHrJobApi,
  getHrJobsApi,
  updateHrJobApi,
  updateHrJobStatusApi,
} from '../../services/hrJobsService';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đang tuyển' },
  { value: 'closed', label: 'Đã đóng' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Toàn thời gian' },
  { value: 'part_time', label: 'Bán thời gian' },
  { value: 'internship', label: 'Thực tập' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'freelance', label: 'Freelance' },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'intern', label: 'Thực tập' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Quản lý' },
];

const EMPTY_FORM = {
  companyId: '',
  title: '',
  description: '',
  category: '',
  employmentType: 'full_time',
  address: '',
  city: '',
  country: 'Việt Nam',
  remote: false,
  salaryMin: '',
  salaryMax: '',
  currency: 'VND',
  negotiable: false,
  experienceMinYears: '',
  experienceMaxYears: '',
  experienceLevel: 'middle',
  requiredSkills: '',
  preferredSkills: '',
  education: null,
  minimumGpa: null,
  languages: [],
  benefits: '',
  deadline: '',
  status: 'draft',
};

const fieldClass = 'w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-[#051A24] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all';
const labelClass = 'text-xs font-semibold uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300';

const asList = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const toDateInput = (value) => (value ? value.slice(0, 10) : '');

const formatDeadline = (value) => {
  if (!value) return 'Không thời hạn';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
};

const formatJobLocation = (location) => {
  if (!location) return 'Chưa cập nhật';
  const place = [location.address, location.city, location.country].filter(Boolean).join(', ');
  if (location.remote) return place ? `${place} · Remote` : 'Remote';
  return place || 'Chưa cập nhật';
};

const formatJobExperience = (experience) => {
  if (!experience) return 'Mọi cấp bậc';
  const level = EXPERIENCE_LEVEL_OPTIONS.find((item) => item.value === experience.level)?.label
    || experience.level;
  const years = experience.minYears != null || experience.maxYears != null
    ? `${experience.minYears ?? 0} - ${experience.maxYears ?? experience.minYears ?? 0} năm`
    : '';
  return [level, years].filter(Boolean).join(' · ') || 'Mọi cấp bậc';
};

const statusMeta = (status) => STATUS_OPTIONS.find((item) => item.value === status)
  || { value: status, label: status || 'Chưa xác định' };

const employmentTypeLabel = (value) => EMPLOYMENT_TYPE_OPTIONS.find((item) => item.value === value)?.label
  || value
  || 'Chưa cập nhật';

const jobToForm = (job) => ({
  companyId: job.companyId || '',
  title: job.title || '',
  description: job.description || '',
  category: job.category || '',
  employmentType: job.employmentType || 'full_time',
  address: job.location?.address || '',
  city: job.location?.city || '',
  country: job.location?.country || 'Việt Nam',
  remote: Boolean(job.location?.remote),
  salaryMin: job.salary?.min ?? '',
  salaryMax: job.salary?.max ?? '',
  currency: job.salary?.currency || 'VND',
  negotiable: Boolean(job.salary?.negotiable),
  experienceMinYears: job.experience?.minYears ?? '',
  experienceMaxYears: job.experience?.maxYears ?? '',
  experienceLevel: job.experience?.level || 'middle',
  requiredSkills: (job.requirements?.requiredSkills || []).join(', '),
  preferredSkills: (job.requirements?.preferredSkills || []).join(', '),
  education: job.requirements?.education || null,
  minimumGpa: job.requirements?.minimumGpa || null,
  languages: job.requirements?.languages || [],
  benefits: (job.benefits || []).join(', '),
  deadline: toDateInput(job.deadline),
  status: job.status || 'draft',
});

const nullableNumber = (value) => (value === '' ? null : Number(value));

const formToPayload = (form) => ({
  companyId: form.companyId.trim(),
  title: form.title.trim(),
  description: form.description.trim(),
  category: form.category.trim() || null,
  employmentType: form.employmentType,
  location: {
    address: form.address.trim() || null,
    city: form.city.trim() || null,
    country: form.country.trim() || null,
    remote: form.remote,
  },
  salary: {
    min: nullableNumber(form.salaryMin),
    max: nullableNumber(form.salaryMax),
    currency: form.currency.trim() || 'VND',
    negotiable: form.negotiable,
  },
  experience: {
    minYears: nullableNumber(form.experienceMinYears),
    maxYears: nullableNumber(form.experienceMaxYears),
    level: form.experienceLevel,
  },
  requirements: {
    requiredSkills: asList(form.requiredSkills),
    preferredSkills: asList(form.preferredSkills),
    ...(form.education ? { education: form.education } : {}),
    ...(form.minimumGpa ? { minimumGpa: form.minimumGpa } : {}),
    ...(form.languages.length > 0 ? { languages: form.languages } : {}),
  },
  benefits: asList(form.benefits),
  deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
});

const JobRowsSkeleton = () => (
  <>
    {[0, 1, 2, 3].map((row) => (
      <tr key={row} className="border-b border-slate-100 dark:border-slate-800/80">
        {[0, 1, 2, 3, 4, 5].map((cell) => (
          <td key={cell} className="px-6 py-5">
            <div className={`h-3 animate-pulse motion-reduce:animate-none rounded-full bg-slate-100 dark:bg-slate-800 ${cell === 0 ? 'w-44' : 'w-24'}`} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      // NHẬN API: GET /api/hr/jobs trả về các Job thuộc HR đang đăng nhập.
      const data = await getHrJobsApi();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(error.message || 'Không tải được danh sách bài tuyển dụng.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    return jobs.filter((job) => {
      const searchable = [job.title, job.category, formatJobLocation(job.location)]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('vi');
      const matchesQuery = !query || searchable.includes(query);
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingJobId(null);
    setFormData({ ...EMPTY_FORM });
    setValidationError('');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJobId(job.id);
    setFormData(jobToForm(job));
    setValidationError('');
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    if (isSaving) return;
    setIsDrawerOpen(false);
    setValidationError('');
  };

  const handleInputChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationError('');
  };

  const validateForm = () => {
    if (!/^[a-f\d]{24}$/i.test(formData.companyId.trim())) return 'Company ID phải là MongoDB ObjectId gồm 24 ký tự.';
    if (!formData.title.trim()) return 'Vui lòng nhập tiêu đề Job.';
    if (!formData.description.trim()) return 'Vui lòng nhập mô tả công việc.';
    if (!formData.deadline) return 'Vui lòng chọn hạn nộp hồ sơ.';
    if (!editingJobId && new Date(`${formData.deadline}T23:59:59`) <= new Date()) return 'Hạn nộp của Job mới phải ở tương lai.';
    if (formData.salaryMin !== '' && formData.salaryMax !== '' && Number(formData.salaryMin) > Number(formData.salaryMax)) return 'Mức lương tối thiểu không được lớn hơn mức tối đa.';
    if (formData.experienceMinYears !== '' && formData.experienceMaxYears !== '' && Number(formData.experienceMinYears) > Number(formData.experienceMaxYears)) return 'Số năm kinh nghiệm tối thiểu không được lớn hơn tối đa.';
    return '';
  };

  const handleSaveJob = async (event) => {
    event.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    setIsSaving(true);
    try {
      const payload = formToPayload(formData);
      let savedJob;

      if (editingJobId) {
        // GỬI API: PUT cập nhật nội dung Job; PATCH cập nhật status nếu HR thay đổi.
        const original = jobs.find((job) => job.id === editingJobId);
        savedJob = await updateHrJobApi(editingJobId, payload);
        if (original?.status !== formData.status) {
          savedJob = await updateHrJobStatusApi(editingJobId, formData.status);
        }
        setJobs((current) => current.map((job) => (job.id === editingJobId ? savedJob : job)));
        showToast(`Đã cập nhật bài tuyển dụng “${savedJob.title}”.`);
      } else {
        // GỬI API: POST luôn tạo draft; PATCH tiếp nếu HR chọn trạng thái khác.
        savedJob = await createHrJobApi(payload);
        if (formData.status !== 'draft') {
          savedJob = await updateHrJobStatusApi(savedJob.id, formData.status);
        }
        setJobs((current) => [savedJob, ...current]);
        showToast(`Đã tạo bài tuyển dụng “${savedJob.title}”.`);
      }

      setIsDrawerOpen(false);
      setValidationError('');
    } catch (error) {
      setValidationError(error.message || 'Không thể lưu bài tuyển dụng.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài tuyển dụng “${jobTitle}”?`)) return;

    setDeletingJobId(jobId);
    try {
      await deleteHrJobApi(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
      showToast(`Đã xóa bài tuyển dụng “${jobTitle}”.`);
    } catch (error) {
      showToast(error.message || 'Không thể xóa bài tuyển dụng.', 'error');
    } finally {
      setDeletingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070E18] text-[#051A24] dark:text-[#F8FAFC] p-4 sm:p-8 lg:p-10 font-sans transition-colors duration-300 relative overflow-x-hidden">
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`fixed bottom-6 right-6 z-50 max-w-sm text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 text-sm font-medium ${toast.type === 'error' ? 'bg-rose-700' : 'bg-[#051A24] dark:bg-[#2563EB]'}`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-mono font-semibold tracking-wider uppercase mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>PHÂN HỆ TUYỂN DỤNG HR // KONEK ATS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#051A24] dark:text-[#F8FAFC]">Chiến dịch Tuyển dụng</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quản lý các vị trí tuyển dụng và thông tin chiến dịch từ hệ thống.</p>
          </div>
          <button type="button" onClick={handleOpenCreate} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            <span>Tạo Job mới</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="search" placeholder="Tìm theo tiêu đề, danh mục hoặc địa điểm..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className={`${fieldClass} pl-10 pr-9`} />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" aria-label="Xóa nội dung tìm kiếm">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[{ value: 'all', label: 'Tất cả' }, ...STATUS_OPTIONS].map((status) => (
              <button key={status.value} type="button" onClick={() => setStatusFilter(status.value)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${statusFilter === status.value ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#0C1724] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6 font-semibold">Tiêu đề Job</th>
                  <th className="py-4 px-6 font-semibold">Địa điểm</th>
                  <th className="py-4 px-6 font-semibold">Hình thức</th>
                  <th className="py-4 px-6 font-semibold">Hạn nộp</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody aria-busy={isLoading} className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {isLoading ? (
                  <JobRowsSkeleton />
                ) : loadError ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="sticky left-0 flex min-h-48 w-[calc(100vw-2rem)] items-center justify-center px-4 py-12 text-center md:static md:w-auto">
                        <div role="alert" className="flex flex-col items-center gap-3">
                          <div>
                            <p className="text-sm font-medium text-rose-600">Không tải được danh sách bài tuyển dụng</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loadError}</p>
                          </div>
                          <button type="button" onClick={loadJobs} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                            <RotateCw className="w-4 h-4" /> Thử lại
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="sticky left-0 flex min-h-48 w-[calc(100vw-2rem)] items-center justify-center px-4 py-12 text-center text-slate-500 dark:text-slate-400 font-medium md:static md:w-auto">
                        {jobs.length === 0 ? 'Chưa có bài tuyển dụng nào.' : 'Không tìm thấy bài tuyển dụng phù hợp.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    // HIỂN THỊ API: mọi giá trị trong hàng đều lấy trực tiếp từ Job backend trả về.
                    const status = statusMeta(job.status);
                    const isPublished = job.status === 'published';
                    return (
                      <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5"><Briefcase className="w-5 h-5" /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#051A24] dark:text-[#F8FAFC] group-hover:text-[#2563EB] transition-colors">{job.title || 'Chưa có tiêu đề'}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">{formatJobExperience(job.experience)}</span>
                                {job.category && <span className="text-xs text-slate-400">{job.category}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6"><div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><MapPin className="w-4 h-4 text-slate-400 shrink-0" /><span className="max-w-xs">{formatJobLocation(job.location)}</span></div></td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{employmentTypeLabel(job.employmentType)}</td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>{formatDeadline(job.deadline)}</span></div></td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isPublished ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : job.status === 'closed' ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : job.status === 'closed' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button type="button" onClick={() => handleOpenEdit(job)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#2563EB] hover:text-white dark:bg-[#2563EB]/20 dark:text-[#60A5FA] dark:hover:bg-[#2563EB] dark:hover:text-white transition-all cursor-pointer active:scale-95" title="Chỉnh sửa bài tuyển dụng"><Edit3 className="w-3.5 h-3.5" /><span>Sửa</span></button>
                            <button type="button" disabled={deletingJobId === job.id} onClick={() => handleDeleteJob(job.id, job.title)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" title="Xóa bài tuyển dụng" aria-label={`Xóa ${job.title}`}>
                              {deletingJobId === job.id ? <LoaderCircle className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" /> : <Trash2 className="w-3.5 h-3.5" />}
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
          {isLoading && <span className="sr-only" role="status">Đang tải danh sách bài tuyển dụng</span>}
        </div>
      </div>

      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={handleCloseDrawer} aria-hidden="true" />
      <aside className={`fixed inset-y-0 right-0 z-50 w-full md:w-[520px] bg-white dark:bg-[#0C1724] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 dark:border-slate-800 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true" aria-labelledby="job-drawer-title" aria-hidden={!isDrawerOpen}>
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div><div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#2563EB]">CHIẾN DỊCH TUYỂN DỤNG // KONEK</div><h2 id="job-drawer-title" className="text-lg font-bold text-[#051A24] dark:text-[#F8FAFC] mt-0.5">{editingJobId ? 'Chỉnh sửa Job' : 'Thêm Job mới'}</h2></div>
          <button type="button" onClick={handleCloseDrawer} disabled={isSaving} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 disabled:opacity-50" aria-label="Đóng Drawer"><X className="w-5 h-5" /></button>
        </div>

        <form id="job-drawer-form" onSubmit={handleSaveJob} className="flex-1 overflow-y-auto p-6 space-y-5">
          {validationError && <div role="alert" className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{validationError}</span></div>}

          <div className="space-y-1.5"><label htmlFor="job-company-id" className={labelClass}>Company ID <span className="text-rose-500">*</span></label><input id="job-company-id" value={formData.companyId} onChange={(event) => handleInputChange('companyId', event.target.value)} disabled={Boolean(editingJobId)} placeholder="MongoDB ObjectId của công ty" className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`} /></div>
          <div className="space-y-1.5"><label htmlFor="job-title" className={labelClass}>Tiêu đề Job <span className="text-rose-500">*</span></label><input id="job-title" value={formData.title} onChange={(event) => handleInputChange('title', event.target.value)} placeholder="VD: Senior Fullstack Engineer" className={fieldClass} /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><label htmlFor="job-category" className={labelClass}>Danh mục</label><input id="job-category" value={formData.category} onChange={(event) => handleInputChange('category', event.target.value)} placeholder="VD: Công nghệ thông tin" className={fieldClass} /></div>
            <div className="space-y-1.5"><label htmlFor="job-employment" className={labelClass}>Hình thức</label><div className="relative"><select id="job-employment" value={formData.employmentType} onChange={(event) => handleInputChange('employmentType', event.target.value)} className={`${fieldClass} appearance-none pr-10`}>{EMPLOYMENT_TYPE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" /></div></div>
          </div>

          <fieldset className="space-y-3"><legend className={labelClass}>Địa điểm làm việc</legend><input value={formData.address} onChange={(event) => handleInputChange('address', event.target.value)} placeholder="Địa chỉ" className={fieldClass} /><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><input value={formData.city} onChange={(event) => handleInputChange('city', event.target.value)} placeholder="Thành phố" className={fieldClass} /><input value={formData.country} onChange={(event) => handleInputChange('country', event.target.value)} placeholder="Quốc gia" className={fieldClass} /></div><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={formData.remote} onChange={(event) => handleInputChange('remote', event.target.checked)} className="size-4 accent-[#2563EB]" />Cho phép làm việc từ xa</label></fieldset>

          <fieldset className="space-y-3"><legend className={labelClass}>Kinh nghiệm</legend><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input type="number" min="0" value={formData.experienceMinYears} onChange={(event) => handleInputChange('experienceMinYears', event.target.value)} placeholder="Tối thiểu" className={fieldClass} /><input type="number" min="0" value={formData.experienceMaxYears} onChange={(event) => handleInputChange('experienceMaxYears', event.target.value)} placeholder="Tối đa" className={fieldClass} /><select value={formData.experienceLevel} onChange={(event) => handleInputChange('experienceLevel', event.target.value)} className={fieldClass}>{EXPERIENCE_LEVEL_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div></fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><label htmlFor="job-deadline" className={labelClass}>Hạn nộp <span className="text-rose-500">*</span></label><input id="job-deadline" type="date" value={formData.deadline} onChange={(event) => handleInputChange('deadline', event.target.value)} className={fieldClass} /></div>
            <div className="space-y-1.5"><label htmlFor="job-status" className={labelClass}>Trạng thái</label><select id="job-status" value={formData.status} onChange={(event) => handleInputChange('status', event.target.value)} className={fieldClass}>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          </div>

          <div className="space-y-1.5"><label htmlFor="job-description" className={labelClass}>Mô tả công việc <span className="text-rose-500">*</span></label><textarea id="job-description" rows={4} value={formData.description} onChange={(event) => handleInputChange('description', event.target.value)} placeholder="Vai trò và trách nhiệm chính..." className={`${fieldClass} resize-y`} /></div>
          <div className="space-y-1.5"><label htmlFor="job-required-skills" className={labelClass}>Kỹ năng bắt buộc</label><textarea id="job-required-skills" rows={2} value={formData.requiredSkills} onChange={(event) => handleInputChange('requiredSkills', event.target.value)} placeholder="Java, Spring Boot, MongoDB" className={`${fieldClass} resize-y`} /><p className="text-xs text-slate-400">Phân cách từng kỹ năng bằng dấu phẩy.</p></div>
          <div className="space-y-1.5"><label htmlFor="job-preferred-skills" className={labelClass}>Kỹ năng ưu tiên</label><textarea id="job-preferred-skills" rows={2} value={formData.preferredSkills} onChange={(event) => handleInputChange('preferredSkills', event.target.value)} placeholder="Docker, AWS" className={`${fieldClass} resize-y`} /></div>
          <div className="space-y-1.5"><label htmlFor="job-benefits" className={labelClass}>Phúc lợi</label><textarea id="job-benefits" rows={2} value={formData.benefits} onChange={(event) => handleInputChange('benefits', event.target.value)} placeholder="Bảo hiểm, thưởng hiệu suất" className={`${fieldClass} resize-y`} /></div>

          <fieldset className="space-y-3"><legend className={labelClass}>Mức lương</legend><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input type="number" min="0" value={formData.salaryMin} onChange={(event) => handleInputChange('salaryMin', event.target.value)} placeholder="Tối thiểu" className={fieldClass} /><input type="number" min="0" value={formData.salaryMax} onChange={(event) => handleInputChange('salaryMax', event.target.value)} placeholder="Tối đa" className={fieldClass} /><input value={formData.currency} onChange={(event) => handleInputChange('currency', event.target.value)} placeholder="VND" className={fieldClass} /></div><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={formData.negotiable} onChange={(event) => handleInputChange('negotiable', event.target.checked)} className="size-4 accent-[#2563EB]" />Có thể thương lượng</label></fieldset>
        </form>

        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
          <button type="button" onClick={handleCloseDrawer} disabled={isSaving} className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all cursor-pointer text-center disabled:opacity-50">Hủy</button>
          <button type="submit" form="job-drawer-form" disabled={isSaving} className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin motion-reduce:animate-none" /> : <Check className="w-4 h-4" />}<span>{isSaving ? 'Đang lưu...' : 'Lưu Job'}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default JobsPage;
