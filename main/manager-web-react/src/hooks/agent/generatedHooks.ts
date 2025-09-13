/** Auto-generated hooks for agent APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/agent/generated';

/** 获取智能体详情 */
export function useAgentGetAgentByIdQuery(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['Agent.GetAgentById', params, query], queryFn: () => Api.agentGetAgentById(params as any, query), ...(options || {}) });
}

/** 更新智能体 */
export function useAgentUpdateMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.agentUpdate(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 删除智能体 */
export function useAgentDeleteMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.agentDelete(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 创建智能体的声纹 */
export function useAgentVoicePrintSaveMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.agentVoicePrintSave(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 更新智能体的对应声纹 */
export function useAgentVoicePrintUpdate1Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.agentVoicePrintUpdate1(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 根据设备id更新智能体 */
export function useAgentSaveMemoryUpdateByDeviceIdMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { macAddress: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.agentSaveMemoryUpdateByDeviceId(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 创建智能体 */
export function useAgentSave1Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.agentSave1(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 小智服务聊天上报请求 */
export function useAgentChatHistoryReportUploadFileMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.agentChatHistoryReportUploadFile(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 获取音频下载ID */
export function useAgentAudioGetAudioIdMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { audioId: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.agentAudioGetAudioId(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 获取智能体会话列表 */
export function useAgentSessionsGetAgentSessionsQuery(params: { id: string | number }, query?: { page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['AgentSessions.GetAgentSessions', params, query], queryFn: () => Api.agentSessionsGetAgentSessions(params as any, query), ...(options || {}) });
}

/** 获取智能体聊天记录 */
export function useAgentChatHistoryGetAgentChatHistoryQuery(params: { id: string | number; sessionId: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentChatHistory.GetAgentChatHistory', params, query], queryFn: () => Api.agentChatHistoryGetAgentChatHistory(params as any, query), ...(options || {}) });
}

/** 获取智能体聊天记录（用户） */
export function useAgentChatHistoryUserGetRecentlyFiftyByAgentIdQuery(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentChatHistoryUser.GetRecentlyFiftyByAgentId', params, query], queryFn: () => Api.agentChatHistoryUserGetRecentlyFiftyByAgentId(params as any, query), ...(options || {}) });
}

/** 获取音频内容 */
export function useAgentChatHistoryAudioGetContentByAudioIdQuery(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentChatHistoryAudio.GetContentByAudioId', params, query], queryFn: () => Api.agentChatHistoryAudioGetContentByAudioId(params as any, query), ...(options || {}) });
}

/** 获取用户指定智能体声纹列表 */
export function useAgentVoicePrintListListQuery(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentVoicePrintList.List', params, query], queryFn: () => Api.agentVoicePrintListList(params as any, query), ...(options || {}) });
}

/** 智能体模板模板列表 */
export function useAgentTemplateTemplateListQuery(params?: Record<string, never>, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentTemplate.TemplateList', params, query], queryFn: () => Api.agentTemplateTemplateList(params as any, query), ...(options || {}) });
}

/** 播放音频 */
export function useAgentPlayPlayAudioQuery(params: { uuid: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentPlay.PlayAudio', params, query], queryFn: () => Api.agentPlayPlayAudio(params as any, query), ...(options || {}) });
}

/** 获取智能体的Mcp工具列表 */
export function useAgentMcpToolsGetAgentMcpToolsListQuery(params: { agentId: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentMcpTools.GetAgentMcpToolsList', params, query], queryFn: () => Api.agentMcpToolsGetAgentMcpToolsList(params as any, query), ...(options || {}) });
}

/** 获取智能体的Mcp接入点地址 */
export function useAgentMcpAddressGetAgentMcpAccessAddressQuery(params: { agentId: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentMcpAddress.GetAgentMcpAccessAddress', params, query], queryFn: () => Api.agentMcpAddressGetAgentMcpAccessAddress(params as any, query), ...(options || {}) });
}

/** 获取用户智能体列表 */
export function useAgentListGetUserAgentsQuery(params?: Record<string, never>, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AgentList.GetUserAgents', params, query], queryFn: () => Api.agentListGetUserAgents(params as any, query), ...(options || {}) });
}

/** 智能体列表（管理员） */
export function useAgentAllAdminAgentListQuery(params?: Record<string, never>, query?: { page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['AgentAll.AdminAgentList', params, query], queryFn: () => Api.agentAllAdminAgentList(params as any, query), ...(options || {}) });
}

/** 删除智能体对应声纹 */
export function useAgentVoicePrintDelete1Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.agentVoicePrintDelete1(args.params as any, args.query, args.config), ...(options || {}) });
}

