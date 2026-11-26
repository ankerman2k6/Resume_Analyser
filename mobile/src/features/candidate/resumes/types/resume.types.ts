export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type CvSource = {
  type: string;
  fileName: string | null;
  mimeType: string | null;
};

export type CvParseInfo = {
  status: string;
  parsedAt: string | null;
  parserVersion: string | null;
};

export type CvSkill = {
  name: string;
  category: string | null;
  level: string | null;
  yearsOfExperience: number | null;
};

export type CandidateCv = {
  _id: string;
  title: string;
  source: CvSource | null;
  parseInfo: CvParseInfo | null;
  skills: CvSkill[];
  createdAt: string;
  updatedAt: string;
  canViewFile: boolean;
  canDelete: boolean;
  deleteBlockedReason: string | null;
};
