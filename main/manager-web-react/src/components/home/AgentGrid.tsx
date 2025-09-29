import type { AgentDTO as Agent } from '../../types/openapi/agent';
import { AgentCard } from './AgentCard';
import { SkeletonCard } from './SkeletonCard';
import { AnimatePresence } from 'framer-motion';

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
  /** 打开设备管理 */
  onOpenDevices?: (agentId: string) => void;
  /** 打开详情（点击卡片） */
  onOpenDetail?: (agentId: string) => void;
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
  onShowChatHistory,
  onOpenDevices,
  onOpenDetail,
}: AgentGridProps) {
  console.log('[AgentGrid] 渲染，智能体数量:', agents.length, '加载状态:', isLoading);

  // 空状态：不使用瀑布列，保持全宽居中展示
  if (!isLoading && agents.length === 0) {
    return (
      <div className="pt-6 sm:pt-8">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground"
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
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-1 sm:mb-2">
            暂无智能体
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-4">
            您还没有创建任何智能体，点击上方按钮创建第一个吧！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-8">
      {/* 网格容器：标准 CSS Grid 四列布局，避免瀑布流产生的空列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* 加载状态：显示骨架屏 */}
        {isLoading && (
          <>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-full">
                <SkeletonCard />
              </div>
            ))}
          </>
        )}

        {/* 正常状态：显示智能体列表 */}
        {!isLoading && (
          <AnimatePresence initial={false}>
            {agents.map((agent) => (
              <div key={agent.id} className="h-full">
                <AgentCard
                  agent={agent}
                  onConfig={() => onAgentConfig(agent.id)}
                  onDelete={() => onAgentDelete(agent.id)}
                  onShowChatHistory={() =>
                    onShowChatHistory({ agentId: agent.id, agentName: agent.agentName })
                  }
                  onOpenDevices={onOpenDevices ? () => onOpenDevices(agent.id) : undefined}
                  onOpenDetail={onOpenDetail ? () => onOpenDetail(agent.id) : undefined}
                />
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
