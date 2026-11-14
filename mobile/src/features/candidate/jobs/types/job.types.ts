export type JobLocation = {
  address?: string;
  city?: string;
  country?: string;
  remote?: boolean;
};

export type JobSalary = {
  min?: number;
  max?: number;
  currency?: string;
  negotiable?: boolean;
};

export type JobExperience = {
  minYears?: number;
  maxYears?: number;
  level?: string;
};

export type JobRequirements = {
  requiredSkills?: string[];
  preferredSkills?: string[];
  education?: {
    minimumDegree?: string;
    preferredMajors?: string[];
  };
  minimumGpa?: {
    value?: number;
    scale?: number;
  };
  languages?: Array<{
    name: string;
    minimumLevel: string;
  }>;
};

export type JobResponse = {
  id: string;
  companyId?: string;
  recruiterId?: string;
  title: string;
  description: string;
  category?: string;
  employmentType?: string;
  location?: JobLocation;
  salary?: JobSalary;
  experience?: JobExperience;
  requirements?: JobRequirements;
  benefits?: string[];
  deadline?: string;
  status?: string;
  createdAt?: string;
};

export type CompanyLocation = {
  address?: string;
  city?: string;
  country?: string;
};

export type CompanyResponse = {
  id: string;
  name: string;
  industry?: string;
  logoUrl?: string;
  description?: string;
  locations?: CompanyLocation[];
  size?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type JobSearchParams = {
  keyword?: string;
  profession?: string;
  location?: string;
  page?: number;
  size?: number;
};

export type FilterState = {
  locations: string[]; // e.g. ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'remote']
  salaryRange: 'all' | 'under15' | '15to25' | '25to40' | 'above40';
  level: 'all' | 'intern' | 'junior' | 'middle' | 'lead';
};

export type QuickFilterKey = 'all' | 'backend' | 'ai' | 'devops' | 'design' | 'remote';

export type JobUiItem = JobResponse & {
  companyName?: string;
  companyLogo?: string;
  companyTagline?: string;
  isBookmarked?: boolean;
  matchScore?: number;
  badges?: string[];
};
