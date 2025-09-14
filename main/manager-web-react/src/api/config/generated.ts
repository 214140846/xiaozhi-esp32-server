/** Auto-generated from config_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../types/openapi/common';
import type { AgentModelsDTO } from '../../types/openapi/config';
import type { ResultObject } from '../../types/openapi/config';

/** 服务端获取配置接口 */
export async function configServerBaseGetConfig(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultObject> {
  const url = `/config/server-base`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultObject>(url, undefined, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}

/** 获取智能体模型 */
export async function configAgentModelsGetAgentModels(
  params?: Record<string, never>,
  data?: AgentModelsDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultObject> {
  const url = `/config/agent-models`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const res = await apiClient.post<ResultObject>(url, data, { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } });
  return res.data;
}
