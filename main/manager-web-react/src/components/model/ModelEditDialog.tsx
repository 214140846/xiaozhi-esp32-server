/**
 * 模型编辑对话框组件
 * 复刻Vue版ModelEditDialog功能
 */

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModelProviders } from '@/hooks/useModelList'
import type { ModelConfig, ModelType, ModelFormData } from '@/types/model'

export interface ModelEditDialogProps {
  visible: boolean
  modelType: ModelType
  modelData: ModelConfig | null
  onSave: (provideCode: string, formData: ModelFormData, done?: () => void) => void
  onClose: () => void
}

export function ModelEditDialog({
  visible,
  modelType,
  modelData,
  onSave,
  onClose
}: ModelEditDialogProps) {
  // 表单状态
  const [form, setForm] = useState<ModelFormData>({
    modelCode: '',
    modelName: '',
    isDefault: false,
    isEnabled: true,
    configJson: {},
    docLink: '',
    remark: '',
    sort: 0,
    provideCode: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')

  // 获取供应商列表
  const { data: providers = [], isLoading: providersLoading } = useModelProviders(modelType)

  // 初始化表单数据
  useEffect(() => {
    if (modelData && visible) {
      setForm({
        id: modelData.id,
        modelCode: modelData.modelCode,
        modelName: modelData.modelName,
        isDefault: modelData.isDefault === 1,
        isEnabled: modelData.isEnabled === 1,
        configJson: modelData.configJson || {},
        docLink: modelData.docLink || '',
        remark: modelData.remark || '',
        sort: modelData.sort || 0,
        duplicateMode: (modelData as any).duplicateMode || false,
        provideCode: modelData.configJson?.type || ''
      })
      setSelectedProvider(modelData.configJson?.type || '')
    } else if (!modelData && visible) {
      // 新增模式
      setForm({
        modelCode: '',
        modelName: '',
        isDefault: false,
        isEnabled: true,
        configJson: {},
        docLink: '',
        remark: '',
        sort: 0,
        provideCode: ''
      })
      setSelectedProvider('')
    }
  }, [modelData, visible])

  // 表单字段更新
  const updateField = (field: keyof ModelFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // 处理供应商选择
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value)
    updateField('provideCode', value)
    updateField('configJson', { ...form.configJson, type: value })
  }

  // 处理保存
  const handleSave = async () => {
    // 基本验证
    if (!form.modelName.trim()) {
      alert('请输入模型名称')
      return
    }
    if (!form.modelCode.trim()) {
      alert('请输入模型编码')
      return
    }
    if (!selectedProvider) {
      alert('请选择供应商')
      return
    }

    setLoading(true)
    
    const done = () => {
      setLoading(false)
    }

    try {
      await onSave(selectedProvider, form, done)
    } catch (error) {
      setLoading(false)
    }
  }

  // 对话框标题
  const title = form.duplicateMode ? 'Create Copy' : (modelData ? 'Edit Model' : 'Add Model')

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="glass-container max-w-2xl border-0 shadow-2xl">
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {title}
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

        <div className="space-y-6">
          {/* 开关状态 */}
          <div className="flex justify-between items-center p-4 glass-card rounded-lg">
            <div className="flex items-center space-x-6">
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
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-white/90">Provider *</Label>
              <Select
                value={selectedProvider}
                onValueChange={handleProviderChange}
                disabled={providersLoading}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder={providersLoading ? "Loading..." : "Please select provider"} />
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
          </div>

          {/* 文档链接 */}
          <div className="space-y-2">
            <Label htmlFor="docLink" className="text-white/90">Documentation Link</Label>
            <Input
              id="docLink"
              value={form.docLink}
              onChange={(e) => updateField('docLink', e.target.value)}
              placeholder="Please enter documentation link"
              className="glass-input"
            />
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="remark" className="text-white/90">Remarks</Label>
            <Textarea
              id="remark"
              value={form.remark}
              onChange={(e) => updateField('remark', e.target.value)}
              placeholder="Please enter remarks"
              className="glass-input resize-none h-20"
            />
          </div>

          {/* 配置JSON */}
          <div className="space-y-2">
            <Label htmlFor="configJson" className="text-white/90">Configuration (JSON)</Label>
            <Textarea
              id="configJson"
              value={JSON.stringify(form.configJson, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  updateField('configJson', parsed)
                } catch {
                  // 忽略JSON解析错误，让用户继续编辑
                }
              }}
              placeholder="Please enter configuration JSON"
              className="glass-input resize-none h-32 font-mono text-sm"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="cyber-button"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}