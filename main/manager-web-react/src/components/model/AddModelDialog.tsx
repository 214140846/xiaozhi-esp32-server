/**
 * 新增模型对话框组件
 * 简化版的模型添加界面
 */

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModelProviders } from '@/hooks/useModelList'
import type { ModelType, ModelFormData } from '@/types/model'

export interface AddModelDialogProps {
  visible: boolean
  modelType: ModelType
  onConfirm: (formData: ModelFormData) => void
  onClose: () => void
}

export function AddModelDialog({
  visible,
  modelType,
  onConfirm,
  onClose
}: AddModelDialogProps) {
  const [form, setForm] = useState({
    modelCode: '',
    modelName: '',
    isDefault: false,
    isEnabled: true,
    provideCode: '',
    sort: 0
  })

  // 获取供应商列表
  const { data: providers = [] } = useModelProviders(modelType)

  // 表单字段更新
  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // 处理确认
  const handleConfirm = () => {
    // 基本验证
    if (!form.modelName.trim()) {
      alert('请输入模型名称')
      return
    }
    if (!form.modelCode.trim()) {
      alert('请输入模型编码')
      return
    }
    if (!form.provideCode) {
      alert('请选择供应商')
      return
    }

    const formData: ModelFormData = {
      modelCode: form.modelCode,
      modelName: form.modelName,
      isDefault: form.isDefault,
      isEnabled: form.isEnabled,
      configJson: { type: form.provideCode },
      sort: form.sort,
      provideCode: form.provideCode
    }

    onConfirm(formData)
    // 重置表单
    setForm({
      modelCode: '',
      modelName: '',
      isDefault: false,
      isEnabled: true,
      provideCode: '',
      sort: 0
    })
  }

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="glass-container max-w-md border-0 shadow-2xl">
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Add New Model
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <Label htmlFor="modelName" className="text-white/90">Model Name *</Label>
            <Input
              id="modelName"
              value={form.modelName}
              onChange={(e) => updateField('modelName', e.target.value)}
              placeholder="Please enter model name"
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelCode" className="text-white/90">Model Code *</Label>
            <Input
              id="modelCode"
              value={form.modelCode}
              onChange={(e) => updateField('modelCode', e.target.value)}
              placeholder="Please enter model code"
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider" className="text-white/90">Provider *</Label>
            <Select
              value={form.provideCode}
              onValueChange={(value) => updateField('provideCode', value)}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Please select provider" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {(providers as any[]).map((provider: any) => (
                  <SelectItem 
                    key={provider.value} 
                    value={provider.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort" className="text-white/90">Sort Order</Label>
            <Input
              id="sort"
              type="number"
              value={form.sort}
              onChange={(e) => updateField('sort', Number(e.target.value) || 0)}
              placeholder="Please enter sort order"
              className="glass-input"
            />
          </div>

          {/* 状态开关 */}
          <div className="flex justify-between p-4 glass-card rounded-lg">
            <div className="flex items-center space-x-2">
              <Label htmlFor="isEnabled" className="text-white/90">Enabled</Label>
              <Switch
                id="isEnabled"
                checked={form.isEnabled}
                onCheckedChange={(checked) => updateField('isEnabled', checked)}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isDefault" className="text-white/90">Set as Default</Label>
              <Switch
                id="isDefault"
                checked={form.isDefault}
                onCheckedChange={(checked) => updateField('isDefault', checked)}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="cyber-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}