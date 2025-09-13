import { useMutation, useQuery } from '@tanstack/react-query'
import { configApi } from '@/api/configApi'
import type { AgentModelsDTO, ConfigResponse, ServerBaseConfig } from '@/types/config'

// 获取服务端基础配置（POST）
export function useServerBaseConfig() {
  return useQuery<ConfigResponse<ServerBaseConfig>, Error>({
    queryKey: ['config', 'server-base'],
    queryFn: () => configApi.getServerBase(),
  })
}

// 获取智能体模型（POST）
export function useAgentModels() {
  return useMutation<ConfigResponse<any>, Error, AgentModelsDTO>({
    mutationFn: (payload: AgentModelsDTO) => configApi.getAgentModels(payload),
  })
}

