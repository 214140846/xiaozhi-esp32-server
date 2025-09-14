import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import BasicConfigCard from "@/components/agent/config/BasicConfigCard";
import ModelSelectCard from "@/components/agent/config/ModelSelectCard";
import PromptMemoryCard from "@/components/agent/config/PromptMemoryCard";
import { useAgentGetAgentByIdQuery, useAgentUpdateMutation } from "@/hooks/agent/generatedHooks";

const schema = z.object({
  agentName: z.string().min(1, "请输入名称"),
  agentCode: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? ""),
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
  chatHistoryConf: z
    .union([z.number().int().nonnegative(), z.string()])
    .transform((v) => (typeof v === "string" && v !== "" ? Number(v) : Number(v || 0)))
    .optional(),
  sort: z
    .union([z.number().int().nonnegative(), z.string()])
    .transform((v) => (typeof v === "string" && v !== "" ? Number(v) : Number(v || 0)))
    .optional(),
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

type FormValues = z.infer<typeof schema>;

export function ConfigTab({ agentId }: { agentId: string }) {
  const queryClient = useQueryClient();

  const detail = useAgentGetAgentByIdQuery({ id: agentId });
  const updateMutation = useAgentUpdateMutation();

  const defaultValues: FormValues = useMemo(() => {
    const d = detail.data?.data;
    return {
      agentName: d?.agentName ?? "",
      agentCode: d?.agentCode ?? "",
      language: d?.language ?? "",
      langCode: d?.langCode ?? "",
      systemPrompt: d?.systemPrompt ?? "",
      summaryMemory: d?.summaryMemory ?? "",
      chatHistoryConf: d?.chatHistoryConf ?? 0,
      sort: d?.sort ?? 0,
      vadModelId: (d?.vadModelId as any)?.toString?.() ?? "",
      asrModelId: (d?.asrModelId as any)?.toString?.() ?? "",
      llmModelId: (d?.llmModelId as any)?.toString?.() ?? "",
      vllmModelId: (d?.vllmModelId as any)?.toString?.() ?? "",
      memModelId: (d?.memModelId as any)?.toString?.() ?? "",
      intentModelId: (d?.intentModelId as any)?.toString?.() ?? "",
      ttsModelId: (d?.ttsModelId as any)?.toString?.() ?? "",
      ttsVoiceId: (d?.ttsVoiceId as any)?.toString?.() ?? "",
    };
  }, [detail.data]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

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
    try {
      await updateMutation.mutateAsync({
        params: { id: agentId },
        data: {
          ...values,
          // 确保数字字段正确传递
          chatHistoryConf: Number(values.chatHistoryConf || 0),
          sort: Number(values.sort || 0),
        },
      });
      toast.success("保存成功");
      // 详情刷新
      await queryClient.invalidateQueries({ queryKey: ["Agent.GetAgentById"] });
      detail.refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || "保存失败");
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
