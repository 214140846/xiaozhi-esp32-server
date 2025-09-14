/** Auto-generated from models_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse, PageData } from '../../types/openapi/common';
import type {
  ModelConfigBodyDTO,
  ModelConfigDTO,
  ModelProviderDTO,
  ResultModelConfigDTO,
  ResultModelProviderDTO,
  ResultListModelBasicInfoDTO,
  ResultListLlmModelBasicInfoDTO,
  ResultPageDataModelConfigDTO,
} from '../../types/openapi/models';

/** 编辑模型配置 */
export async function modelsEditModelConfig(
  params: { modelType: string | number; provideCode: string | number; id: string | number },
  data?: ModelConfigBodyDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultModelConfigDTO> {
  const url = `/models/${params.modelType}/${params.provideCode}/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.put<ResultModelConfigDTO>(url, data, requestConfig);
  return res.data;
}

/** 获取模型供应器列表 */
export async function modelsProviderGetListPage(
  params?: Record<string, never>,
  query?: { modelProviderDTO?: Partial<ModelProviderDTO>; page?: string | number; limit?: string | number },
  config?: AxiosRequestConfig
): Promise<ApiResponse<PageData<ModelProviderDTO>>> {
  const url = `/models/provider`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ApiResponse<PageData<ModelProviderDTO>>>(url, requestConfig);
  return res.data;
}

/** 新增模型供应器 */
export async function modelsProviderAdd(
  params?: Record<string, never>,
  data?: ModelProviderDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultModelProviderDTO> {
  const url = `/models/provider`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultModelProviderDTO>(url, data, requestConfig);
  return res.data;
}

/** 修改模型供应器 */
export async function modelsProviderEdit(
  params?: Record<string, never>,
  data?: ModelProviderDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultModelProviderDTO> {
  const url = `/models/provider`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.put<ResultModelProviderDTO>(url, data, requestConfig);
  return res.data;
}

/** 启用/关闭模型配置 */
export async function modelsEnableEnableModelConfig(
  params: { id: string | number; status: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ApiResponse<undefined>> {
  const url = `/models/enable/${params.id}/${params.status}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.put<ApiResponse<undefined>>(url, undefined, requestConfig);
  return res.data;
}

/** 设置默认模型 */
export async function modelsDefaultSetDefaultModel(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ApiResponse<undefined>> {
  const url = `/models/default/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.put<ApiResponse<undefined>>(url, undefined, requestConfig);
  return res.data;
}

/** 新增模型配置 */
export async function modelsAddModelConfig(
  params: { modelType: string | number; provideCode: string | number },
  data?: ModelConfigBodyDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultModelConfigDTO> {
  const url = `/models/${params.modelType}/${params.provideCode}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultModelConfigDTO>(url, data, requestConfig);
  return res.data;
}

/** 删除模型供应器 */
export async function modelsProviderDeleteDelete(
  params?: Record<string, never>,
  data?: string[],
  query?: { ids?: string[] },
  config?: AxiosRequestConfig
): Promise<ApiResponse<undefined>> {
  const url = `/models/provider/delete`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ApiResponse<undefined>>(url, data, requestConfig);
  return res.data;
}

/** 获取模型供应器列表 */
export async function modelsProvideTypesGetModelProviderList(
  params: { modelType: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultModelProviderDTO> {
  const url = `/models/${params.modelType}/provideTypes`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultModelProviderDTO>(url, requestConfig);
  return res.data;
}

/** 获取模型音色 */
export async function modelsVoicesGetVoiceList(
  params: { modelId: string | number },
  query?: { voiceName?: string },
  config?: AxiosRequestConfig
): Promise<ResultListModelBasicInfoDTO> {
  const url = `/models/${params.modelId}/voices`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultListModelBasicInfoDTO>(url, requestConfig);
  return res.data;
}

/** 获取模型配置 */
export async function modelsGetModelConfig(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultModelConfigDTO> {
  const url = `/models/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultModelConfigDTO>(url, requestConfig);
  return res.data;
}

/** 删除模型配置 */
export async function modelsDeleteModelConfig(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ApiResponse<undefined>> {
  const url = `/models/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.delete<ApiResponse<undefined>>(url, requestConfig);
  return res.data;
}

/**  */
export async function modelsProviderPluginNamesGetPluginNameList(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ApiResponse<string[]>> {
  const url = `/models/provider/plugin/names`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ApiResponse<string[]>>(url, requestConfig);
  return res.data;
}

/** 获取所有模型名称 */
export async function modelsNamesGetModelNames(
  params?: Record<string, never>,
  query?: { modelType?: string; modelName?: string },
  config?: AxiosRequestConfig
): Promise<ResultListModelBasicInfoDTO> {
  const url = `/models/names`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultListModelBasicInfoDTO>(url, requestConfig);
  return res.data;
}

/** 获取LLM模型信息 */
export async function modelsLlmNamesGetLlmModelCodeList(
  params?: Record<string, never>,
  query?: { modelName?: string },
  config?: AxiosRequestConfig
): Promise<ResultListLlmModelBasicInfoDTO> {
  const url = `/models/llm/names`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultListLlmModelBasicInfoDTO>(url, requestConfig);
  return res.data;
}

/** 获取模型配置列表 */
export async function modelsListGetModelConfigList(
  params?: Record<string, never>,
  query?: { modelType?: string; modelName?: string; page?: string | number; limit?: string | number },
  config?: AxiosRequestConfig
): Promise<ResultPageDataModelConfigDTO> {
  const url = `/models/list`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultPageDataModelConfigDTO>(url, requestConfig);
  return res.data;
}
