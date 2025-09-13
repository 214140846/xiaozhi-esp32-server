/** Auto-generated from agent_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 获取智能体详情 */
export async function agentGetAgentById(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/${params.id}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 更新智能体 */
export async function agentUpdate(params: { id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/${params.id}`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 删除智能体 */
export async function agentDelete(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/${params.id}`;
  const res = await apiClient.delete<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 创建智能体的声纹 */
export async function agentVoicePrintSave(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/voice-print`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 更新智能体的对应声纹 */
export async function agentVoicePrintUpdate1(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/voice-print`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 根据设备id更新智能体 */
export async function agentSaveMemoryUpdateByDeviceId(params: { macAddress: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/saveMemory/${params.macAddress}`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 创建智能体 */
export async function agentSave1(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 小智服务聊天上报请求 */
export async function agentChatHistoryReportUploadFile(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/chat-history/report`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取音频下载ID */
export async function agentAudioGetAudioId(params: { audioId: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/audio/${params.audioId}`;
  const res = await apiClient.post<ApiResponse<any>>(url, undefined, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取智能体会话列表 */
export async function agentSessionsGetAgentSessions(params: { id: string | number }, query?: { page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/${params.id}/sessions`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取智能体聊天记录 */
export async function agentChatHistoryGetAgentChatHistory(params: { id: string | number; sessionId: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/${params.id}/chat-history/${params.sessionId}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取智能体聊天记录（用户） */
export async function agentChatHistoryUserGetRecentlyFiftyByAgentId(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/${params.id}/chat-history/user`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取音频内容 */
export async function agentChatHistoryAudioGetContentByAudioId(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/${params.id}/chat-history/audio`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取用户指定智能体声纹列表 */
export async function agentVoicePrintListList(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/voice-print/list/${params.id}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 智能体模板模板列表 */
export async function agentTemplateTemplateList(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/template`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 播放音频 */
export async function agentPlayPlayAudio(params: { uuid: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/play/${params.uuid}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取智能体的Mcp工具列表 */
export async function agentMcpToolsGetAgentMcpToolsList(params: { agentId: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/mcp/tools/${params.agentId}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取智能体的Mcp接入点地址 */
export async function agentMcpAddressGetAgentMcpAccessAddress(params: { agentId: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/mcp/address/${params.agentId}`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取用户智能体列表 */
export async function agentListGetUserAgents(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/list`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 智能体列表（管理员） */
export async function agentAllAdminAgentList(params?: Record<string, never>, query?: { page?: any; limit?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/all`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 删除智能体对应声纹 */
export async function agentVoicePrintDelete1(params: { id: string | number }, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/agent/voice-print/${params.id}`;
  const res = await apiClient.delete<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

