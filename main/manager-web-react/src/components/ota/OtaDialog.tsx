import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { FirmwareType, OtaFormData } from '@/types/ota';

export interface OtaDialogProps {
  isVisible: boolean;
  dialogTitle: string;
  firmwareTypes: FirmwareType[];
  onClose: () => void;
  onSubmit: () => void;
  formData: any;
  updateField: (field: keyof OtaFormData, value: any) => void;
  handleFileUpload: (file: File) => boolean;
  handleFileRemove: () => void;
  uploadProgress: number;
  uploadStatus: string;
  isUploading: boolean;
  isSaving: boolean;
}

/**
 * OTA固件管理对话框组件
 * 支持固件信息的新增和编辑功能
 * 包含固件文件上传、进度显示等完整功能
 */
export function OtaDialog({
  isVisible,
  dialogTitle,
  firmwareTypes,
  onClose,
  onSubmit,
  formData,
  updateField,
  handleFileUpload,
  handleFileRemove,
  uploadProgress,
  uploadStatus,
  isUploading,
  isSaving,
}: OtaDialogProps) {
  const isEditMode = !!formData.id;

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('OtaDialog: 选择文件:', file.name);
      const success = handleFileUpload(file);
      if (!success) {
        // 清空input值以允许重新选择相同文件
        event.target.value = '';
      }
    }
  };

  // 获取上传状态图标和颜色
  const getUploadStatusDisplay = () => {
    switch (uploadStatus) {
      case 'success':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          color: 'text-green-500',
          text: '上传成功'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          color: 'text-red-500',
          text: '上传失败'
        };
      case 'uploading':
        return {
          icon: <Upload className="h-4 w-4 text-blue-500 animate-pulse" />,
          color: 'text-blue-500',
          text: '上传中...'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getUploadStatusDisplay();

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="glass-container max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 固件名称 */}
          <div className="space-y-2">
            <Label htmlFor="firmwareName" className="text-white">
              固件名称 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="firmwareName"
              value={formData.firmwareName}
              onChange={(e) => updateField('firmwareName', e.target.value)}
              placeholder="请输入固件名称(板子+版本号)"
              className="glass-input"
            />
          </div>

          {/* 固件类型 */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-white">
              固件类型 <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateField('type', value)}
              disabled={isEditMode}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="请选择固件类型" />
              </SelectTrigger>
              <SelectContent>
                {firmwareTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 版本号 */}
          <div className="space-y-2">
            <Label htmlFor="version" className="text-white">
              版本号 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => updateField('version', e.target.value)}
              placeholder="请输入版本号(x.x.x格式)"
              className="glass-input"
            />
          </div>

          {/* 固件文件上传 */}
          <div className="space-y-2">
            <Label className="text-white">
              固件文件 {!isEditMode && <span className="text-red-400">*</span>}
            </Label>
            
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-purple-400" />
                      <p className="mb-2 text-sm text-purple-300">
                        <span className="font-semibold">点击上传</span> 固件文件
                      </p>
                      <p className="text-xs text-purple-400">
                        支持 .bin/.apk 格式，最大100MB
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".bin,.apk"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                {/* 上传进度 */}
                {(isUploading || uploadStatus === 'success') && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {statusDisplay?.icon}
                        <span className={`text-sm ${statusDisplay?.color}`}>
                          {statusDisplay?.text}
                        </span>
                      </div>
                      {formData.firmwarePath && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleFileRemove}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Progress 
                      value={uploadProgress} 
                      className="h-2 bg-purple-900/50"
                    />
                    <p className="text-xs text-purple-300">
                      {uploadProgress}% 完成
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 温馨提示 */}
            <Alert className="glass-card border-blue-500/30">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>温馨提示：</strong>请上传合并前的xiaozhi.bin文件，而不是合并后的merged-binary.bin文件
              </AlertDescription>
            </Alert>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="remark" className="text-white">
              备注
            </Label>
            <Textarea
              id="remark"
              value={formData.remark}
              onChange={(e) => updateField('remark', e.target.value)}
              placeholder="请输入备注信息"
              rows={3}
              className="glass-input"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="glass-button"
          >
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSaving}
            className="cyber-button"
          >
            {isSaving ? '保存中...' : '确定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}