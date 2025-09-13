import { useState, useCallback, useMemo } from 'react';
import { HeaderBar } from '../components/home/HeaderBar';
import { WelcomeBanner } from '../components/home/WelcomeBanner';
import { AgentGrid } from '../components/home/AgentGrid';
import { AddAgentDialog } from '../components/home/AddAgentDialog';
import { ChatHistoryDialog } from '../components/home/ChatHistoryDialog';
import { VersionFooter } from '../components/auth/VersionFooter';
import { useAgentManagement } from '../hooks/useAgentManagement';
import { useSearch } from '../hooks/useSearch';

export interface HomePageProps {}

/**
 * 主页面组件 - 智能体管理主界面
 * 
 * 功能包括：
 * - 智能体列表展示（网格布局）
 * - 搜索和过滤智能体
 * - 添加、删除、配置智能体
 * - 查看聊天记录
 * - 骨架屏加载状态
 */
export function HomePage({}: HomePageProps) {
  console.log('[HomePage] 页面初始化');

  // 智能体管理相关状态和方法
  const {
    agents,
    isLoading,
    deleteAgent,
    refreshAgents
  } = useAgentManagement();

  // 搜索功能
  const {
    searchQuery,
    filteredData: filteredAgents,
    handleSearch,
    handleSearchReset
  } = useSearch(agents, (agent) => agent.agentName || '');

  // 对话框状态
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string>('');
  const [currentAgentName, setCurrentAgentName] = useState<string>('');

  // 显示添加智能体对话框
  const handleShowAddDialog = useCallback(() => {
    console.log('[HomePage] 显示添加智能体对话框');
    setAddDialogVisible(true);
  }, []);

  // 处理添加智能体成功
  const handleAgentAdded = useCallback(async () => {
    console.log('[HomePage] 智能体添加成功，刷新列表');
    await refreshAgents();
    setAddDialogVisible(false);
  }, [refreshAgents]);

  // 处理智能体删除
  const handleAgentDelete = useCallback(async (agentId: string) => {
    console.log('[HomePage] 删除智能体:', agentId);
    const success = await deleteAgent(agentId);
    if (success) {
      await refreshAgents();
    }
  }, [deleteAgent, refreshAgents]);

  // 处理查看聊天记录
  const handleShowChatHistory = useCallback(({ agentId, agentName }: { agentId: string; agentName: string }) => {
    console.log('[HomePage] 显示聊天记录:', { agentId, agentName });
    setCurrentAgentId(agentId);
    setCurrentAgentName(agentName);
    setChatHistoryVisible(true);
  }, []);

  // 处理智能体配置
  const handleAgentConfig = useCallback((agentId: string) => {
    console.log('[HomePage] 配置智能体:', agentId);
    // TODO: 跳转到配置页面
    // navigate(`/agent-config/${agentId}`);
  }, []);

  // 计算骨架屏数量
  const skeletonCount = useMemo(() => {
    const stored = localStorage.getItem('skeletonCount');
    const count = stored ? parseInt(stored, 10) : 8;
    return Math.min(Math.max(count, 3), 10); // 限制在 3-10 之间
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 顶部搜索栏 */}
      <HeaderBar
        onSearch={handleSearch}
        onSearchReset={handleSearchReset}
        searchQuery={searchQuery}
      />

      {/* 主要内容区域 */}
      <main className="flex-1 p-5">
        {/* 欢迎横幅 */}
        <WelcomeBanner onAddAgent={handleShowAddDialog} />

        {/* 智能体网格列表 */}
        <AgentGrid
          agents={filteredAgents}
          isLoading={isLoading}
          skeletonCount={skeletonCount}
          onAgentConfig={handleAgentConfig}
          onAgentDelete={handleAgentDelete}
          onShowChatHistory={handleShowChatHistory}
        />
      </main>

      {/* 底部版本信息 */}
      <footer>
        <VersionFooter />
      </footer>

      {/* 添加智能体对话框 */}
      <AddAgentDialog
        open={addDialogVisible}
        onOpenChange={setAddDialogVisible}
        onSuccess={handleAgentAdded}
      />

      {/* 聊天记录对话框 */}
      <ChatHistoryDialog
        open={chatHistoryVisible}
        onOpenChange={setChatHistoryVisible}
        agentId={currentAgentId}
        agentName={currentAgentName}
      />
    </div>
  );
}