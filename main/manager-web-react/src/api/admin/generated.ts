/** Auto-generated from admin_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 重置密码 */
export async function adminUsersUpdate(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/users/${params.id}`;
  const res = await apiClient.put<ApiResponse<any>>(url, undefined, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 用户删除 */
export async function adminUsersDelete(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/users/${params.id}`;
  const res = await apiClient.delete<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 批量修改用户状态 */
export async function adminUsersChangeStatusChangeStatus(params: { status: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/users/changeStatus/${params.status}`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 保存 */
export async function adminParamsSave(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/params`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 修改 */
export async function adminParamsUpdate1(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/params`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 修改字典类型 */
export async function adminDictTypeUpdateUpdate2(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/type/update`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 修改字典数据 */
export async function adminDictDataUpdateUpdate3(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/data/update`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 通知python服务端更新配置 */
export async function adminServerEmitActionEmitServerAction(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/server/emit-action`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 删除 */
export async function adminParamsDeleteDelete1(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/params/delete`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 保存字典类型 */
export async function adminDictTypeSaveSave1(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/type/save`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 删除字典类型 */
export async function adminDictTypeDeleteDelete2(params?: Record<string, never>, data?: any, query?: { ids?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/type/delete`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 新增字典数据 */
export async function adminDictDataSaveSave2(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/data/save`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 删除字典数据 */
export async function adminDictDataDeleteDelete3(params?: Record<string, never>, data?: any, query?: { ids?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/data/delete`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 分页查找用户 */
export async function adminUsersPageUser(params?: Record<string, never>, query?: { mobile?: any; page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/users`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取Ws服务端列表 */
export async function adminServerServerListGetWsServerList(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/server/server-list`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 信息 */
export async function adminParamsGet(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/params/${params.id}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 分页 */
export async function adminParamsPagePage(params?: Record<string, never>, query?: { page?: any; limit?: any; orderField?: any; order?: any; paramCode?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/params/page`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取字典类型详情 */
export async function adminDictTypeGet1(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/type/${params.id}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 分页查询字典类型 */
export async function adminDictTypePagePage1(params?: Record<string, never>, query?: { dictType?: any; dictName?: any; page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/type/page`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取字典数据详情 */
export async function adminDictDataGet2(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/data/${params.id}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取字典数据列表 */
export async function adminDictDataTypeGetDictDataByType(params: { dictType: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/data/type/${params.dictType}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 分页查询字典数据 */
export async function adminDictDataPagePage2(params?: Record<string, never>, query?: { dictTypeId?: any; dictLabel?: any; dictValue?: any; page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/dict/data/page`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 分页查找设备 */
export async function adminDeviceAllPageDevice(params?: Record<string, never>, query?: { keywords?: any; page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/admin/device/all`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

