import { apiRequest } from '../../../../core/apiClient';

export type HrSettingsLocation = { address: string; city: string; country: string };
export type HrSettingsProfile = { fullName: string; email: string; phone: string; position: string };
export type HrSettingsCompany = {
  name: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  logoUrl: string;
  locations: HrSettingsLocation[];
};
export type HrSettingsData = { profile: HrSettingsProfile; company: HrSettingsCompany };

export const hrSettingsApi = {
  get: () => apiRequest<HrSettingsData>('/hr/settings'),
  update: (body: HrSettingsData) => apiRequest<HrSettingsData>('/hr/settings', {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
};
