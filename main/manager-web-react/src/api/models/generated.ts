/** Auto-generated from models_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 编辑模型配置 */
export async function modelsEditModelConfig(params: { modelType: string | number; provideCode: string | number; id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/${params.modelType}/${params.provideCode}/${params.id}`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取模型供应器列表 */
export async function modelsProviderGetListPage(params?: Record<string, never>, query?: { modelProviderDTO?: any; page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/provider`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 新增模型供应器 */
export async function modelsProviderAdd(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/provider`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 修改模型供应器 */
export async function modelsProviderEdit(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/provider`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 启用/关闭模型配置 */
export async function modelsEnableEnableModelConfig(params: { id: string | number; status: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/enable/${params.id}/${params.status}`;
  const res = await apiClient.put<ApiResponse<any>>(url, undefined, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 设置默认模型 */
export async function modelsDefaultSetDefaultModel(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/default/${params.id}`;
  const res = await apiClient.put<ApiResponse<any>>(url, undefined, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 新增模型配置 */
export async function modelsAddModelConfig(params: { modelType: string | number; provideCode: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/${params.modelType}/${params.provideCode}`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 删除模型供应器 */
export async function modelsProviderDeleteDelete(params?: Record<string, never>, data?: any, query?: { ids?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/provider/delete`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取模型供应器列表 */
export async function modelsProvideTypesGetModelProviderList(params: { modelType: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/${params.modelType}/provideTypes`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取模型音色 */
export async function modelsVoicesGetVoiceList(params: { modelId: string | number }, query?: { voiceName?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/${params.modelId}/voices`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取模型配置 */
export async function modelsGetModelConfig(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/${params.id}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 删除模型配置 */
export async function modelsDeleteModelConfig(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/${params.id}`;
  const res = await apiClient.delete<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/**  */
export async function modelsProviderPluginNamesGetPluginNameList(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/provider/plugin/names`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取所有模型名称 */
export async function modelsNamesGetModelNames(params?: Record<string, never>, query?: { modelType?: any; modelName?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/names`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取LLM模型信息 */
export async function modelsLlmNamesGetLlmModelCodeList(params?: Record<string, never>, query?: { modelName?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/llm/names`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取模型配置列表 */
export async function modelsListGetModelConfigList(params?: Record<string, never>, query?: { modelType?: any; modelName?: any; page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/models/list`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

