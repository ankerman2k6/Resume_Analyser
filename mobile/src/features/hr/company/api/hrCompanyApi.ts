import type { DocumentPickerAsset } from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { apiClient } from '../../../../services/api/apiClient';
import type { HrSettingsCompany } from '../../settings/api/hrSettingsApi';

export type NewCompany = Omit<HrSettingsCompany, 'logoUrl'>;
type SavedCompany = HrSettingsCompany & { id: string; status: string };

export const hrCompanyApi = {
  async create(company: NewCompany, logo?: DocumentPickerAsset | null): Promise<SavedCompany> {
    if (!logo) return apiClient.post<SavedCompany>('/hr/company', company);

    const form = new FormData();
    form.append('company', JSON.stringify(company));
    if (Platform.OS === 'web') {
      if (!logo.file) throw new Error('Vui lòng chọn lại ảnh logo.');
      form.append('logo', logo.file, logo.name);
    } else {
      form.append('logo', new File(logo.uri), logo.name);
    }
    return apiClient.post<SavedCompany>('/hr/company', form, { timeoutMs: 60000 });
  },
};
