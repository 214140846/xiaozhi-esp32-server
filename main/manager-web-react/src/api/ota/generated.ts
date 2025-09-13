/** Auto-generated from ota_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 设备快速检查激活状态 */
export async function otaActivateActivateDevice(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/ota/activate`;
  const res = await apiClient.post<ApiResponse<any>>(url, undefined, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** OTA版本和设备激活状态检查 */
export async function otaCheckOTAVersion(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/ota/`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

