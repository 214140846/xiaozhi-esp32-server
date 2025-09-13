/**
 * 音色管理 Hooks（使用 @tanstack/react-query）
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { timbreApi, TIMBRE_QUERY_KEY } from '@/api/timbreApi'
import type { TimbreDataDTO, TimbreListQuery, TimbreId, PageData, TimbreDetailsVO } from '@/types/timbre'

// 查询：分页获取音色列表
export function useTimbreList(query: TimbreListQuery) {
  return useQuery({
    queryKey: [TIMBRE_QUERY_KEY, query],
    queryFn: () => timbreApi.getTimbreList(query),
    select: (resp) => {
      if (resp.code === 0) return resp.data as PageData<TimbreDetailsVO>
      throw new Error(resp.msg || '获取音色列表失败')
    },
    enabled: !!query?.ttsModelId && query.page > 0 && query.limit > 0,
    staleTime: 5 * 60 * 1000,
  })
}

// 新增音色
export function useCreateTimbre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TimbreDataDTO) => timbreApi.createTimbre(payload),
    onSuccess: (resp) => {
      if (resp.code === 0) {
        qc.invalidateQueries({ queryKey: [TIMBRE_QUERY_KEY] })
      } else {
        throw new Error(resp.msg || '新增音色失败')
      }
    },
  })
}

// 更新音色
export function useUpdateTimbre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: TimbreId; data: TimbreDataDTO }) => timbreApi.updateTimbre(id, data),
    onSuccess: (resp) => {
      if (resp.code === 0) {
        qc.invalidateQueries({ queryKey: [TIMBRE_QUERY_KEY] })
      } else {
        throw new Error(resp.msg || '更新音色失败')
      }
    },
  })
}

// 删除音色（批量）
export function useDeleteTimbres() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: TimbreId[]) => timbreApi.deleteTimbres(ids),
    onSuccess: (resp) => {
      if (resp.code === 0) {
        qc.invalidateQueries({ queryKey: [TIMBRE_QUERY_KEY] })
      } else {
        throw new Error(resp.msg || '删除音色失败')
      }
    },
  })
}

