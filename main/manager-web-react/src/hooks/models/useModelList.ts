/**
 * 获取模型列表的hook
 */
import { useModelsListGetModelConfigListQuery, useModelsVoicesGetVoiceListQuery } from './generatedHooks'

export type ModelType = 'vad' | 'asr' | 'llm' | 'vllm' | 'memory' | 'intent' | 'tts'

export interface ModelConfig {
  id: number
  modelName: string
  modelType: string
  // 其他模型配置字段
}

interface UseModelListParams {
  modelType: ModelType
  page: number
  limit: number
  modelName?: string
}

export function useModelList({ modelType, page, limit, modelName }: UseModelListParams) {
  const { data, isLoading, error, refetch } = useModelsListGetModelConfigListQuery(
    {},
    {
      modelType,
      modelName,
      page,
      limit
    }
  )

  const models: ModelConfig[] = data?.data?.list || []

  return {
    models,
    total: data?.data?.total || 0,
    isLoading,
    error,
    refetch
  }
}

export function useModelVoices(modelId: string | number) {
  const enabled = Boolean(modelId) && String(modelId).length > 0
  return useModelsVoicesGetVoiceListQuery({ modelId }, { voiceName: '' }, { enabled })
}
