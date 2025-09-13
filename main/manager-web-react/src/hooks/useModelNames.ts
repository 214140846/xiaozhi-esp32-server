import { useQuery } from '@tanstack/react-query'
import { ModelApi } from '@/api/modelApi'
import type { ModelType } from '@/types/model'

export const MODEL_NAMES_QUERY_KEY = 'modelNames'
export const LLM_NAMES_QUERY_KEY = 'llmNames'

export function useModelNames(modelType: ModelType, modelName?: string) {
  return useQuery({
    queryKey: [MODEL_NAMES_QUERY_KEY, modelType, modelName],
    queryFn: () => ModelApi.getModelNames(modelType, modelName),
    enabled: !!modelType,
    staleTime: 5 * 60 * 1000
  })
}

export function useLlmModelNames(modelName?: string) {
  return useQuery({
    queryKey: [LLM_NAMES_QUERY_KEY, modelName],
    queryFn: () => ModelApi.getLlmModelCodeList(modelName),
    staleTime: 5 * 60 * 1000
  })
}

