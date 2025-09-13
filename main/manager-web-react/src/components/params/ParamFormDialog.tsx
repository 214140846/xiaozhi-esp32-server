/**
 * 参数新增/编辑对话框组件
 * 用于创建和编辑参数的弹窗表单
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { ParamForm } from '../../types/params';

export interface ParamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ParamForm | null;
  onSubmit: (data: ParamForm) => Promise<void>;
  submitting: boolean;
}

export function ParamFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  submitting
}: ParamFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ParamForm>({
    mode: 'onChange',
    defaultValues: {
      paramCode: '',
      paramValue: '',
      remark: ''
    }
  });

  // 当对话框打开时重置表单数据
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          paramCode: '',
          paramValue: '',
          remark: ''
        });
      }
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: ParamForm) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  const title = initialData?.id ? '编辑参数' : '新增参数';

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* 对话框标题 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={submitting}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 参数编码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              参数编码 <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('paramCode', { 
                required: '参数编码不能为空',
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: '参数编码只能包含字母、数字和下划线'
                }
              })}
              placeholder="请输入参数编码"
              disabled={submitting}
              className={errors.paramCode ? 'border-red-500' : ''}
            />
            {errors.paramCode && (
              <p className="text-red-500 text-xs mt-1">{errors.paramCode.message}</p>
            )}
          </div>

          {/* 参数值 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              参数值 <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('paramValue', { required: '参数值不能为空' })}
              placeholder="请输入参数值"
              disabled={submitting}
              className={errors.paramValue ? 'border-red-500' : ''}
            />
            {errors.paramValue && (
              <p className="text-red-500 text-xs mt-1">{errors.paramValue.message}</p>
            )}
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注
            </label>
            <Input
              {...register('remark')}
              placeholder="请输入备注信息"
              disabled={submitting}
            />
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="min-w-[80px]"
            >
              {submitting ? '提交中...' : '确定'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}