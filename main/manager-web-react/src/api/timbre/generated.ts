/** Auto-generated from timbre_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../types/openapi/common';
import type {
  TimbreDataDTO,
  ResultVoid,
  ResultPageDataTimbreDetailsVO,
} from '../../types/openapi/timbre';

/** 音色修改 */
export async function ttsVoiceUpdate(
  params: { id: string | number },
  data?: TimbreDataDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/ttsVoice/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 分页查找 */
export async function ttsVoicePage(
  params?: Record<string, never>,
  query?: { ttsModelId?: string | number; name?: string; page?: number; limit?: number },
  config?: AxiosRequestConfig
): Promise<ResultPageDataTimbreDetailsVO> {
  const url = `/ttsVoice`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultPageDataTimbreDetailsVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 音色保存 */
export async function ttsVoiceSave(
  params?: Record<string, never>,
  data?: TimbreDataDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/ttsVoice`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 音色删除 */
export async function ttsVoiceDeleteDelete(
  params?: Record<string, never>,
  data?: string[],
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/ttsVoice/delete`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}
