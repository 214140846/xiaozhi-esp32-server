/** Auto-generated hooks for models APIs. */
import { useQuery, useMutation } from '@tanstack/react-query'
import * as Api from '../../api/models/generated'
import type {
  ModelConfigBodyDTO,
  ModelProviderDTO,
  ResultModelConfigDTO,
  ResultModelProviderDTO,
  ResultListModelBasicInfoDTO,
  ResultListLlmModelBasicInfoDTO,
  ResultPageDataModelConfigDTO,
} from '../../types/openapi/models';
import type { ApiResponse, PageData } from '../../types/openapi/common'
import type { MutationOptions, QueryOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'

/** 编辑模型配置 */
export function useModelsEditModelConfigMutation(
  options?: MutationOptions<ResultModelConfigDTO, unknown, { params: { modelType: string | number; provideCode: string | number; id: string | number }; data?: ModelConfigBodyDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultModelConfigDTO, unknown, { params: { modelType: string | number; provideCode: string | number; id: string | number }; data?: ModelConfigBodyDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.modelsEditModelConfig(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 获取模型供应器列表 */
export function useModelsProviderGetListPageQuery(
  params?: Record<string, never>,
  query?: { modelProviderDTO?: Partial<ModelProviderDTO>; page?: string | number; limit?: string | number },
  options?: QueryOptions<ApiResponse<PageData<ModelProviderDTO>>>
) {
  return useQuery<ApiResponse<PageData<ModelProviderDTO>>>(
    { queryKey: ['ModelsProvider.GetListPage', params, query], queryFn: () => Api.modelsProviderGetListPage(params, query, options?.config), ...(options || {}) }
  )
}

/** 新增模型供应器 */
export function useModelsProviderAddMutation(
  options?: MutationOptions<ResultModelProviderDTO, unknown, { params?: Record<string, never>; data?: ModelProviderDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultModelProviderDTO, unknown, { params?: Record<string, never>; data?: ModelProviderDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    { mutationFn: (args) => Api.modelsProviderAdd(args.params, args.data, args.query, args.config), ...(options || {}) }
  )
}

/** 修改模型供应器 */
export function useModelsProviderEditMutation(
  options?: MutationOptions<ResultModelProviderDTO, unknown, { params?: Record<string, never>; data?: ModelProviderDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultModelProviderDTO, unknown, { params?: Record<string, never>; data?: ModelProviderDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    { mutationFn: (args) => Api.modelsProviderEdit(args.params, args.data, args.query, args.config), ...(options || {}) }
  )
}

/** 启用/关闭模型配置 */
export function useModelsEnableEnableModelConfigMutation(
  options?: MutationOptions<ApiResponse<undefined>, unknown, { params: { id: string | number; status: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ApiResponse<undefined>, unknown, { params: { id: string | number; status: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    { mutationFn: (args) => Api.modelsEnableEnableModelConfig(args.params, args.query, args.config), ...(options || {}) }
  )
}

/** 设置默认模型 */
export function useModelsDefaultSetDefaultModelMutation(
  options?: MutationOptions<ApiResponse<undefined>, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ApiResponse<undefined>, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    { mutationFn: (args) => Api.modelsDefaultSetDefaultModel(args.params, args.query, args.config), ...(options || {}) }
  )
}

/** 新增模型配置 */
export function useModelsAddModelConfigMutation(
  options?: MutationOptions<ResultModelConfigDTO, unknown, { params: { modelType: string | number; provideCode: string | number }; data?: ModelConfigBodyDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultModelConfigDTO, unknown, { params: { modelType: string | number; provideCode: string | number }; data?: ModelConfigBodyDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    { mutationFn: (args) => Api.modelsAddModelConfig(args.params, args.data, args.query, args.config), ...(options || {}) }
  )
}

/** 删除模型供应器 */
export function useModelsProviderDeleteDeleteMutation(
  options?: MutationOptions<ApiResponse<undefined>, unknown, { params?: Record<string, never>; data?: string[]; query?: { ids?: string[] }; config?: AxiosRequestConfig }>
) {
  return useMutation<ApiResponse<undefined>, unknown, { params?: Record<string, never>; data?: string[]; query?: { ids?: string[] }; config?: AxiosRequestConfig }>(
    { mutationFn: (args) => Api.modelsProviderDeleteDelete(args.params, args.data, args.query, args.config), ...(options || {}) }
  )
}

/** 获取模型供应器列表 */
export function useModelsProvideTypesGetModelProviderListQuery(
  params: { modelType: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultModelProviderDTO>
) {
  return useQuery<ResultModelProviderDTO>({ queryKey: ['ModelsProvideTypes.GetModelProviderList', params, query], queryFn: () => Api.modelsProvideTypesGetModelProviderList(params, query, options?.config), ...(options || {}) })
}

/** 获取模型音色 */
export function useModelsVoicesGetVoiceListQuery(
  params: { modelId: string | number },
  query?: { voiceName?: string },
  options?: QueryOptions<ResultListModelBasicInfoDTO>
) {
  return useQuery<ResultListModelBasicInfoDTO>({ queryKey: ['ModelsVoices.GetVoiceList', params, query], queryFn: () => Api.modelsVoicesGetVoiceList(params, query, options?.config), ...(options || {}) })
}

/** 获取模型配置 */
export function useModelsGetModelConfigQuery(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultModelConfigDTO>
) {
  return useQuery<ResultModelConfigDTO>({ queryKey: ['Models.GetModelConfig', params, query], queryFn: () => Api.modelsGetModelConfig(params, query, options?.config), ...(options || {}) })
}

/** 删除模型配置 */
export function useModelsDeleteModelConfigMutation(
  options?: MutationOptions<ApiResponse<undefined>, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ApiResponse<undefined>, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.modelsDeleteModelConfig(args.params, args.query, args.config),
    ...(options || {}),
  })
}

/**  */
export function useModelsProviderPluginNamesGetPluginNameListQuery(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ApiResponse<string[]>>
) {
  return useQuery<ApiResponse<string[]>>({ queryKey: ['ModelsProviderPluginNames.GetPluginNameList', params, query], queryFn: () => Api.modelsProviderPluginNamesGetPluginNameList(params, query, options?.config), ...(options || {}) })
}

/** 获取所有模型名称 */
export function useModelsNamesGetModelNamesQuery(
  params?: Record<string, never>,
  query?: { modelType?: string; modelName?: string },
  options?: QueryOptions<ResultListModelBasicInfoDTO>
) {
  return useQuery<ResultListModelBasicInfoDTO>({ queryKey: ['ModelsNames.GetModelNames', params, query], queryFn: () => Api.modelsNamesGetModelNames(params, query, options?.config), ...(options || {}) })
}

/** 获取LLM模型信息 */
export function useModelsLlmNamesGetLlmModelCodeListQuery(
  params?: Record<string, never>,
  query?: { modelName?: string },
  options?: QueryOptions<ResultListLlmModelBasicInfoDTO>
) {
  return useQuery<ResultListLlmModelBasicInfoDTO>({ queryKey: ['ModelsLlmNames.GetLlmModelCodeList', params, query], queryFn: () => Api.modelsLlmNamesGetLlmModelCodeList(params, query, options?.config), ...(options || {}) })
}

/** 获取模型配置列表 */
export function useModelsListGetModelConfigListQuery(
  params?: Record<string, never>,
  query?: { modelType?: string; modelName?: string; page?: string | number; limit?: string | number },
  options?: QueryOptions<ResultPageDataModelConfigDTO>
) {
  return useQuery<ResultPageDataModelConfigDTO>({ queryKey: ['ModelsList.GetModelConfigList', params, query], queryFn: () => Api.modelsListGetModelConfigList(params, query, options?.config), ...(options || {}) })
}
