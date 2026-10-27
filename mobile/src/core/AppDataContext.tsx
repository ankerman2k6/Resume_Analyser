import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { CandidateApplication } from '../types/models';

type AppDataContextValue = {
  applications: CandidateApplication[];
  applyToJob: (application: CandidateApplication) => void;
  hasApplied: (jobId: string) => boolean;
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: PropsWithChildren) {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);

  const value = useMemo<AppDataContextValue>(() => ({
    applications,
    applyToJob: (application) => {
      setApplications((current) => current.some((item) => item.jobId === application.jobId)
        ? current
        : [application, ...current]);
    },
    hasApplied: (jobId) => applications.some((application) => application.jobId === jobId),
  }), [applications]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
