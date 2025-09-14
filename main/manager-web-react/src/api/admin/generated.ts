/** Auto-generated from admin_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../types/openapi/common';
import type { SysDictDataVO, ResultPageDataSysDictDataVO, ResultPageDataUserShowDeviceListVO } from '../../types/openapi/admin';

/** 重置密码 */
export async function adminUsersUpdate(params: { id: string | number }, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultString> {
  const url = `/admin/users/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<import('../../types/openapi/admin').ResultString>(url, undefined, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 用户删除 */
export async function adminUsersDelete(params: { id: string | number }, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/users/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.delete<import('../../types/openapi/admin').ResultVoid>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 批量修改用户状态 */
export async function adminUsersChangeStatusChangeStatus(params: { status: string | number }, data?: string[], query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/users/changeStatus/${params.status}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 保存 */
export async function adminParamsSave(params?: Record<string, never>, data?: import('../../types/openapi/admin').SysParamsDTO, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/params`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 修改 */
export async function adminParamsUpdate1(params?: Record<string, never>, data?: import('../../types/openapi/admin').SysParamsDTO, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/params`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 修改字典类型 */
export async function adminDictTypeUpdateUpdate2(params?: Record<string, never>, data?: import('../../types/openapi/admin').SysDictTypeDTO, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/dict/type/update`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 修改字典数据 */
export async function adminDictDataUpdateUpdate3(params?: Record<string, never>, data?: import('../../types/openapi/admin').SysDictDataDTO, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/dict/data/update`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 通知python服务端更新配置 */
export async function adminServerEmitActionEmitServerAction(params?: Record<string, never>, data?: { action?: string; targetWs?: string }, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultBoolean> {
  const url = `/admin/server/emit-action`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<import('../../types/openapi/admin').ResultBoolean>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 删除 */
export async function adminParamsDeleteDelete1(params?: Record<string, never>, data?: string[], query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/params/delete`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 保存字典类型 */
export async function adminDictTypeSaveSave1(params?: Record<string, never>, data?: import('../../types/openapi/admin').SysDictTypeDTO, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/dict/type/save`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 删除字典类型 */
export async function adminDictTypeDeleteDelete2(params?: Record<string, never>, data?: string[], query?: { ids?: string[] }, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/dict/type/delete`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 新增字典数据 */
export async function adminDictDataSaveSave2(params?: Record<string, never>, data?: import('../../types/openapi/admin').SysDictDataDTO, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/dict/data/save`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 删除字典数据 */
export async function adminDictDataDeleteDelete3(params?: Record<string, never>, data?: number[], query?: { ids?: number[] }, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultVoid> {
  const url = `/admin/dict/data/delete`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<import('../../types/openapi/admin').ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 分页查找用户 */
export async function adminUsersPageUser(params?: Record<string, never>, query?: { mobile?: string; page?: number; limit?: number }, config?: AxiosRequestConfig): Promise<ApiResponse<unknown>> {
  const url = `/admin/users`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ApiResponse<unknown>>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取Ws服务端列表 */
export async function adminServerServerListGetWsServerList(params?: Record<string, never>, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultListString> {
  const url = `/admin/server/server-list`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<import('../../types/openapi/admin').ResultListString>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 信息 */
export async function adminParamsGet(params: { id: string | number }, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultSysParamsDTO> {
  const url = `/admin/params/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<import('../../types/openapi/admin').ResultSysParamsDTO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 分页 */
export async function adminParamsPagePage(params?: Record<string, never>, query?: { page?: number; limit?: number; orderField?: string; order?: string; paramCode?: string }, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultPageDataSysParamsDTO> {
  const url = `/admin/params/page`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<import('../../types/openapi/admin').ResultPageDataSysParamsDTO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取字典类型详情 */
export async function adminDictTypeGet1(params: { id: string | number }, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultSysDictTypeVO> {
  const url = `/admin/dict/type/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<import('../../types/openapi/admin').ResultSysDictTypeVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 分页查询字典类型 */
export async function adminDictTypePagePage1(params?: Record<string, never>, query?: { dictType?: string; dictName?: string; page?: number; limit?: number }, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultPageDataSysDictTypeVO> {
  const url = `/admin/dict/type/page`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<import('../../types/openapi/admin').ResultPageDataSysDictTypeVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取字典数据详情 */
export async function adminDictDataGet2(params: { id: string | number }, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<import('../../types/openapi/admin').ResultSysDictDataVO> {
  const url = `/admin/dict/data/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<import('../../types/openapi/admin').ResultSysDictDataVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取字典数据列表 */
export async function adminDictDataTypeGetDictDataByType(params: { dictType: string | number }, query?: Record<string, unknown> | undefined, config?: AxiosRequestConfig): Promise<ApiResponse<SysDictDataVO[]>> {
  const url = `/admin/dict/data/type/${params.dictType}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ApiResponse<SysDictDataVO[]>>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 分页查询字典数据 */
export async function adminDictDataPagePage2(params?: Record<string, never>, query?: { dictTypeId?: number; dictLabel?: string; dictValue?: string; page?: number; limit?: number }, config?: AxiosRequestConfig): Promise<ResultPageDataSysDictDataVO> {
  const url = `/admin/dict/data/page`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultPageDataSysDictDataVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 分页查找设备 */
export async function adminDeviceAllPageDevice(params?: Record<string, never>, query?: { keywords?: string; page?: number; limit?: number }, config?: AxiosRequestConfig): Promise<ResultPageDataUserShowDeviceListVO> {
  const url = `/admin/device/all`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultPageDataUserShowDeviceListVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}
