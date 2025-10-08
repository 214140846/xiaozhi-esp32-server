import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { AgentDTO as Agent } from '../../types/openapi/agent';
import { Settings, Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModelList } from '@/hooks/models/useModelList';

export interface AgentCardProps {
  /** 智能体数据 */
  agent: Agent;
  /** 配置回调 */
  onConfig: () => void;
  /** 删除回调 */
  onDelete: () => void;
  /** 显示聊天记录回调 */
  onShowChatHistory: () => void;
  /** 打开设备管理 */
  onOpenDevices?: () => void;
  /** 打开详情（点击卡片） */
  onOpenDetail?: () => void;
}

/**
 * 智能体卡片组件
 * 
 * 功能包括：
 * - 展示智能体基本信息
 * - 配置、删除、聊天记录操作
 * - 悬停效果和状态指示
 */
export function AgentCard({ agent, onConfig, onDelete, onShowChatHistory, onOpenDevices, onOpenDetail }: AgentCardProps) {
  console.log('[AgentCard] 渲染智能体卡片:', agent.agentName);

  const [deleteOpen, setDeleteOpen] = useState(false);

  // 模型名称映射（ASR / TTS / LLM）
  const { models: asrModels } = useModelList({ modelType: 'asr', page: 1, limit: 200 });
  const { models: ttsModels } = useModelList({ modelType: 'tts', page: 1, limit: 200 });
  const { models: llmModels } = useModelList({ modelType: 'llm', page: 1, limit: 200 });

  const modelNameById = useMemo(() => {
    const map: Record<string, string> = {};
    asrModels.forEach(m => (map[String(m.id)] = m.modelName));
    ttsModels.forEach(m => (map[String(m.id)] = m.modelName));
    llmModels.forEach(m => (map[String(m.id)] = m.modelName));
    return map;
  }, [asrModels, ttsModels, llmModels]);

  // 后端可能直接返回名称，优先使用名称字段
  const asAny = agent as any;
  const asrName = agent.asrModelId
    ? (asAny.asrModelName as string | undefined) ?? modelNameById[String(agent.asrModelId)] ?? String(agent.asrModelId)
    : undefined;
  const ttsName = asAny.ttsModelName as string | undefined ?? (agent.ttsModelId ? modelNameById[String(agent.ttsModelId)] ?? String(agent.ttsModelId) : undefined);
  const llmName = asAny.llmModelName as string | undefined ?? (agent.llmModelId ? modelNameById[String(agent.llmModelId)] ?? String(agent.llmModelId) : undefined);
  const vllmName = asAny.vllmModelName as string | undefined;
  const ttsVoiceName = asAny.ttsVoiceName as string | undefined;
  const memModelId = (agent.memModelId as string | undefined) ?? (asAny.memModelId as string | undefined);
  const deviceCount = asAny.deviceCount as number | undefined;
  const lastConnectedAt = (asAny.lastConnectedAt as string | null | undefined) ?? undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative hover:shadow-lg transition-all duration-200 h-full"
      onClick={() => onOpenDetail?.()}
    >
      <Card className="overflow-hidden h-full flex flex-col">

        <CardHeader className="pb-4">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* 标题与说明（移除头像图标） */}
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate text-lg">{agent.agentName}</CardTitle>
              {(agent.systemPrompt || agent.summaryMemory) && (
                <CardDescription className="mt-1 line-clamp-2">
                  {agent.systemPrompt || agent.summaryMemory}
                </CardDescription>
              )}
              {/* 标签行：语言、编号等 */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {agent.language && (
                  <Badge variant="secondary">{agent.language}</Badge>
                )}
              </div>
            </div>

            {/* 顶部右侧动作位（预留） */}
            <CardAction className="hidden md:block" />
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* 次要信息区 */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/50" />
              <span>
                {typeof deviceCount === 'number' ? `设备 ${deviceCount}` : '未知状态'}
                {lastConnectedAt ? ` ・最近连接 ${new Date(lastConnectedAt).toLocaleString()}` : ''}
              </span>
            </div>
          </div>

          {/* 已选模型：ASR / TTS / LLM */}
          {(asrName || ttsName || llmName || vllmName || ttsVoiceName || (memModelId && memModelId !== 'Memory_nomem')) && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {asrName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/40">ASR: {asrName}</span>
              )}
              {llmName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/40">LLM: {llmName}</span>
              )}
              {vllmName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/40">VLLM: {vllmName}</span>
              )}
              {ttsName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/40">TTS: {ttsName}</span>
              )}
              {ttsVoiceName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/40">音色: {ttsVoiceName}</span>
              )}
              {memModelId && memModelId !== 'Memory_nomem' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/40">Memory: {memModelId}</span>
              )}
            </div>
          )}

          {/* 操作区（常显） */}
          <TooltipProvider>
            <div className={`mt-auto grid grid-flow-row grid-cols-2 gap-2 opacity-100 translate-y-0`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onConfig(); }}
                    className="w-full"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    配置
                  </Button>
                </TooltipTrigger>
                <TooltipContent>配置该角色</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onShowChatHistory(); }}
                    className="w-full"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    记录
                  </Button>
                </TooltipTrigger>
                <TooltipContent>查看聊天记录</TooltipContent>
              </Tooltip>

              {onOpenDevices && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onOpenDevices(); }}
                      className="w-full"
                    >
                      设备
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>设备管理</TooltipContent>
                </Tooltip>
              )}

              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <Tooltip>
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); }}
                        className="w-full"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <TooltipContent>删除</TooltipContent>
                </Tooltip>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除智能体</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定删除“{agent.agentName}”吗？该操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}
