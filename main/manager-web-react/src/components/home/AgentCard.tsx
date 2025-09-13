import { useState } from 'react';
import { Button } from '../ui/button';
import type { Agent } from '../../types/agent';
import { Settings, Trash2, MessageSquare, Bot, MoreVertical } from 'lucide-react';

export interface AgentCardProps {
  /** 智能体数据 */
  agent: Agent;
  /** 配置回调 */
  onConfig: () => void;
  /** 删除回调 */
  onDelete: () => void;
  /** 显示聊天记录回调 */
  onShowChatHistory: () => void;
}

/**
 * 智能体卡片组件
 * 
 * 功能包括：
 * - 展示智能体基本信息
 * - 配置、删除、聊天记录操作
 * - 悬停效果和状态指示
 */
export function AgentCard({ agent, onConfig, onDelete, onShowChatHistory }: AgentCardProps) {
  console.log('[AgentCard] 渲染智能体卡片:', agent.agentName);

  const [isActionsVisible, setIsActionsVisible] = useState(false);

  const handleDeleteClick = () => {
    // 添加确认提示
    if (window.confirm(`确定要删除智能体"${agent.agentName}"吗？此操作无法撤销。`)) {
      onDelete();
    }
  };

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 overflow-hidden"
      onMouseEnter={() => setIsActionsVisible(true)}
      onMouseLeave={() => setIsActionsVisible(false)}
    >
      {/* 顶部状态条 */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      <div className="p-6">
        {/* 头部：头像和基本信息 */}
        <div className="flex items-start space-x-4 mb-4">
          {/* 智能体头像 */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {agent.avatar ? (
                <img
                  src={agent.avatar}
                  alt={agent.agentName}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <Bot className="w-6 h-6 text-white" />
              )}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {agent.agentName}
            </h3>
            {agent.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {agent.description}
              </p>
            )}
          </div>

          {/* 操作菜单按钮 */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity duration-200 ${
                isActionsVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="flex items-center space-x-4 mb-4">
          {/* 在线状态 */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              agent.status === 'online' ? 'bg-green-500' : 
              agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {agent.status === 'online' ? '在线' : 
               agent.status === 'busy' ? '忙碌' : '离线'}
            </span>
          </div>

          {/* 创建时间 */}
          {agent.createdAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(agent.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* 操作按钮区域 */}
        <div className={`flex items-center space-x-2 transition-all duration-200 ${
          isActionsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          {/* 配置按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={onConfig}
            className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
          >
            <Settings className="w-3 h-3 mr-1" />
            配置
          </Button>

          {/* 聊天记录按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={onShowChatHistory}
            className="flex-1 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            记录
          </Button>

          {/* 删除按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteClick}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 悬停时的边框光效 */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/5 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}
