/** Auto-generated hooks for models APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/models/generated';

/** 编辑模型配置 */
export function useModelsEditModelConfigMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { modelType: string | number; provideCode: string | number; id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.modelsEditModelConfig(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 获取模型供应器列表 */
export function useModelsProviderGetListPageQuery(params?: Record<string, never>, query?: { modelProviderDTO?: any; page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['ModelsProvider.GetListPage', params, query], queryFn: () => Api.modelsProviderGetListPage(params as any, query), ...(options || {}) });
}

/** 新增模型供应器 */
export function useModelsProviderAddMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.modelsProviderAdd(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 修改模型供应器 */
export function useModelsProviderEditMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.modelsProviderEdit(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 启用/关闭模型配置 */
export function useModelsEnableEnableModelConfigMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number; status: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.modelsEnableEnableModelConfig(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 设置默认模型 */
export function useModelsDefaultSetDefaultModelMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.modelsDefaultSetDefaultModel(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 新增模型配置 */
export function useModelsAddModelConfigMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { modelType: string | number; provideCode: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.modelsAddModelConfig(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 删除模型供应器 */
export function useModelsProviderDeleteDeleteMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: { ids?: any }, config?: any }) => Api.modelsProviderDeleteDelete(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 获取模型供应器列表 */
export function useModelsProvideTypesGetModelProviderListQuery(params: { modelType: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['ModelsProvideTypes.GetModelProviderList', params, query], queryFn: () => Api.modelsProvideTypesGetModelProviderList(params as any, query), ...(options || {}) });
}

/** 获取模型音色 */
export function useModelsVoicesGetVoiceListQuery(params: { modelId: string | number }, query?: { voiceName?: any }, options?: any) {
  return useQuery({ queryKey: ['ModelsVoices.GetVoiceList', params, query], queryFn: () => Api.modelsVoicesGetVoiceList(params as any, query), ...(options || {}) });
}

/** 获取模型配置 */
export function useModelsGetModelConfigQuery(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['Models.GetModelConfig', params, query], queryFn: () => Api.modelsGetModelConfig(params as any, query), ...(options || {}) });
}

/** 删除模型配置 */
export function useModelsDeleteModelConfigMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.modelsDeleteModelConfig(args.params as any, args.query, args.config), ...(options || {}) });
}

/**  */
export function useModelsProviderPluginNamesGetPluginNameListQuery(params?: Record<string, never>, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['ModelsProviderPluginNames.GetPluginNameList', params, query], queryFn: () => Api.modelsProviderPluginNamesGetPluginNameList(params as any, query), ...(options || {}) });
}

/** 获取所有模型名称 */
export function useModelsNamesGetModelNamesQuery(params?: Record<string, never>, query?: { modelType?: any; modelName?: any }, options?: any) {
  return useQuery({ queryKey: ['ModelsNames.GetModelNames', params, query], queryFn: () => Api.modelsNamesGetModelNames(params as any, query), ...(options || {}) });
}

/** 获取LLM模型信息 */
export function useModelsLlmNamesGetLlmModelCodeListQuery(params?: Record<string, never>, query?: { modelName?: any }, options?: any) {
  return useQuery({ queryKey: ['ModelsLlmNames.GetLlmModelCodeList', params, query], queryFn: () => Api.modelsLlmNamesGetLlmModelCodeList(params as any, query), ...(options || {}) });
}

/** 获取模型配置列表 */
export function useModelsListGetModelConfigListQuery(params?: Record<string, never>, query?: { modelType?: any; modelName?: any; page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['ModelsList.GetModelConfigList', params, query], queryFn: () => Api.modelsListGetModelConfigList(params as any, query), ...(options || {}) });
}

