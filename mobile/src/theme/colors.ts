export const colors = {
  light: {
    background: {
      primary: '#F4F7FB',
      surface: '#FFFFFF',
      subtle: '#EDF2F7',
      input: '#FFFFFF',
    },
    brand: {
      primary: '#0F1E36',
      secondary: '#2563EB',
      accent: '#E0F2FE',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      inverse: '#FFFFFF',
    },
    border: {
      subtle: '#E2E8F0',
      focus: '#3B82F6',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#0EA5E9',
    },
  },
  dark: {
    background: {
      primary: '#0B1019',
      surface: '#121A28',
      subtle: '#162032',
      input: '#162032',
    },
    brand: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: 'rgba(56, 189, 248, 0.15)',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      inverse: '#FFFFFF',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      focus: '#60A5FA',
    },
    status: {
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      info: '#38BDF8',
    },
  },
} as const;

export type ThemeMode = keyof typeof colors;
