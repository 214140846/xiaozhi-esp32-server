/** Auto-generated hooks for config APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/config/generated';

/** 服务端获取配置接口 */
export function useConfigServerBaseGetConfigMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any }) => Api.configServerBaseGetConfig(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 获取智能体模型 */
export function useConfigAgentModelsGetAgentModelsMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.configAgentModelsGetAgentModels(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

