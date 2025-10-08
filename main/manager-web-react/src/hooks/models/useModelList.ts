/**
 * 获取模型列表（面向普通用户）
 * 说明：
 * - 原先使用 /models/list（需要 superAdmin 权限），新建普通用户无权访问，导致下拉为空。
 * - 改为使用 /models/names（normal 权限），只返回可选的模型 id 与名称，足以驱动选择。
 */
import { useModelsNamesGetModelNamesQuery, useModelsVoicesGetVoiceListQuery } from './generatedHooks'

export type ModelType = 'vad' | 'asr' | 'llm' | 'vllm' | 'memory' | 'intent' | 'tts'

export interface ModelConfig {
  id: string | number
  modelName: string
  modelType?: string
}

interface UseModelListParams {
  modelType: ModelType
  page: number
  limit: number
  modelName?: string
}

export function useModelList({ modelType, modelName }: UseModelListParams) {
  // 仅按类型与名称筛选；后端返回非分页数组
  const { data, isLoading, error, refetch } = useModelsNamesGetModelNamesQuery(
    {},
    { modelType, modelName }
  )

  const models: ModelConfig[] = (data?.data || []).map((m: any) => ({
    id: m.id,
    modelName: m.modelName,
    modelType: (m.type as string) || undefined,
  }))

  return {
    models,
    total: models.length,
    isLoading,
    error,
    refetch,
  }
}

export function useModelVoices(modelId: string | number) {
  const enabled = Boolean(modelId) && String(modelId).length > 0
  return useModelsVoicesGetVoiceListQuery({ modelId }, { voiceName: '' }, { enabled })
}
