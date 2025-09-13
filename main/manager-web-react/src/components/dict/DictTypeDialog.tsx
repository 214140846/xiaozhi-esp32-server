/**
 * 字典类型编辑对话框组件
 * 用于新增和编辑字典类型
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { DictTypeForm } from '../../types/dict';

export interface DictTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DictTypeForm) => Promise<void>;
  title: string;
  initialData?: DictTypeForm;
  isLoading?: boolean;
}

export const DictTypeDialog: React.FC<DictTypeDialogProps> = ({
  open,
  onClose,
  onSave,
  title,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DictTypeForm>({
    defaultValues: {
      dictName: '',
      dictType: '',
    },
  });

  // 当初始数据变化时重置表单
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        dictName: '',
        dictType: '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: DictTypeForm) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('保存字典类型失败:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            {/* 字典类型名称 */}
            <div className="space-y-2">
              <label htmlFor="dictName" className="text-sm font-medium">
                字典类型名称 <span className="text-red-500">*</span>
              </label>
              <Input
                id="dictName"
                placeholder="请输入字典类型名称"
                {...register('dictName', {
                  required: '字典类型名称不能为空',
                  maxLength: {
                    value: 50,
                    message: '字典类型名称不能超过50个字符',
                  },
                })}
                className={errors.dictName ? 'border-red-500' : ''}
              />
              {errors.dictName && (
                <p className="text-sm text-red-500">{errors.dictName.message}</p>
              )}
            </div>

            {/* 字典类型编码 */}
            <div className="space-y-2">
              <label htmlFor="dictType" className="text-sm font-medium">
                字典类型编码 <span className="text-red-500">*</span>
              </label>
              <Input
                id="dictType"
                placeholder="请输入字典类型编码"
                {...register('dictType', {
                  required: '字典类型编码不能为空',
                  pattern: {
                    value: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                    message: '字典类型编码必须以字母开头，只能包含字母、数字和下划线',
                  },
                  maxLength: {
                    value: 30,
                    message: '字典类型编码不能超过30个字符',
                  },
                })}
                className={errors.dictType ? 'border-red-500' : ''}
              />
              {errors.dictType && (
                <p className="text-sm text-red-500">{errors.dictType.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};