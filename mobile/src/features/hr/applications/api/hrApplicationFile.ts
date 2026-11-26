import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getApiBaseUrl } from '../../../../config/api';
import { getAuthenticatedHeaders } from '../../../../services/api/apiClient';

export async function openApplicationCv(applicationId: string): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Xem CV được hỗ trợ trên ứng dụng iOS và Android.');
  }
  const headers = await getAuthenticatedHeaders({ Accept: 'application/pdf' });
  const target = new File(Paths.cache, `application-${applicationId}.pdf`);
  const downloaded = await File.downloadFileAsync(
    `${getApiBaseUrl()}/hr/applications/${encodeURIComponent(applicationId)}/cv/file`,
    target,
    { headers, idempotent: true },
  );
  if (await File.canPreview(downloaded, { mimeType: 'application/pdf' })) {
    await File.preview(downloaded, { title: 'CV ứng viên', mimeType: 'application/pdf' });
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(downloaded.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    return;
  }
  throw new Error('Thiết bị chưa có ứng dụng hỗ trợ mở PDF.');
}
