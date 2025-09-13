import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { useDeviceManagement } from '../../hooks/useDeviceManagement';
import { toast } from 'sonner';

export interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  onSuccess: () => void;
}

/**
 * 验证码绑定设备对话框组件
 */
export function AddDeviceDialog({
  open,
  onOpenChange,
  agentId,
  onSuccess
}: AddDeviceDialogProps) {
  const [deviceCode, setDeviceCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { bindDevice } = useDeviceManagement(agentId);

  // 验证设备验证码格式
  const validateDeviceCode = (code: string): boolean => {
    return /^\d{6}$/.test(code);
  };

  // 处理确认绑定
  const handleConfirm = async () => {
    if (!validateDeviceCode(deviceCode)) {
      toast.error('请输入6位数字验证码');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Binding device with code:', deviceCode);
      
      await bindDevice({
        agentId,
        deviceCode
      });

      toast.success('设备已成功绑定');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('❌ Failed to bind device:', error);
      toast.error(error.message || '设备绑定失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理对话框关闭
  const handleClose = () => {
    setDeviceCode('');
    onOpenChange(false);
  };

  // 处理取消操作
  const handleCancel = () => {
    setDeviceCode('');
    onOpenChange(false);
  };

  // 处理Enter键按下
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* 对话框头部 */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            添加设备
          </DialogTitle>
        </DialogHeader>

        <Separator />

        {/* 对话框内容 */}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span>
              <span>验证码:</span>
            </label>
            <Input
              placeholder="请输入设备播报的6位数验证码..."
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={6}
              className="text-center text-lg tracking-wider font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              请在设备上播报验证码后，将6位数字输入到此处
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !deviceCode.trim()}
            className="flex-1"
          >
            {isLoading ? '绑定中...' : '确定'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}