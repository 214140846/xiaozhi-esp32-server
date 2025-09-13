/** Auto-generated from device_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 更新设备信息 */
export async function deviceUpdateUpdateDeviceInfo(params: { id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/device/update/${params.id}`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 解绑设备 */
export async function deviceUnbindUnbindDevice(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/device/unbind`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 注册设备 */
export async function deviceRegisterRegisterDevice(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/device/register`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 手动添加设备 */
export async function deviceManualAddManualAddDevice(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/device/manual-add`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 绑定设备 */
export async function deviceBindBindDevice(params: { agentId: string | number; deviceCode: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/device/bind/${params.agentId}/${params.deviceCode}`;
  const res = await apiClient.post<ApiResponse<any>>(url, undefined, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取已绑定设备 */
export async function deviceBindGetUserDevices(params: { agentId: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/device/bind/${params.agentId}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

