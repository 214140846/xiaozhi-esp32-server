import type { Agent } from '../../types/agent';
import { AgentCard } from './AgentCard';
import { SkeletonCard } from './SkeletonCard';

export interface AgentGridProps {
  /** 智能体列表 */
  agents: Agent[];
  /** 是否加载中 */
  isLoading: boolean;
  /** 骨架屏数量 */
  skeletonCount: number;
  /** 智能体配置回调 */
  onAgentConfig: (agentId: string) => void;
  /** 智能体删除回调 */
  onAgentDelete: (agentId: string) => void;
  /** 显示聊天记录回调 */
  onShowChatHistory: (params: { agentId: string; agentName: string }) => void;
}

/**
 * 智能体网格组件
 * 
 * 功能包括：
 * - 网格布局显示智能体列表
 * - 加载状态下显示骨架屏
 * - 智能体卡片的各种操作
 */
export function AgentGrid({
  agents,
  isLoading,
  skeletonCount,
  onAgentConfig,
  onAgentDelete,
  onShowChatHistory
}: AgentGridProps) {
  console.log('[AgentGrid] 渲染，智能体数量:', agents.length, '加载状态:', isLoading);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
      {/* 加载状态：显示骨架屏 */}
      {isLoading && (
        <>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </>
      )}

      {/* 正常状态：显示智能体列表 */}
      {!isLoading && (
        <>
          {agents.length > 0 ? (
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onConfig={() => onAgentConfig(agent.id)}
                onDelete={() => onAgentDelete(agent.id)}
                onShowChatHistory={() => onShowChatHistory({
                  agentId: agent.id,
                  agentName: agent.agentName
                })}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                暂无智能体
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                您还没有创建任何智能体，点击上方按钮创建第一个吧！
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
