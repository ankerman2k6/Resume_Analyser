import type { NavigatorScreenParams } from '@react-navigation/native';
import type { JobResponse } from '../features/candidate/jobs/types/job.types';

export type CandidateTabParamList = {
  CandidateJobs: undefined;
  CandidateResumes: undefined;
  CandidateProfile: undefined;
};

export type HrTabParamList = {
  HrDashboard: undefined;
  HrApplications: undefined;
  HrInterviews: undefined;
  HrSettings: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;

  CandidateTabs:
    | NavigatorScreenParams<CandidateTabParamList>
    | undefined;

  HrTabs:
    | NavigatorScreenParams<HrTabParamList>
    | undefined;

  CandidateJobDetail: {
    jobId: string;
    initialJob?: JobResponse;
  };
};
