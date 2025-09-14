import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useDeviceManagement } from '../../hooks/device/useDeviceManagement';
import { useFirmwareTypes } from '../../hooks/ota/useFirmwareTypes';
import { toast } from 'sonner';
import type { DeviceManualAddDTO } from '../../types/openapi/device';

// 表单验证schema
const manualAddDeviceSchema = z.object({
  board: z.string().min(1, '请选择设备型号'),
  appVersion: z.string().min(1, '请输入固件版本'),
  macAddress: z.string().regex(
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    '请输入正确的Mac地址格式，例如：00:1A:2B:3C:4D:5E'
  ),
});

type ManualAddDeviceFormData = z.infer<typeof manualAddDeviceSchema>;

export interface ManualAddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  onSuccess: () => void;
}

/**
 * 手动添加设备对话框组件
 */
export function ManualAddDeviceDialog({
  open,
  onOpenChange,
  agentId,
  onSuccess
}: ManualAddDeviceDialogProps) {
  const { manualAddDevice } = useDeviceManagement(agentId);
  const { firmwareTypes, isLoading: isLoadingFirmware } = useFirmwareTypes();

  // 表单管理
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ManualAddDeviceFormData>({
    resolver: zodResolver(manualAddDeviceSchema),
    defaultValues: {
      board: '',
      appVersion: '',
      macAddress: ''
    }
  });

  const boardValue = watch('board');

  // 处理表单提交
  const onSubmit = async (data: ManualAddDeviceFormData) => {
    try {
      console.log('🔄 Manually adding device:', data);
      
      const params: DeviceManualAddDTO = {
        agentId,
        ...data,
      };

      await manualAddDevice(params);

      toast.success('设备已成功添加');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('❌ Failed to manually add device:', error);
      toast.error(error.message || '设备添加失败');
    }
  };

  // 处理对话框关闭
  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // 处理取消操作
  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* 对话框头部 */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
              <PlusCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            手动添加设备
          </DialogTitle>
        </DialogHeader>

        <Separator />

        {/* 表单内容 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* 设备型号选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span>
              <span>设备型号:</span>
            </label>
            <Select
              value={boardValue}
              onValueChange={(value) => setValue('board', value)}
              disabled={isLoadingFirmware || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择设备型号" />
              </SelectTrigger>
              <SelectContent>
                {firmwareTypes && firmwareTypes.length > 0 ? firmwareTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.name}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
            {errors.board && (
              <p className="text-sm text-destructive">{errors.board.message}</p>
            )}
          </div>

          {/* 固件版本输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span>
              <span>固件版本:</span>
            </label>
            <Input
              {...register('appVersion')}
              placeholder="请输入固件版本"
              disabled={isSubmitting}
            />
            {errors.appVersion && (
              <p className="text-sm text-destructive">{errors.appVersion.message}</p>
            )}
          </div>

          {/* Mac地址输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span>
              <span>Mac地址:</span>
            </label>
            <Input
              {...register('macAddress')}
              placeholder="请输入Mac地址，例如：00:1A:2B:3C:4D:5E"
              className="font-mono"
              disabled={isSubmitting}
            />
            {errors.macAddress && (
              <p className="text-sm text-destructive">{errors.macAddress.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mac地址格式：XX:XX:XX:XX:XX:XX 或 XX-XX-XX-XX-XX-XX
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '添加中...' : '确定'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
