export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  salary: string;
  description: string;
  skills: string[];
};

export type CandidateApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'reviewing';
  appliedAt: string;
};
