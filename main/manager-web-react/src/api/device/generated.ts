/** Auto-generated from device_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../types/openapi/common';
import type {
  DeviceUpdateDTO,
  DeviceUnBindDTO,
  DeviceRegisterDTO,
  DeviceManualAddDTO,
  ResultVoid,
  ResultString,
  ResultListDeviceEntity,
} from '../../types/openapi/device';

/** 更新设备信息 */
export async function deviceUpdateUpdateDeviceInfo(
  params: { id: string | number },
  data?: DeviceUpdateDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/device/update/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.put<ResultVoid>(url, data, requestConfig);
  return res.data;
}

/** 解绑设备 */
export async function deviceUnbindUnbindDevice(
  params?: Record<string, never>,
  data?: DeviceUnBindDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/device/unbind`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultVoid>(url, data, requestConfig);
  return res.data;
}

/** 注册设备 */
export async function deviceRegisterRegisterDevice(
  params?: Record<string, never>,
  data?: DeviceRegisterDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultString> {
  const url = `/device/register`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultString>(url, data, requestConfig);
  return res.data;
}

/** 手动添加设备 */
export async function deviceManualAddManualAddDevice(
  params?: Record<string, never>,
  data?: DeviceManualAddDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/device/manual-add`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultVoid>(url, data, requestConfig);
  return res.data;
}

/** 绑定设备 */
export async function deviceBindBindDevice(
  params: { agentId: string | number; deviceCode: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/device/bind/${params.agentId}/${params.deviceCode}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultVoid>(url, undefined, requestConfig);
  return res.data;
}

/** 获取已绑定设备 */
export async function deviceBindGetUserDevices(
  params: { agentId: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultListDeviceEntity> {
  const url = `/device/bind/${params.agentId}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultListDeviceEntity>(url, requestConfig);
  return res.data;
}
