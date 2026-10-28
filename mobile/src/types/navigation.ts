import type { NavigatorScreenParams } from '@react-navigation/native';

export type CandidateTabParamList = {
  Home: undefined;
  Applications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  CandidateTabs: NavigatorScreenParams<CandidateTabParamList> | undefined;
  JobDetail: { jobId: string };
};
