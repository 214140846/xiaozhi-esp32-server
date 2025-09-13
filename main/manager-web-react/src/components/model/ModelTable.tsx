/**
 * 模型列表表格组件
 * 复刻Vue版el-table功能
 */

import { useMemo } from 'react'
import { Edit, Copy, Trash2, Volume2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ModelConfig, ModelType } from '@/types/model'

export interface ModelTableProps {
  models: ModelConfig[]
  loading: boolean
  activeTab: ModelType
  selectedModels: ModelConfig[]
  onSelectionChange: (selected: ModelConfig[]) => void
  onStatusChange: (model: ModelConfig) => void
  onDefaultChange: (model: ModelConfig) => void
  onEdit: (model: ModelConfig) => void
  onDuplicate: (model: ModelConfig) => void
  onDelete: (model: ModelConfig) => void
  onOpenTtsDialog?: (model: ModelConfig) => void
}

export function ModelTable({
  models,
  loading,
  activeTab,
  selectedModels,
  onSelectionChange,
  onStatusChange,
  onDefaultChange,
  onEdit,
  onDuplicate,
  onDelete,
  onOpenTtsDialog
}: ModelTableProps) {
  // 是否全选状态
  const isAllSelected = useMemo(() => {
    return models.length > 0 && selectedModels.length === models.length
  }, [models, selectedModels])

  // 是否部分选择

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? models : [])
  }

  // 处理单项选择
  const handleSelectItem = (model: ModelConfig, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedModels, model])
    } else {
      onSelectionChange(selectedModels.filter(m => m.id !== model.id))
    }
  }

  // 检查是否选中
  const isSelected = (model: ModelConfig) => {
    return selectedModels.some(m => m.id === model.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 glass-container">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/70">Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b border-white/10 hover:bg-transparent">
            <TableHead className="w-12 text-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
            </TableHead>
            <TableHead className="text-white/90 font-medium">Model ID</TableHead>
            <TableHead className="text-white/90 font-medium">Model Name</TableHead>
            <TableHead className="text-white/90 font-medium">Provider</TableHead>
            <TableHead className="text-white/90 font-medium text-center">Enabled</TableHead>
            <TableHead className="text-white/90 font-medium text-center">Default</TableHead>
            {activeTab === 'tts' && (
              <TableHead className="text-white/90 font-medium text-center">Voice Management</TableHead>
            )}
            <TableHead className="text-white/90 font-medium text-center w-48">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.length === 0 ? (
            <TableRow>
              <TableCell colSpan={activeTab === 'tts' ? 8 : 7} className="h-32 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-white/50 text-lg">No models found</div>
                  <div className="text-white/30 text-sm">Try adjusting your search criteria</div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            models.map((model) => (
              <TableRow
                key={model.id}
                className={cn(
                  "border-b border-white/5 hover:bg-white/5 transition-colors",
                  isSelected(model) && "bg-purple-500/10"
                )}
              >
                {/* 选择框 */}
                <TableCell className="text-center">
                  <Checkbox
                    checked={isSelected(model)}
                    onCheckedChange={(checked) => handleSelectItem(model, !!checked)}
                    className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                </TableCell>

                {/* 模型ID */}
                <TableCell className="text-white/90 font-mono text-sm">
                  {model.id}
                </TableCell>

                {/* 模型名称 */}
                <TableCell className="text-white/90 font-medium">
                  <div className="flex flex-col">
                    <span>{model.modelName}</span>
                    <span className="text-xs text-white/50 font-mono">{model.modelCode}</span>
                  </div>
                </TableCell>

                {/* 提供商 */}
                <TableCell className="text-white/90">
                  <Badge variant="secondary" className="bg-white/10 text-white/80 border-white/20">
                    {model.configJson?.type || 'Unknown'}
                  </Badge>
                </TableCell>

                {/* 启用状态 */}
                <TableCell className="text-center">
                  <Switch
                    checked={model.isEnabled === 1}
                    onCheckedChange={() => onStatusChange(model)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </TableCell>

                {/* 默认状态 */}
                <TableCell className="text-center">
                  <Switch
                    checked={model.isDefault === 1}
                    onCheckedChange={() => onDefaultChange(model)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </TableCell>

                {/* TTS音色管理 */}
                {activeTab === 'tts' && (
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenTtsDialog?.(model)}
                      className="glass-button text-xs hover:bg-purple-500/20"
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      Voice Management
                    </Button>
                  </TableCell>
                )}

                {/* 操作按钮 */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(model)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDuplicate(model)}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-2"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(model)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}