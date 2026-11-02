import { useCallback, useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { MAX_RESUME_SIZE_BYTES, resumeApi } from '../api/resumeApi';
import type { CandidateCv } from '../types/resume.types';

type LoadMode = 'initial' | 'refresh' | 'more' | 'background';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

function validatePdf(asset: DocumentPicker.DocumentPickerAsset): string | null {
  if (!asset.name.toLowerCase().endsWith('.pdf')) {
    return 'Chỉ chấp nhận tệp có định dạng .pdf.';
  }

  if (asset.mimeType && asset.mimeType !== 'application/pdf' && asset.mimeType !== 'application/x-pdf') {
    return 'Tệp đã chọn không có định dạng PDF hợp lệ.';
  }

  if (asset.size !== undefined && asset.size > MAX_RESUME_SIZE_BYTES) {
    return 'Kích thước tệp không được vượt quá 5 MB.';
  }

  return null;
}

export function useCandidateResumes() {
  const [resumes, setResumes] = useState<CandidateCv[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const loadPage = useCallback(async (pageIndex: number, mode: LoadMode) => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'more') setLoadingMore(true);

    try {
      if (mode !== 'more') setError(null);
      const response = await resumeApi.getResumes(pageIndex);
      const nextItems = response.content || [];

      setResumes((current) => {
        if (mode !== 'more') return nextItems;
        const existingIds = new Set(current.map((item) => item._id));
        return [...current, ...nextItems.filter((item) => !existingIds.has(item._id))];
      });
      setPage(response.page ?? pageIndex);
      setTotalElements(response.totalElements ?? nextItems.length);
      setIsLastPage(response.last ?? true);
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      if (mode === 'initial' || mode === 'refresh') setError(message);
      if (mode === 'more') setFeedback({ tone: 'error', message });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(0, 'initial');
  }, [loadPage]);

  const refresh = useCallback(() => {
    setFeedback(null);
    return loadPage(0, 'refresh');
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!isLastPage && !loadingMore && !loading) {
      loadPage(page + 1, 'more');
    }
  }, [isLastPage, loadPage, loading, loadingMore, page]);

  const pickAndUpload = useCallback(async () => {
    setFeedback(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const validationMessage = validatePdf(asset);
      if (validationMessage) {
        setFeedback({ tone: 'error', message: validationMessage });
        return;
      }

      setUploading(true);
      await resumeApi.uploadResume(asset);
      setFeedback({ tone: 'success', message: 'CV đã được tải lên thành công.' });
      await loadPage(0, 'background');
    } catch (uploadError) {
      setFeedback({ tone: 'error', message: getErrorMessage(uploadError) });
    } finally {
      setUploading(false);
    }
  }, [loadPage]);

  const openResume = useCallback(async (cv: CandidateCv) => {
    setFeedback(null);
    setOpeningId(cv._id);

    try {
      await resumeApi.openResume(cv);
    } catch (openError) {
      setFeedback({ tone: 'error', message: getErrorMessage(openError) });
    } finally {
      setOpeningId(null);
    }
  }, []);

  return {
    resumes,
    totalElements,
    loading,
    refreshing,
    loadingMore,
    uploading,
    openingId,
    error,
    feedback,
    refresh,
    loadMore,
    pickAndUpload,
    openResume,
  };
}
