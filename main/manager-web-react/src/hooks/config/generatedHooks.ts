/** Auto-generated hooks for config APIs. */
import { useMutation } from '@tanstack/react-query'
import * as Api from '../../api/config/generated'
import type { MutationOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'
import type { AgentModelsDTO, ResultObject } from '../../types/openapi/config'

/** 服务端获取配置接口 */
export function useConfigServerBaseGetConfigMutation(
  options?: MutationOptions<ResultObject, unknown, { params?: Record<string, never>; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultObject, unknown, { params?: Record<string, never>; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.configServerBaseGetConfig(args.params, args.query, args.config),
    ...(options || {}),
  })
}

/** 获取智能体模型 */
export function useConfigAgentModelsGetAgentModelsMutation(
  options?: MutationOptions<ResultObject, unknown, { params?: Record<string, never>; data?: AgentModelsDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultObject, unknown, { params?: Record<string, never>; data?: AgentModelsDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.configAgentModelsGetAgentModels(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}
