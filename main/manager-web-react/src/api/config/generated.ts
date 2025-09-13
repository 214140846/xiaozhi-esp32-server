/** Auto-generated from config_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 服务端获取配置接口 */
export async function configServerBaseGetConfig(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/config/server-base`;
  const res = await apiClient.post<ApiResponse<any>>(url, undefined, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 获取智能体模型 */
export async function configAgentModelsGetAgentModels(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/config/agent-models`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

