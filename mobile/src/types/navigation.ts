import type { NavigatorScreenParams } from '@react-navigation/native';
import type { JobUiItem } from '../features/candidate/jobs/types/job.types';

export type CandidateTabParamList = {
  CandidateJobs: undefined;
  CandidateResumes: undefined;
  CandidateProfile: undefined;
};

export type HrTabParamList = {
  HrDashboard: undefined;
  HrJobs: undefined;
  HrApplications: undefined;
  HrSettings: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;

  CandidateTabs:
    | NavigatorScreenParams<CandidateTabParamList>
    | undefined;

  CandidateJobDetail: {
    jobId: string;
    initialJob?: JobUiItem;
  };

  HrTabs:
    | NavigatorScreenParams<HrTabParamList>
    | undefined;

  HrCreateJob: undefined;
};
