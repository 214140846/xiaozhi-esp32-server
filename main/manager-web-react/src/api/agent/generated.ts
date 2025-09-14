/** Auto-generated from agent_OpenAPI.json. Do not edit manually. */
import { apiClient } from "../../lib/api";
import type { AxiosRequestConfig } from 'axios';
import type {
  AgentChatHistoryReportDTO,
  AgentCreateDTO,
  AgentMemoryDTO,
  AgentUpdateDTO,
  AgentVoicePrintSaveDTO,
  AgentVoicePrintUpdateDTO,
  ResultAgentInfoVO,
  ResultBoolean,
  ResultListAgentChatHistoryUserVO,
  ResultListAgentChatHistoryVO,
  ResultListAgentDTO,
  ResultListAgentVoicePrintVO,
  ResultPageDataAgentChatSessionDTO,
  ResultString,
  ResultVoid,
} from "../../types/openapi/agent";
import type { ApiResponse } from "../../types/openapi/common";

/** 获取智能体详情 */
export async function agentGetAgentById(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultAgentInfoVO> {
  const url = `/agent/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultAgentInfoVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 更新智能体 */
export async function agentUpdate(
  params: { id: string | number },
  data?: AgentUpdateDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/agent/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 删除智能体 */
export async function agentDelete(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/agent/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.delete<ResultVoid>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 创建智能体的声纹 */
export async function agentVoicePrintSave(
  params?: Record<string, never>,
  data?: AgentVoicePrintSaveDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/agent/voice-print`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 更新智能体的对应声纹 */
export async function agentVoicePrintUpdate1(
  params?: Record<string, never>,
  data?: AgentVoicePrintUpdateDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/agent/voice-print`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 根据设备id更新智能体 */
export async function agentSaveMemoryUpdateByDeviceId(
  params: { macAddress: string | number },
  data?: AgentMemoryDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/agent/saveMemory/${params.macAddress}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.put<ResultVoid>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 创建智能体 */
export async function agentSave1(
  params?: Record<string, never>,
  data?: AgentCreateDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultString> {
  const url = `/agent`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultString>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 小智服务聊天上报请求 */
export async function agentChatHistoryReportUploadFile(
  params?: Record<string, never>,
  data?: AgentChatHistoryReportDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultBoolean> {
  const url = `/agent/chat-history/report`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultBoolean>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取音频下载ID */
export async function agentAudioGetAudioId(
  params: { audioId: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultString> {
  const url = `/agent/audio/${params.audioId}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultString>(url, undefined, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取智能体会话列表 */
export async function agentSessionsGetAgentSessions(
  params: { id: string | number },
  query?: { page?: number; limit?: number },
  config?: AxiosRequestConfig
): Promise<ResultPageDataAgentChatSessionDTO> {
  const url = `/agent/${params.id}/sessions`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultPageDataAgentChatSessionDTO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取智能体聊天记录 */
export async function agentChatHistoryGetAgentChatHistory(
  params: { id: string | number; sessionId: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultListAgentChatHistoryVO> {
  const url = `/agent/${params.id}/chat-history/${params.sessionId}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultListAgentChatHistoryVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取智能体聊天记录（用户） */
export async function agentChatHistoryUserGetRecentlyFiftyByAgentId(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultListAgentChatHistoryUserVO> {
  const url = `/agent/${params.id}/chat-history/user`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultListAgentChatHistoryUserVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取音频内容 */
export async function agentChatHistoryAudioGetContentByAudioId(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultString> {
  const url = `/agent/${params.id}/chat-history/audio`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultString>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取用户指定智能体声纹列表 */
export async function agentVoicePrintListList(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultListAgentVoicePrintVO> {
  const url = `/agent/voice-print/list/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultListAgentVoicePrintVO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 智能体模板模板列表 */
export async function agentTemplateTemplateList(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ApiResponse<unknown>> {
  const url = `/agent/template`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ApiResponse<unknown>>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 播放音频 */
export async function agentPlayPlayAudio(
  params: { uuid: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ApiResponse<unknown>> {
  const url = `/agent/play/${params.uuid}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ApiResponse<unknown>>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取智能体的Mcp工具列表 */
export async function agentMcpToolsGetAgentMcpToolsList(
  params: { agentId: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ApiResponse<unknown>> {
  const url = `/agent/mcp/tools/${params.agentId}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ApiResponse<unknown>>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取智能体的Mcp接入点地址 */
export async function agentMcpAddressGetAgentMcpAccessAddress(
  params: { agentId: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultString> {
  const url = `/agent/mcp/address/${params.agentId}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultString>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取用户智能体列表 */
export async function agentListGetUserAgents(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultListAgentDTO> {
  const url = `/agent/list`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ResultListAgentDTO>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 智能体列表（管理员） */
export async function agentAllAdminAgentList(
  params?: Record<string, never>,
  query?: { page?: number; limit?: number },
  config?: AxiosRequestConfig
): Promise<ApiResponse<unknown>> {
  const url = `/agent/all`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.get<ApiResponse<unknown>>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 删除智能体对应声纹 */
export async function agentVoicePrintDelete1(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/agent/voice-print/${params.id}`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.delete<ResultVoid>(url, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}
