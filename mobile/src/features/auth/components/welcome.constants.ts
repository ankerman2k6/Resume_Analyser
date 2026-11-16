export const WELCOME_COLORS = {
  navy: '#0F1E36',
  white: '#FFFFFF',
  background: '#F4F7FB',
  blue: '#2563EB',
  softBlue: '#DCE9F9',
  secondaryText: '#64748B',
  paleBlue: '#EEF5FF',
  deepBlue: '#193B73',
} as const;

export const WELCOME_BACKGROUND = {
  base: '#071B46',
  deep: '#0A2258',
  shape: '#173E8A',
  highlight: '#8FB4FF',
} as const;

export type OnboardingSlide = {
  id: 'analysis' | 'matching' | 'recruitment';
  title: string;
  description: string;
};

export const ONBOARDING_SLIDES: readonly OnboardingSlide[] = [
  {
    id: 'analysis',
    title: 'Mở khóa tiềm năng của bạn',
    description: 'Phân tích CV cá nhân bằng trí tuệ nhân tạo và khám phá thế mạnh của bạn',
  },
  {
    id: 'matching',
    title: 'Tìm kiếm sự phù hợp hoàn hảo',
    description: 'Khám phá những cơ hội việc làm phù hợp nhất với kỹ năng của bạn',
  },
  {
    id: 'recruitment',
    title: 'Tìm kiếm nhân sự phù hợp, nhanh hơn',
    description:
      'Tìm kiếm cơ hội nghề nghiệp tương thích với hồ sơ của bạn',
  },
] as const;
