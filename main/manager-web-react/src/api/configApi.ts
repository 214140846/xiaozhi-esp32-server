/**
 * 配置管理 API（基于 api-docs/config_OpenAPI.json）
 */
import apiClient from '@/lib/api'
import type { AgentModelsDTO, ConfigResponse, ServerBaseConfig } from '@/types/config'

export const configApi = {
  // 服务端获取配置接口 POST /config/server-base
  getServerBase: async (): Promise<ConfigResponse<ServerBaseConfig>> => {
    const resp = await apiClient.post<ConfigResponse<ServerBaseConfig>>('/config/server-base')
    return resp.data
  },

  // 获取智能体模型 POST /config/agent-models
  getAgentModels: async (data: AgentModelsDTO): Promise<ConfigResponse<any>> => {
    const resp = await apiClient.post<ConfigResponse<any>>('/config/agent-models', data)
    return resp.data
  }
}

export default configApi

