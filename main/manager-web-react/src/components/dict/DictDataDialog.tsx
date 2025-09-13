/**
 * 字典数据编辑对话框组件
 * 用于新增和编辑字典数据
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
import type { DictDataForm } from '../../types/dict';

export interface DictDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DictDataForm) => Promise<void>;
  title: string;
  initialData?: DictDataForm;
  dictTypeId: number;
  isLoading?: boolean;
}

export const DictDataDialog: React.FC<DictDataDialogProps> = ({
  open,
  onClose,
  onSave,
  title,
  initialData,
  dictTypeId,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DictDataForm>({
    defaultValues: {
      dictLabel: '',
      dictValue: '',
      sort: 0,
      dictTypeId,
    },
  });

  // 当初始数据变化时重置表单
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dictTypeId,
      });
    } else {
      reset({
        dictLabel: '',
        dictValue: '',
        sort: 0,
        dictTypeId,
      });
    }
  }, [initialData, dictTypeId, reset]);

  const onSubmit = async (data: DictDataForm) => {
    try {
      await onSave({
        ...data,
        dictTypeId,
      });
      onClose();
    } catch (error) {
      console.error('保存字典数据失败:', error);
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
            {/* 字典标签 */}
            <div className="space-y-2">
              <label htmlFor="dictLabel" className="text-sm font-medium">
                字典标签 <span className="text-red-500">*</span>
              </label>
              <Input
                id="dictLabel"
                placeholder="请输入字典标签"
                {...register('dictLabel', {
                  required: '字典标签不能为空',
                  maxLength: {
                    value: 50,
                    message: '字典标签不能超过50个字符',
                  },
                })}
                className={errors.dictLabel ? 'border-red-500' : ''}
              />
              {errors.dictLabel && (
                <p className="text-sm text-red-500">{errors.dictLabel.message}</p>
              )}
            </div>

            {/* 字典值 */}
            <div className="space-y-2">
              <label htmlFor="dictValue" className="text-sm font-medium">
                字典值 <span className="text-red-500">*</span>
              </label>
              <Input
                id="dictValue"
                placeholder="请输入字典值"
                {...register('dictValue', {
                  required: '字典值不能为空',
                  maxLength: {
                    value: 100,
                    message: '字典值不能超过100个字符',
                  },
                })}
                className={errors.dictValue ? 'border-red-500' : ''}
              />
              {errors.dictValue && (
                <p className="text-sm text-red-500">{errors.dictValue.message}</p>
              )}
            </div>

            {/* 排序 */}
            <div className="space-y-2">
              <label htmlFor="sort" className="text-sm font-medium">
                排序
              </label>
              <Input
                id="sort"
                type="number"
                placeholder="请输入排序值"
                {...register('sort', {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: '排序值不能小于0',
                  },
                  max: {
                    value: 9999,
                    message: '排序值不能大于9999',
                  },
                })}
                className={errors.sort ? 'border-red-500' : ''}
              />
              {errors.sort && (
                <p className="text-sm text-red-500">{errors.sort.message}</p>
              )}
              <p className="text-xs text-gray-500">
                数值越小排序越靠前
              </p>
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