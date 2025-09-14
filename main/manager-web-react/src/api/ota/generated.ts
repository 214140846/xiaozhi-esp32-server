/** Auto-generated from ota_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type { DeviceReportReqDTO } from '../../types/openapi/ota';

/** 设备快速检查激活状态 */
export async function otaActivateActivateDevice(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<string> {
  const url = `/ota/activate`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<string>(url, undefined, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** OTA版本和设备激活状态检查 */
export async function otaCheckOTAVersion(
  params?: Record<string, never>,
  data?: DeviceReportReqDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<string> {
  const url = `/ota/`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<string>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}
