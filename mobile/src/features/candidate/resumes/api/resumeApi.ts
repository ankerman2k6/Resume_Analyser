import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getApiBaseUrl } from '../../../../config/api';
import {
  apiClient,
  getAuthenticatedHeaders,
} from '../../../../services/api/apiClient';
import type { CandidateCv, PageResponse } from '../types/resume.types';

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeFileName(value: string): string {
  const safeName = value.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;
}

function createResumeFormData(asset: DocumentPicker.DocumentPickerAsset): FormData {
  const formData = new FormData();

  if (Platform.OS === 'web' && asset.file) {
    formData.append('file', asset.file);
  } else {
    const file = new File(asset.uri);
    formData.append('file', file, asset.name);
  }

  return formData;
}

export const resumeApi = {
  getResumes(page = 0, size = 20): Promise<PageResponse<CandidateCv>> {
    return apiClient.get<PageResponse<CandidateCv>>('/candidates/me/cvs', {
      params: { page, size },
    });
  },

  uploadResume(asset: DocumentPicker.DocumentPickerAsset): Promise<CandidateCv> {
    return apiClient.post<CandidateCv>(
      '/resumes/upload',
      createResumeFormData(asset),
      { timeoutMs: 60000 }
    );
  },

  async openResume(cv: CandidateCv): Promise<void> {
    if (Platform.OS === 'web') {
      throw new Error('Tính năng xem PDF được hỗ trợ trên ứng dụng iOS và Android.');
    }

    const headers = await getAuthenticatedHeaders({ Accept: 'application/pdf' });
    const fileName = sanitizeFileName(cv.source?.fileName || `${cv.title || cv._id}.pdf`);
    const target = new File(Paths.cache, `${cv._id}-${fileName}`);
    const downloadedFile = await File.downloadFileAsync(
      `${getApiBaseUrl()}/candidates/me/cvs/${cv._id}/file`,
      target,
      { headers, idempotent: true }
    );

    if (await File.canPreview(downloadedFile, { mimeType: 'application/pdf' })) {
      await File.preview(downloadedFile, {
        title: cv.title,
        mimeType: 'application/pdf',
      });
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(downloadedFile.uri, {
        dialogTitle: `Mở ${cv.title}`,
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
      });
      return;
    }

    throw new Error('Thiết bị chưa có ứng dụng hỗ trợ mở tệp PDF.');
  },
};
