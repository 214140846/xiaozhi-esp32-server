/**
 * AI模型配置管理页面
 * 复刻Vue版ModelConfig.vue的所有功能
 */

import { useState, useCallback, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useModelList } from '@/hooks/useModelList'
import { useModelActions } from '@/hooks/useModelActions'
import { usePagination } from '@/hooks/usePagination'
import { ModelNavigation } from '@/components/model/ModelNavigation'
import { ModelTable } from '@/components/model/ModelTable'
import { ModelEditDialog } from '@/components/model/ModelEditDialog'
import { TtsVoiceDialog } from '@/components/model/TtsVoiceDialog'
import { AddModelDialog } from '@/components/model/AddModelDialog'
import type { ModelType, ModelConfig, ModelFormData } from '@/types/model'
import { ModelTypeTextMap } from '@/types/model'

export default function ModelConfigPage() {
  // 状态管理
  const [activeTab, setActiveTab] = useState<ModelType>('llm')
  const [search, setSearch] = useState('')
  const [selectedModels, setSelectedModels] = useState<ModelConfig[]>([])
  
  // 对话框状态
  const [editDialogVisible, setEditDialogVisible] = useState(false)
  const [addDialogVisible, setAddDialogVisible] = useState(false)
  const [ttsDialogVisible, setTtsDialogVisible] = useState(false)
  const [editModelData, setEditModelData] = useState<ModelConfig | null>(null)
  const [selectedTtsModelId, setSelectedTtsModelId] = useState<number | null>(null)
  const [selectedModelConfig, setSelectedModelConfig] = useState<ModelConfig | null>(null)

  // 分页管理
  const pagination = usePagination(10, (_page, _pageSize) => {
    // 页码变化时自动重新加载数据
  })

  // 构建查询参数
  const queryParams = {
    modelType: activeTab,
    modelName: search,
    page: pagination.currentPage,
    limit: pagination.pageSize
  }

  // 数据查询
  const { models, loading, total, refresh } = useModelList(queryParams)
  const modelActions = useModelActions(activeTab)

  // 同步总数到分页器
  useEffect(() => {
    pagination.setTotal(total)
  }, [total, pagination])

  // 页面标题
  const modelTypeText = ModelTypeTextMap[activeTab] || 'Model Configuration'

  // 搜索处理
  const handleSearch = useCallback(() => {
    pagination.goFirst() // 搜索时重置到第一页
    refresh()
  }, [pagination, refresh])

  // 回车搜索
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  // 左侧导航切换
  const handleMenuSelect = useCallback((modelType: ModelType) => {
    setActiveTab(modelType)
    pagination.goFirst() // 切换类型时重置到第一页
    setSearch('') // 清空搜索
    setSelectedModels([]) // 清空选择
  }, [pagination])

  // 表格选择变化
  const handleSelectionChange = useCallback((selected: ModelConfig[]) => {
    setSelectedModels(selected)
  }, [])

  // 全选/取消全选
  const handleSelectAll = useCallback(() => {
    if (selectedModels.length === models.length && models.length > 0) {
      setSelectedModels([])
    } else {
      setSelectedModels(models)
    }
  }, [selectedModels, models])

  // 模型操作
  const handleAddModel = useCallback(() => {
    setAddDialogVisible(true)
  }, [])

  const handleEditModel = useCallback((model: ModelConfig) => {
    setEditModelData({ ...model })
    setEditDialogVisible(true)
  }, [])

  const handleDuplicateModel = useCallback((model: ModelConfig) => {
    // 标记复制模式通过外部状态，而不是往 ModelConfig 塞额外字段
    setEditModelData({ ...model })
    ;(setEditModelData as any).duplicateMode = true
    setEditDialogVisible(true)
  }, [])

  const handleDeleteModel = useCallback(async (model: ModelConfig) => {
    if (window.confirm('确定要删除该模型吗?')) {
      try {
        await modelActions.deleteModel(model.id)
        refresh()
      } catch (error) {
        console.error('删除模型失败:', error)
      }
    }
  }, [modelActions, refresh])

  // 批量删除
  const handleBatchDelete = useCallback(async () => {
    if (selectedModels.length === 0) {
      alert('请先选择要删除的模型')
      return
    }

    if (window.confirm('确定要删除选中的模型吗?')) {
      try {
        const ids = selectedModels.map(m => m.id)
        await modelActions.batchDelete(ids)
        setSelectedModels([])
        refresh()
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    }
  }, [selectedModels, modelActions, refresh])

  // 状态切换
  const handleStatusChange = useCallback(async (model: ModelConfig) => {
    const newStatus = model.isEnabled ? 0 : 1
    try {
      await modelActions.toggleModelStatus(model.id, newStatus)
    } catch (error) {
      console.error('状态切换失败:', error)
    }
  }, [modelActions])

  // 设置默认模型
  const handleDefaultChange = useCallback(async (model: ModelConfig) => {
    try {
      await modelActions.setDefaultModel(model.id)
    } catch (error) {
      console.error('设置默认模型失败:', error)
    }
  }, [modelActions])

  // TTS音色管理
  const handleOpenTtsDialog = useCallback((model: ModelConfig) => {
    setSelectedTtsModelId(model.id)
    setSelectedModelConfig(model)
    setTtsDialogVisible(true)
  }, [])

  // 模型保存
  const handleModelSave = useCallback(async (
    provideCode: string, 
    formData: ModelFormData,
    done?: () => void
  ) => {
    try {
      const params = {
        modelType: activeTab,
        provideCode,
        formData,
        id: formData.id
      }

      if ((editModelData as any)?.duplicateMode) {
        await modelActions.createModel(params)
      } else if (formData.id) {
        await modelActions.updateModel(params)
      } else {
        await modelActions.createModel(params)
      }

      setEditDialogVisible(false)
      setEditModelData(null)
      refresh()
    } catch (error) {
      console.error('保存模型失败:', error)
    } finally {
      done?.()
    }
  }, [activeTab, editModelData, modelActions, refresh])

  // 新增确认
  const handleAddConfirm = useCallback(async (formData: ModelFormData) => {
    try {
      const params = {
        modelType: activeTab,
        provideCode: formData.provideCode || '',
        formData: {
          ...formData,
          isDefault: formData.isDefault,
          isEnabled: formData.isEnabled
        }
      }

      await modelActions.createModel(params)
      setAddDialogVisible(false)
      refresh()
    } catch (error) {
      console.error('新增模型失败:', error)
    }
  }, [activeTab, modelActions, refresh])

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 min-h-screen">
      {/* 操作栏 */}
      <div className="flex justify-between items-center p-6">
        <h2 className="text-2xl font-semibold text-white">{modelTypeText}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="请输入模型名称查询"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-60 glass-input"
            />
            <Button 
              onClick={handleSearch}
              className="cyber-button"
            >
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 mx-6 mb-6">
        <div className="flex h-full glass-container rounded-xl overflow-hidden">
          {/* 左侧导航 */}
          <ModelNavigation
            activeTab={activeTab}
            onMenuSelect={handleMenuSelect}
          />

          {/* 右侧内容 */}
          <div className="flex-1 flex flex-col p-6 bg-white/5 backdrop-blur-sm">
            <Card className="flex-1 flex flex-col glass-card border-0 shadow-lg overflow-hidden">
              <div className="flex-1 flex flex-col">
                <ModelTable
                  models={models}
                  loading={loading}
                  activeTab={activeTab}
                  selectedModels={selectedModels}
                  onSelectionChange={handleSelectionChange}
                  onStatusChange={handleStatusChange}
                  onDefaultChange={handleDefaultChange}
                  onEdit={handleEditModel}
                  onDuplicate={handleDuplicateModel}
                  onDelete={handleDeleteModel}
                  onOpenTtsDialog={handleOpenTtsDialog}
                />

                {/* 表格底部操作栏 */}
                <div className="flex justify-between items-center p-4 border-t border-white/10 bg-white/5">
                  {/* 批量操作 */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAll}
                      className="glass-button"
                    >
                      {selectedModels.length === models.length && models.length > 0 ? '取消全选' : '全选'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddModel}
                      className="cyber-button"
                    >
                      新增
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBatchDelete}
                      disabled={selectedModels.length === 0}
                      className="glass-button hover:bg-red-500/20"
                    >
                      删除
                    </Button>
                  </div>

                  {/* 分页器 */}
                  <div className="flex items-center gap-2">
                    <select
                      value={pagination.pageSize}
                      onChange={(e) => pagination.setPageSize(Number(e.target.value))}
                      className="px-3 py-1 rounded bg-white/10 text-white border border-white/20"
                    >
                      {pagination.pageSizeOptions.map(size => (
                        <option key={size} value={size} className="bg-gray-800">
                          {size}条/页
                        </option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pagination.goFirst}
                      disabled={pagination.currentPage === 1}
                      className="glass-button"
                    >
                      首页
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pagination.goPrev}
                      disabled={pagination.currentPage === 1}
                      className="glass-button"
                    >
                      上一页
                    </Button>

                    {pagination.visiblePages.map(page => (
                      <Button
                        key={page}
                        size="sm"
                        variant={page === pagination.currentPage ? "default" : "outline"}
                        onClick={() => pagination.goToPage(page)}
                        className={page === pagination.currentPage ? "cyber-button" : "glass-button"}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pagination.goNext}
                      disabled={pagination.currentPage === pagination.pageCount}
                      className="glass-button"
                    >
                      下一页
                    </Button>
                    <span className="text-sm text-white/70 ml-2">
                      共{total}条记录
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 对话框 */}
      <ModelEditDialog
        visible={editDialogVisible}
        modelType={activeTab}
        modelData={editModelData}
        onSave={handleModelSave}
        onClose={() => {
          setEditDialogVisible(false)
          setEditModelData(null)
        }}
      />

      <AddModelDialog
        visible={addDialogVisible}
        modelType={activeTab}
        onConfirm={handleAddConfirm}
        onClose={() => setAddDialogVisible(false)}
      />

      {selectedTtsModelId && (
        <TtsVoiceDialog
          visible={ttsDialogVisible}
          ttsModelId={selectedTtsModelId}
          modelConfig={selectedModelConfig}
          onClose={() => {
            setTtsDialogVisible(false)
            setSelectedTtsModelId(null)
            setSelectedModelConfig(null)
          }}
        />
      )}
    </div>
  )
}