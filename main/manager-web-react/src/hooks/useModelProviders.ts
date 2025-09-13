import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ModelApi } from '@/api/modelApi'
import type { ModelProviderDTO, PageData, ProviderQueryParams } from '@/types/model'

// 查询 key 常量
export const PROVIDER_PAGE_QUERY_KEY = 'providerPage'
export const PROVIDER_PLUGIN_NAMES_KEY = 'providerPluginNames'

// 获取供应器分页列表
export function useProviderPage(params: ProviderQueryParams & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [PROVIDER_PAGE_QUERY_KEY, params],
    queryFn: () => ModelApi.getProviderPage(params),
    staleTime: 5 * 60 * 1000
  })
}

// 获取插件名称列表
export function useProviderPluginNames() {
  return useQuery({
    queryKey: [PROVIDER_PLUGIN_NAMES_KEY],
    queryFn: () => ModelApi.getPluginNameList(),
    staleTime: 10 * 60 * 1000
  })
}

// 供应器新增/编辑/删除
export function useProviderMutations() {
  const queryClient = useQueryClient()

  const addProvider = useMutation({
    mutationFn: (data: ModelProviderDTO) => ModelApi.addProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROVIDER_PAGE_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROVIDER_PLUGIN_NAMES_KEY] })
    }
  })

  const editProvider = useMutation({
    mutationFn: (data: ModelProviderDTO) => ModelApi.editProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROVIDER_PAGE_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROVIDER_PLUGIN_NAMES_KEY] })
    }
  })

  const deleteProviders = useMutation({
    mutationFn: (ids: string[]) => ModelApi.deleteProviders(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROVIDER_PAGE_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PROVIDER_PLUGIN_NAMES_KEY] })
    }
  })

  return { addProvider, editProvider, deleteProviders }
}

