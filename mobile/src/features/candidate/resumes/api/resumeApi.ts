import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getApiBaseUrl } from '../../../../config/api';
import {
  ApiError,
  apiClient,
  getAuthenticatedHeaders,
} from '../../../../services/api/apiClient';
import type { CandidateCv, PageResponse } from '../types/resume.types';

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

export function getCvParseErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'AI_SERVICE_UNAVAILABLE') {
      return 'Dịch vụ AI đang bận. Vui lòng đợi một chút rồi thử lại.';
    }
    if (error.code === 'CV_PARSE_IN_PROGRESS') {
      return 'CV này đang được phân tích. Kéo xuống để cập nhật trạng thái.';
    }
    if (error.code === 'AI_PROCESSING_FAILED') {
      return 'AI chưa thể đọc CV này. Vui lòng kiểm tra tệp và thử lại.';
    }
    if (error.status === 408) {
      return 'Phân tích mất nhiều thời gian hơn dự kiến và có thể vẫn đang chạy. Kéo xuống để kiểm tra lại.';
    }
  }

  return error instanceof Error
    ? error.message
    : 'Không thể phân tích CV lúc này. Vui lòng thử lại.';
}

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

  parseResume(cvId: string): Promise<CandidateCv> {
    return apiClient.post<CandidateCv>(
      `/candidates/me/cvs/${encodeURIComponent(cvId)}/parse`,
      undefined,
      { timeoutMs: 90000 }
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
