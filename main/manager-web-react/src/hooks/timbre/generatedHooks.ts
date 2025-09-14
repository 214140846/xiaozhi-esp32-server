/** Auto-generated hooks for timbre APIs. */
import { useQuery, useMutation } from '@tanstack/react-query'
import * as Api from '../../api/timbre/generated'
import type { TimbreDataDTO, ResultVoid, ResultPageDataTimbreDetailsVO } from '../../types/openapi/timbre'
import type { MutationOptions, QueryOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'

/** 音色修改 */
export function useTtsVoiceUpdateMutation(
  options?: MutationOptions<ResultVoid, Error, { params: { id: string | number }; data?: TimbreDataDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, Error, { params: { id: string | number }; data?: TimbreDataDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.ttsVoiceUpdate(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 分页查找 */
export function useTtsVoicePageQuery(
  params?: Record<string, never>,
  query?: { ttsModelId?: string | number; name?: string; page?: number; limit?: number },
  options?: QueryOptions<ResultPageDataTimbreDetailsVO>
) {
  return useQuery<ResultPageDataTimbreDetailsVO>({
    queryKey: ['TtsVoice.Page', params, query],
    queryFn: () => Api.ttsVoicePage(params, query, options?.config),
    ...(options || {}),
  })
}

/** 音色保存 */
export function useTtsVoiceSaveMutation(
  options?: MutationOptions<ResultVoid, Error, { params?: Record<string, never>; data?: TimbreDataDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, Error, { params?: Record<string, never>; data?: TimbreDataDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.ttsVoiceSave(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 音色删除 */
export function useTtsVoiceDeleteDeleteMutation(
  options?: MutationOptions<ResultVoid, Error, { params?: Record<string, never>; data?: string[]; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, Error, { params?: Record<string, never>; data?: string[]; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.ttsVoiceDeleteDelete(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}
