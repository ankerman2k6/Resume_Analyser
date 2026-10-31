import type {
  NavigatorScreenParams,
} from '@react-navigation/native';

export type CandidateTabParamList = {
  CandidateJobs: undefined;
  CandidateResumes: undefined;
  CandidateProfile: undefined;
};

export type HrTabParamList = {
  HrDashboard: undefined;
  HrJobs: undefined;
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

  HrCreateJob: undefined;
};
