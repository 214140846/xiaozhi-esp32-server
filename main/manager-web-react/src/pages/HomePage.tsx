import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VersionFooter } from "../components/auth/VersionFooter";
import { AddAgentDialog } from "../components/home/AddAgentDialog";
import { AgentGrid } from "../components/home/AgentGrid";
import { ChatHistoryDialog } from "../components/home/ChatHistoryDialog";
import { HeaderBar } from "../components/home/HeaderBar";
import { WelcomeBanner } from "../components/home/WelcomeBanner";
import { useAgentDeleteMutation, useAgentListGetUserAgentsQuery } from "../hooks/agent/generatedHooks";
import { useOtaMagPageQuery } from "../hooks/otaMag/generatedHooks";
import { useAdminDeviceAllPageDeviceQuery } from "../hooks/admin/generatedHooks";
import { useModelsListGetModelConfigListQuery } from "../hooks/models/generatedHooks";
import type { AgentDTO } from "../types/openapi/agent";

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
  console.log("[HomePage] 页面初始化");
  const navigate = useNavigate();

  // 获取用户的智能体列表
  const { data: agentsRes, isLoading, refetch: refreshAgents } = useAgentListGetUserAgentsQuery();
  const agents: AgentDTO[] = useMemo(() => agentsRes?.data ?? [], [agentsRes]);

  // 删除智能体
  const deleteMutation = useAgentDeleteMutation();

  // 搜索功能（本地实现）
  const [searchQuery, setSearchQuery] = useState("");
  const filteredAgents = useMemo(
    () => agents.filter((agent) => (agent.agentName ?? "").toLowerCase().includes(searchQuery.toLowerCase())),
    [agents, searchQuery]
  );
  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);
  const handleSearchReset = useCallback(() => setSearchQuery(""), []);

  // 对话框状态
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string>("");
  const [currentAgentName, setCurrentAgentName] = useState<string>("");

  // 显示添加智能体对话框
  const handleShowAddDialog = useCallback(() => {
    console.log("[HomePage] 显示添加智能体对话框");
    setAddDialogVisible(true);
  }, []);

  // 处理添加智能体成功
  const handleAgentAdded = useCallback(async () => {
    console.log("[HomePage] 智能体添加成功，刷新列表");
    await refreshAgents();
    setAddDialogVisible(false);
  }, [refreshAgents]);

  // 处理智能体删除
  const handleAgentDelete = useCallback(
    async (agentId: string) => {
      console.log("[HomePage] 删除智能体:", agentId);
      try {
        await deleteMutation.mutateAsync({ params: { id: agentId } });
        await refreshAgents();
      } catch (e) {
        console.error("[HomePage] 删除智能体失败:", e);
      }
    },
    [deleteMutation, refreshAgents]
  );

  // 处理查看聊天记录
  const handleShowChatHistory = useCallback(({ agentId, agentName }: { agentId: string; agentName: string }) => {
    console.log("[HomePage] 显示聊天记录:", { agentId, agentName });
    setCurrentAgentId(agentId);
    setCurrentAgentName(agentName);
    setChatHistoryVisible(true);
  }, []);

  // 处理智能体配置
  const handleAgentConfig = useCallback(
    (agentId: string) => {
      console.log("[HomePage] 配置智能体:", agentId);
      navigate(`/agent/${agentId}?tab=config`);
    },
    [navigate]
  );

  // 进入设备管理
  const handleOpenDevices = useCallback(
    (agentId: string) => {
      console.log("[HomePage] 进入设备管理, agentId:", agentId);
      navigate(`/device-management?agentId=${agentId}`);
    },
    [navigate]
  );

  // 计算骨架屏数量
  const skeletonCount = useMemo(() => {
    const stored = localStorage.getItem("skeletonCount");
    const count = stored ? parseInt(stored, 10) : 8;
    return Math.min(Math.max(count, 3), 10); // 限制在 3-10 之间
  }, []);

  // 概览统计（基于当前数据简单统计）
  const agentCount = agents.length;

  // 概览统计：设备/固件/模型总数（分页接口取 total）
  const { data: otaPage } = useOtaMagPageQuery({ page: 1, limit: 1, keyword: '' })
  const firmwareCount = otaPage?.data?.total ?? 0

  const { data: devicePage } = useAdminDeviceAllPageDeviceQuery({}, { page: 1, limit: 1 })
  const deviceCount = devicePage?.data?.total ?? 0

  const { data: modelPage } = useModelsListGetModelConfigListQuery({}, { page: 1, limit: 1 })
  const modelCount = modelPage?.data?.total ?? 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 顶部搜索栏 */}
      <HeaderBar onSearch={handleSearch} onSearchReset={handleSearchReset} searchQuery={searchQuery} />

      {/* 主要内容区域 */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 欢迎横幅（内含概览统计） */}
        <WelcomeBanner 
          onAddAgent={handleShowAddDialog} 
          agentCount={agentCount}
          deviceCount={deviceCount}
          firmwareCount={firmwareCount}
          modelCount={modelCount}
        />

        {/* 概览统计已移至 Banner 内部展示 */}

        {/* 智能体网格列表 */}
        <AgentGrid
          agents={filteredAgents}
          isLoading={isLoading}
          skeletonCount={skeletonCount}
          onAgentConfig={handleAgentConfig}
          onAgentDelete={handleAgentDelete}
          onShowChatHistory={handleShowChatHistory}
          onOpenDevices={handleOpenDevices}
          onOpenDetail={handleAgentConfig}
        />
      </main>

      {/* 底部版本信息 */}
      <footer>
        <VersionFooter />
      </footer>

      {/* 添加智能体对话框 */}
      <AddAgentDialog open={addDialogVisible} onOpenChange={setAddDialogVisible} onSuccess={handleAgentAdded} />

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
