import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Bot, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';

import { useAgentListGetUserAgentsQuery, useAgentSave1Mutation } from '../../hooks/agent/generatedHooks';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

type ErrorWithResponse = {
  response?: {
    data?: {
      msg?: string
    }
  }
}

function hasResponse(e: unknown): e is ErrorWithResponse {
  return typeof e === 'object' && e !== null && 'response' in e
}

export interface AddAgentDialogProps {
  /** 对话框显示状态 */
  open: boolean;
  /** 对话框状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 添加成功回调 */
  onSuccess: () => Promise<void> | void;
}

/**
 * 添加智能体对话框组件
 * 
 * 功能包括：
 * - 智能体名称输入
 * - 智能体描述输入（可选）
 * - 表单验证
 * - 添加操作
 */
export function AddAgentDialog({ open, onOpenChange, onSuccess }: AddAgentDialogProps) {
  console.log('[AddAgentDialog] 对话框状态:', open);

  const queryClient = useQueryClient();
  const isComposingRef = useRef(false);
  const NAME_MAX = 50;
  const DESC_MAX = 200;

  // 获取已存在的智能体名称列表用于唯一性校验
  const { data: agentsRes } = useAgentListGetUserAgentsQuery();
  const existingNameSet = new Set(
    (agentsRes?.data ?? [])
      .map(a => (a.agentName ?? '').trim().toLowerCase())
      .filter(Boolean)
  );

  const schema = z.object({
    agentName: z
      .string()
      .trim()
      .min(2, '智能体名称至少需要2个字符')
      .max(NAME_MAX, `智能体名称不能超过${NAME_MAX}个字符`)
      .refine((v) => !existingNameSet.has(v.toLowerCase()), '名称已存在，请更换'),
    description: z.string().max(DESC_MAX, `描述不能超过${DESC_MAX}个字符`).optional().or(z.literal('')),
  });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { agentName: '', description: '' },
    mode: 'onChange',
  });

  const createMutation = useAgentSave1Mutation();
  const [submitError, setSubmitError] = useState<string>('');

  // 处理表单输入变化（合成态不限制，合成结束后再裁剪）
  const agentName = watch('agentName');
  const description = watch('description');

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (field: 'agentName' | 'description') => (
    e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    isComposingRef.current = false;
    const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value || '';
    const max = field === 'agentName' ? NAME_MAX : DESC_MAX;
    if (value.length > max) {
      const clipped = value.slice(0, max);
      if (field === 'agentName') {
        setValue('agentName', clipped, { shouldValidate: true, shouldDirty: true });
      } else {
        setValue('description', clipped, { shouldValidate: true, shouldDirty: true });
      }
    }
  };

  // 重置表单
  const resetForm = () => {
    reset({ agentName: '', description: '' });
    setSubmitError('');
  };

  // 处理关闭对话框
  const handleClose = () => {
    if (!createMutation.isPending && !isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  // 处理表单提交
  const onSubmit = async (values: FormValues) => {
    setSubmitError('');
    try {
      console.log('[AddAgentDialog] 提交表单数据:', values);
      const response = await createMutation.mutateAsync({
        data: {
          agentName: values.agentName.trim(),
        },
      });

      if (!response || response.code !== 0) {
        const message = response?.msg || '添加智能体失败，请重试';
        console.warn('[AddAgentDialog] 智能体添加失败:', message);
        setSubmitError(message);
        toast.error(message);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['AgentList.GetUserAgents'] });
      console.log('[AddAgentDialog] 智能体添加成功');
      toast.success('智能体创建成功');
      resetForm();
      await Promise.resolve(onSuccess());
    } catch (err) {
      console.error('[AddAgentDialog] 添加智能体失败:', err);
      const message = (hasResponse(err) && err.response?.data?.msg)
        || (err instanceof Error ? err.message : '')
        || '添加智能体失败，请重试';
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-md p-0" showCloseButton>
        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg text-gray-900 dark:text-white">添加智能体</DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">创建一个新的AI助手</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">智能体名称 *</label>
            <Input
              type="text"
              {...register('agentName')}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd('agentName')}
              placeholder="输入智能体名称"
              disabled={createMutation.isPending || isSubmitting}
              className="w-full"
              // 不使用原生 maxLength，避免 IME 拼音阶段被限制
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{(agentName?.length ?? 0)}/{NAME_MAX}</p>
            {errors.agentName && (
              <p className="mt-1 text-xs text-destructive">{errors.agentName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述 (可选)</label>
            <textarea
              {...register('description')}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd('description')}
              placeholder="简单描述一下这个智能体的功能..."
              disabled={createMutation.isPending || isSubmitting}
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              // 不使用原生 maxLength，避免 IME 拼音阶段被限制
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{(description?.length ?? 0)}/{DESC_MAX}</p>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          <DialogFooter className="p-0">
            <div className="flex items-center gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending || isSubmitting}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createMutation.isPending || isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    创建智能体
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
