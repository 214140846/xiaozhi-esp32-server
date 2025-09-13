/** Auto-generated from timbre_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 音色修改 */
export async function ttsVoiceUpdate(params: { id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/ttsVoice/${params.id}`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 分页查找 */
export async function ttsVoicePage(params?: Record<string, never>, query?: { ttsModelId?: any; name?: any; page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/ttsVoice`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 音色保存 */
export async function ttsVoiceSave(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/ttsVoice`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 音色删除 */
export async function ttsVoiceDeleteDelete(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/ttsVoice/delete`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

