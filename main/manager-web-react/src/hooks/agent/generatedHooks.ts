/** Auto-generated hooks for agent APIs. */
import { useQuery, useMutation } from '@tanstack/react-query'
import * as Api from '../../api/agent/generated'
import type {
  AgentUpdateDTO,
  AgentCreateDTO,
  AgentMemoryDTO,
  AgentVoicePrintSaveDTO,
  AgentVoicePrintUpdateDTO,
  AgentChatHistoryReportDTO,
  ResultAgentInfoVO,
  ResultVoid,
  ResultString,
  ResultListAgentDTO,
  ResultListAgentVoicePrintVO,
  ResultListAgentChatHistoryVO,
  ResultListAgentChatHistoryUserVO,
  ResultPageDataAgentChatSessionDTO,
} from '../../types/openapi/agent'
import type { ApiResponse } from '../../types/openapi/common'
import type { MutationOptions, QueryOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'

/** 获取智能体详情 */
export function useAgentGetAgentByIdQuery(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultAgentInfoVO>
) {
  return useQuery<ResultAgentInfoVO>({
    queryKey: ['Agent.GetAgentById', params, query],
    queryFn: () => Api.agentGetAgentById(params, query, options?.config),
    ...(options || {}),
  })
}

/** 更新智能体 */
export function useAgentUpdateMutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { id: string | number }; data?: AgentUpdateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { id: string | number }; data?: AgentUpdateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentUpdate(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 删除智能体 */
export function useAgentDeleteMutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentDelete(args.params, args.query, args.config),
    ...(options || {}),
  })
}

/** 创建智能体的声纹 */
export function useAgentVoicePrintSaveMutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: AgentVoicePrintSaveDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: AgentVoicePrintSaveDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentVoicePrintSave(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 更新智能体的对应声纹 */
export function useAgentVoicePrintUpdate1Mutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: AgentVoicePrintUpdateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: AgentVoicePrintUpdateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentVoicePrintUpdate1(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 根据设备id更新智能体 */
export function useAgentSaveMemoryUpdateByDeviceIdMutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { macAddress: string | number }; data?: AgentMemoryDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { macAddress: string | number }; data?: AgentMemoryDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentSaveMemoryUpdateByDeviceId(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 创建智能体 */
export function useAgentSave1Mutation(
  options?: MutationOptions<ResultString, unknown, { params?: Record<string, never>; data?: AgentCreateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultString, unknown, { params?: Record<string, never>; data?: AgentCreateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentSave1(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 小智服务聊天上报请求 */
export function useAgentChatHistoryReportUploadFileMutation(
  options?: MutationOptions<import('../../types/openapi/agent').ResultBoolean, unknown, { params?: Record<string, never>; data?: AgentChatHistoryReportDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<import('../../types/openapi/agent').ResultBoolean, unknown, { params?: Record<string, never>; data?: AgentChatHistoryReportDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentChatHistoryReportUploadFile(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}

/** 获取音频下载ID */
export function useAgentAudioGetAudioIdMutation(
  options?: MutationOptions<ResultString, unknown, { params: { audioId: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultString, unknown, { params: { audioId: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentAudioGetAudioId(args.params, args.query, args.config),
    ...(options || {}),
  })
}

/** 获取智能体会话列表 */
export function useAgentSessionsGetAgentSessionsQuery(
  params: { id: string | number },
  query?: { page?: number; limit?: number },
  options?: QueryOptions<ResultPageDataAgentChatSessionDTO>
) {
  return useQuery<ResultPageDataAgentChatSessionDTO>({
    queryKey: ['AgentSessions.GetAgentSessions', params, query],
    queryFn: () => Api.agentSessionsGetAgentSessions(params, query, options?.config),
    ...(options || {}),
  })
}

/** 获取智能体聊天记录 */
export function useAgentChatHistoryGetAgentChatHistoryQuery(
  params: { id: string | number; sessionId: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultListAgentChatHistoryVO>
) {
  return useQuery<ResultListAgentChatHistoryVO>({
    queryKey: ['AgentChatHistory.GetAgentChatHistory', params, query],
    queryFn: () => Api.agentChatHistoryGetAgentChatHistory(params, query, options?.config),
    ...(options || {}),
  })
}

/** 获取智能体聊天记录（用户） */
export function useAgentChatHistoryUserGetRecentlyFiftyByAgentIdQuery(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultListAgentChatHistoryUserVO>
) {
  return useQuery<ResultListAgentChatHistoryUserVO>({
    queryKey: ['AgentChatHistoryUser.GetRecentlyFiftyByAgentId', params, query],
    queryFn: () => Api.agentChatHistoryUserGetRecentlyFiftyByAgentId(params, query, options?.config),
    ...(options || {}),
  })
}

/** 获取音频内容 */
export function useAgentChatHistoryAudioGetContentByAudioIdQuery(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultString>
) {
  return useQuery<ResultString>({
    queryKey: ['AgentChatHistoryAudio.GetContentByAudioId', params, query],
    queryFn: () => Api.agentChatHistoryAudioGetContentByAudioId(params, query, options?.config),
    ...(options || {}),
  })
}

/** 获取用户指定智能体声纹列表 */
export function useAgentVoicePrintListListQuery(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultListAgentVoicePrintVO>
) {
  return useQuery<ResultListAgentVoicePrintVO>({
    queryKey: ['AgentVoicePrintList.List', params, query],
    queryFn: () => Api.agentVoicePrintListList(params, query, options?.config),
    ...(options || {}),
  })
}

/** 智能体模板模板列表 */
export function useAgentTemplateTemplateListQuery(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ApiResponse<unknown>>
) {
  return useQuery<ApiResponse<unknown>>({
    queryKey: ['AgentTemplate.TemplateList', params, query],
    queryFn: () => Api.agentTemplateTemplateList(params, query, options?.config),
    ...(options || {}),
  })
}

/** 播放音频 */
export function useAgentPlayPlayAudioQuery(
  params: { uuid: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ApiResponse<unknown>>
) {
  return useQuery<ApiResponse<unknown>>({
    queryKey: ['AgentPlay.PlayAudio', params, query],
    queryFn: () => Api.agentPlayPlayAudio(params, query, options?.config),
    ...(options || {}),
  })
}

/** 获取智能体的Mcp工具列表 */
export function useAgentMcpToolsGetAgentMcpToolsListQuery(
  params: { agentId: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ApiResponse<unknown>>
) {
  return useQuery<ApiResponse<unknown>>({
    queryKey: ['AgentMcpTools.GetAgentMcpToolsList', params, query],
    queryFn: () => Api.agentMcpToolsGetAgentMcpToolsList(params, query, options?.config),
    ...(options || {}),
  })
}

/** 获取智能体的Mcp接入点地址 */
export function useAgentMcpAddressGetAgentMcpAccessAddressQuery(
  params: { agentId: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultString>
) {
  return useQuery<ResultString>({
    queryKey: ['AgentMcpAddress.GetAgentMcpAccessAddress', params, query],
    queryFn: () => Api.agentMcpAddressGetAgentMcpAccessAddress(params, query, options?.config),
    ...(options || {}),
  })
}

/** 获取用户智能体列表 */
export function useAgentListGetUserAgentsQuery(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultListAgentDTO>
) {
  return useQuery<ResultListAgentDTO>({
    queryKey: ['AgentList.GetUserAgents', params, query],
    queryFn: () => Api.agentListGetUserAgents(params, query, options?.config),
    ...(options || {}),
  })
}

/** 智能体列表（管理员） */
export function useAgentAllAdminAgentListQuery(
  params?: Record<string, never>,
  query?: { page?: number; limit?: number },
  options?: QueryOptions<ApiResponse<unknown>>
) {
  return useQuery<ApiResponse<unknown>>({
    queryKey: ['AgentAll.AdminAgentList', params, query],
    queryFn: () => Api.agentAllAdminAgentList(params, query, options?.config),
    ...(options || {}),
  })
}

/** 删除智能体对应声纹 */
export function useAgentVoicePrintDelete1Mutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.agentVoicePrintDelete1(args.params, args.query, args.config),
    ...(options || {}),
  })
}
