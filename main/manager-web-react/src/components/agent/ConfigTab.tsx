import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import BasicConfigCard from "@/components/agent/config/BasicConfigCard";
import ModelSelectCard from "@/components/agent/config/ModelSelectCard";
import PromptMemoryCard from "@/components/agent/config/PromptMemoryCard";
import { useAgentGetAgentByIdQuery, useAgentListGetUserAgentsQuery, useAgentUpdateMutation } from "@/hooks/agent/generatedHooks";
import { navigate as appNavigate } from "@/lib/navigation";

const baseSchema = z.object({
  agentName: z.string().min(1, "请输入名称"),
  language: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  langCode: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  systemPrompt: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  summaryMemory: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  chatHistoryConf: z.coerce.number().int().nonnegative().optional(),
  sort: z.coerce.number().int().min(0).optional(),
  // 模型关联字段（统一以字符串形式保存，后端可接受 string/number）
  vadModelId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  asrModelId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  llmModelId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  vllmModelId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  memModelId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  intentModelId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  ttsModelId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
  ttsVoiceId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
});

type FormValues = z.infer<typeof baseSchema>;

export function ConfigTab({ agentId }: { agentId: string }) {
  const queryClient = useQueryClient();

  const detail = useAgentGetAgentByIdQuery({ id: agentId });
  const updateMutation = useAgentUpdateMutation();
  const { data: agentsRes } = useAgentListGetUserAgentsQuery();

  // 现有名称集合（排除当前正在编辑的智能体自身名称）
  const existingNameSet = useMemo(() => {
    const currentId = detail.data?.data?.id;
    const list = (agentsRes?.data ?? []).filter(a => a.id !== currentId);
    return new Set(list.map(a => (a.agentName ?? '').trim().toLowerCase()).filter(Boolean));
  }, [agentsRes, detail.data?.data?.id]);

  const defaultValues: FormValues = useMemo(() => {
    const d = detail.data?.data;
    return {
      agentName: d?.agentName ?? "",
      language: d?.language ?? "",
      langCode: d?.langCode ?? "",
      systemPrompt: d?.systemPrompt ?? "",
      summaryMemory: d?.summaryMemory ?? "",
      chatHistoryConf: d?.chatHistoryConf ?? 0,
      sort: d?.sort ?? 0,
      vadModelId: d?.vadModelId != null ? String(d.vadModelId) : "",
      asrModelId: d?.asrModelId != null ? String(d.asrModelId) : "",
      llmModelId: d?.llmModelId != null ? String(d.llmModelId) : "",
      vllmModelId: d?.vllmModelId != null ? String(d.vllmModelId) : "",
      memModelId: d?.memModelId != null ? String(d.memModelId) : "",
      intentModelId: d?.intentModelId != null ? String(d.intentModelId) : "",
      ttsModelId: d?.ttsModelId != null ? String(d.ttsModelId) : "",
      ttsVoiceId: d?.ttsVoiceId != null ? String(d.ttsVoiceId) : "",
    };
  }, [detail.data]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(baseSchema) as Resolver<FormValues>, defaultValues });

  // 同步服务端数据到表单
  useEffect(() => {
    if (detail.data?.data) {
      reset(defaultValues);
    }
  }, [detail.data, reset, defaultValues]);

  // 当切换 TTS 提供商/模型时，清空已选音色，避免脏数据
  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name === 'ttsModelId') {
        setValue('ttsVoiceId', '', { shouldDirty: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  const onSubmit = async (values: FormValues) => {
    // 重命名唯一性校验（本地校验一层，避免无谓请求）
    const name = (values.agentName ?? '').trim().toLowerCase();
    if (name.length < 1) {
      toast.error('请输入名称');
      return;
    }
    if (existingNameSet.has(name)) {
      toast.error('名称已存在，请更换');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        params: { id: agentId },
        data: {
          ...values,
          // 确保数字字段正确传递
          chatHistoryConf: Number(values.chatHistoryConf || 0),
          sort: Math.max(0, Number(values.sort || 0)),
        },
      });
      toast.success("保存成功");
      // 详情刷新
      await queryClient.invalidateQueries({ queryKey: ["Agent.GetAgentById"] });
      // 使首页列表失效，返回后可自动刷新
      await queryClient.invalidateQueries({ queryKey: ["AgentList.GetUserAgents"] });
      detail.refetch();
      // 返回首页智能体列表
      appNavigate("/home", { replace: true });
    } catch (err: unknown) {
      let msg: string | undefined
      if (typeof err === 'object' && err && 'response' in err) {
        const r = err as { response?: { data?: { msg?: string } } }
        msg = r.response?.data?.msg
      }
      if (!msg && err instanceof Error) msg = err.message
      // 如果后端返回命名冲突错误，也提示命名重复
      toast.error(msg || '保存失败')
    }
  };

  // 语言选择合并逻辑已移动到子组件

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">基础配置</h2>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => reset(defaultValues)} disabled={detail.isLoading}>
            重置
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting || updateMutation.isPending}>
            {updateMutation.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <BasicConfigCard control={control} setValue={setValue} watch={watch} />
      <ModelSelectCard control={control} />
      <PromptMemoryCard control={control} />

      {/* 移动端底部操作条：保持关键操作始终可触达 */}
      <div className="sm:hidden sticky bottom-0 inset-x-0 bg-background/90 backdrop-blur border-t border-border p-3 rounded-b-lg">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => reset(defaultValues)} disabled={detail.isLoading}>
            重置
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting || updateMutation.isPending}>
            {updateMutation.isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default ConfigTab;
