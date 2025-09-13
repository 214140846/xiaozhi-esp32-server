import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Agent } from '../types/agent';
import { getUserAgents, _delete as deleteAgentApi, save_1 as createAgentApi } from '../api/agentApi';

/**
 * 智能体管理 Hook（基于 React Query）
 * - 获取用户智能体列表
 * - 创建/删除智能体（带缓存失效）
 * - 刷新列表
 */
export function useAgentManagement() {
  const queryClient = useQueryClient();

  // 获取用户智能体列表
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userAgents'],
    queryFn: async () => {
      const res = await getUserAgents();
      if ((res as any).code !== 0) throw new Error((res as any).msg || '获取智能体列表失败');
      return (res as any).data || [];
    },
  });

  // 统一映射为通用 Agent 类型，便于 UI 复用
  const agents: Agent[] = useMemo(() => {
    const list = (data || []) as any[];
    return list.map((item) => ({
      id: String(item.id ?? ''),
      agentId: String(item.id ?? ''),
      agentName: String(item.agentName ?? ''),
      description: (item as any).summaryMemory || (item as any).systemPrompt || '',
      avatar: '',
      status: 'online',
      createdAt: (item as any).createdAt,
      updatedAt: (item as any).updatedAt,
      deviceCount: (item as any).deviceCount,
    }));
  }, [data]);

  // 根据列表长度更新骨架屏数量（与原逻辑保持一致）
  useEffect(() => {
    const cnt = Math.min(Math.max(agents.length, 3), 10);
    localStorage.setItem('skeletonCount', String(cnt));
  }, [agents.length]);

  // 创建智能体
  const { mutateAsync: addAgentMutate } = useMutation({
    mutationFn: async (payload: { agentName: string; description?: string }) => {
      const res = await createAgentApi({ agentName: payload.agentName });
      if ((res as any).code !== 0) throw new Error((res as any).msg || '创建智能体失败');
      return (res as any).data as string | undefined; // 返回新建ID（如果后端返回）
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userAgents'] });
    },
  });

  // 删除智能体
  const { mutateAsync: deleteAgentMutate } = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await deleteAgentApi({ id: agentId });
      if ((res as any).code !== 0) throw new Error((res as any).msg || '删除智能体失败');
      return true as const;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userAgents'] });
    },
  });

  // 暴露与原接口兼容的方法
  const addAgent = async (agentData: { agentName: string; description?: string }) => {
    await addAgentMutate(agentData);
  };

  const deleteAgent = async (agentId: string) => {
    await deleteAgentMutate(agentId);
    return true;
  };

  const refreshAgents = async () => {
    await refetch();
  };

  return {
    agents,
    isLoading,
    error: error instanceof Error ? error.message : '',
    addAgent,
    deleteAgent,
    refreshAgents,
  };
}
