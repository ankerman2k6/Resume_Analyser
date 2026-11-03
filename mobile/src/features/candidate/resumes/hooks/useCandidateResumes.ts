import { useCallback, useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { getCvParseErrorMessage, MAX_RESUME_SIZE_BYTES, resumeApi } from '../api/resumeApi';
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
  const [parsingId, setParsingId] = useState<string | null>(null);
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
      const uploadedCv = await resumeApi.uploadResume(asset);
      setResumes((current) => [uploadedCv, ...current.filter((item) => item._id !== uploadedCv._id)]);
      setTotalElements((current) => current + 1);
      setUploading(false);

      setParsingId(uploadedCv._id);
      try {
        const parsedCv = await resumeApi.parseResume(uploadedCv._id);
        setResumes((current) => current.map((item) => item._id === parsedCv._id ? parsedCv : item));
        setFeedback({
          tone: 'success',
          message: 'AI đã phân tích CV. Kinh nghiệm, kỹ năng và học vấn đã được cập nhật.',
        });
      } catch (parseError) {
        setFeedback({ tone: 'error', message: getCvParseErrorMessage(parseError) });
      } finally {
        setParsingId(null);
        await loadPage(0, 'background');
      }
    } catch (uploadError) {
      setFeedback({ tone: 'error', message: getErrorMessage(uploadError) });
    } finally {
      setUploading(false);
    }
  }, [loadPage]);

  const parseResume = useCallback(async (cvId: string) => {
    if (parsingId) return;

    setFeedback(null);
    setParsingId(cvId);
    try {
      const parsedCv = await resumeApi.parseResume(cvId);
      setResumes((current) => current.map((item) => item._id === parsedCv._id ? parsedCv : item));
      setFeedback({
        tone: 'success',
        message: 'AI đã phân tích CV. Kinh nghiệm, kỹ năng và học vấn đã được cập nhật.',
      });
    } catch (parseError) {
      setFeedback({ tone: 'error', message: getCvParseErrorMessage(parseError) });
    } finally {
      setParsingId(null);
      await loadPage(0, 'background');
    }
  }, [loadPage, parsingId]);

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
    parsingId,
    openingId,
    error,
    feedback,
    refresh,
    loadMore,
    pickAndUpload,
    parseResume,
    openResume,
  };
}
