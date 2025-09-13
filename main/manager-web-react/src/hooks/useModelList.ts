/**
 * 模型列表管理Hook
 * 使用TanStack Query进行服务器状态管理
 */

import { useQuery } from '@tanstack/react-query'
import { ModelApi } from '@/api/modelApi'
import type {
  ModelQueryParams,
  ModelType,
  UseModelListResult
} from '@/types/model'

export const MODEL_QUERY_KEY = 'modelList'

export function useModelList(queryParams: ModelQueryParams): UseModelListResult {
  // 查询模型列表
  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [MODEL_QUERY_KEY, queryParams],
    queryFn: () => ModelApi.getModelList(queryParams),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2
  })

  const models = response?.data?.list || []
  const total = response?.data?.total || 0
  const errorMessage = error ? (error as Error).message : null

  return {
    models,
    loading: isLoading,
    error: errorMessage,
    total,
    refresh: refetch
  }
}

/**
 * 模型供应商查询Hook
 */
export function useModelProviders(modelType: ModelType) {
  
  return useQuery({
    queryKey: ['modelProviders', modelType],
    queryFn: () => ModelApi.getModelProviders(modelType),
    enabled: !!modelType,
    staleTime: 10 * 60 * 1000 // 10分钟缓存
  })
}

/**
 * 模型音色查询Hook（TTS专用）
 */
export function useModelVoices(modelId: number, voiceName?: string) {
  return useQuery({
    queryKey: ['modelVoices', modelId, voiceName],
    queryFn: () => ModelApi.getModelVoices(modelId, voiceName),
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000
  })
}

/**
 * 单个模型配置查询Hook
 */
export function useModelConfig(modelId: number) {
  return useQuery({
    queryKey: ['modelConfig', modelId],
    queryFn: () => ModelApi.getModelConfig(modelId),
    enabled: !!modelId,
    staleTime: 2 * 60 * 1000 // 2分钟缓存
  })
}