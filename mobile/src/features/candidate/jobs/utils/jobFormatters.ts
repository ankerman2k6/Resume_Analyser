import type { JobSalary, JobLocation, JobExperience } from '../types/job.types';

export function formatSalary(salary?: JobSalary): string {
  if (!salary) return 'Thỏa thuận';
  if (salary.negotiable && !salary.min && !salary.max) {
    return 'Thỏa thuận';
  }

  const currency = salary.currency?.toUpperCase() || 'VND';
  const min = salary.min;
  const max = salary.max;

  if (currency === 'USD') {
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `Từ $${min.toLocaleString()}`;
    if (max) return `Lên đến $${max.toLocaleString()}`;
    return 'Thỏa thuận';
  }

  // VND formatting in Triệu
  const toMillion = (val: number) => {
    if (val >= 1000000) {
      const m = val / 1000000;
      return Number.isInteger(m) ? `${m}` : `${m.toFixed(1)}`;
    }
    return `${val.toLocaleString()} VND`;
  };

  if (min && max) {
    if (min >= 1000000 && max >= 1000000) {
      return `${toMillion(min)} - ${toMillion(max)} Triệu VND`;
    }
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  }
  if (min) {
    return `Từ ${toMillion(min)} ${min >= 1000000 ? 'Triệu VND' : currency}`;
  }
  if (max) {
    return `Lên đến ${toMillion(max)} ${max >= 1000000 ? 'Triệu VND' : currency}`;
  }

  return 'Thỏa thuận';
}

export function formatLocation(location?: JobLocation): string {
  if (!location) return 'Toàn quốc';
  if (location.remote && !location.city) return 'Remote / Làm việc từ xa';

  const parts: string[] = [];
  if (location.address) parts.push(location.address);
  if (location.city) parts.push(location.city);

  let result = parts.join(', ') || 'Việt Nam';
  if (location.remote) {
    result += ' (Remote/Hybrid)';
  }
  return result;
}

export function formatExperience(exp?: JobExperience): string {
  if (!exp) return 'Không yêu cầu kinh nghiệm';
  const { minYears, maxYears, level } = exp;

  if (minYears !== undefined && maxYears !== undefined) {
    if (minYears === 0 && maxYears <= 1) return 'Dưới 1 năm (Fresher / Intern)';
    return `${minYears} - ${maxYears} năm`;
  }
  if (minYears !== undefined && minYears > 0) {
    return `Từ ${minYears} năm kinh nghiệm`;
  }
  if (level) {
    const levelMap: Record<string, string> = {
      intern: 'Thực tập sinh (Intern)',
      junior: 'Junior (1 - 2 năm)',
      middle: 'Middle (2 - 4 năm)',
      senior: 'Senior (3 - 5+ năm)',
      lead: 'Lead / Quản lý',
    };
    return levelMap[level.toLowerCase()] || level;
  }
  return 'Không yêu cầu kinh nghiệm';
}

export function formatDeadline(deadlineStr?: string): { text: string; isUrgent: boolean } {
  if (!deadlineStr) return { text: 'Không giới hạn', isUrgent: false };
  try {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const day = deadline.getDate().toString().padStart(2, '0');
    const month = (deadline.getMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = `${day}/${month}`;

    if (diffDays < 0) {
      return { text: `${dateFormatted} (Đã hết hạn)`, isUrgent: true };
    }
    if (diffDays === 0) {
      return { text: `${dateFormatted} (Hôm nay là hạn chót)`, isUrgent: true };
    }
    if (diffDays <= 7) {
      return { text: `${dateFormatted} (còn ${diffDays} ngày)`, isUrgent: true };
    }
    return { text: `${dateFormatted} (còn ${diffDays} ngày)`, isUrgent: false };
  } catch {
    return { text: deadlineStr, isUrgent: false };
  }
}

export function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Mới đăng';
  try {
    const past = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return past.toLocaleDateString('vi-VN');
  } catch {
    return 'Gần đây';
  }
}
