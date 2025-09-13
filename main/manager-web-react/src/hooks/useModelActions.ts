/**
 * 模型操作Hook
 * 处理模型的增删改查操作
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { ModelApi } from '@/api/modelApi'
import { MODEL_QUERY_KEY } from './useModelList'
import type {
  ModelActionParams,
  UseModelActionsResult,
  ModelType
} from '@/types/model'

export function useModelActions(_modelType: ModelType): UseModelActionsResult {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // 刷新模型列表
  const invalidateModels = () => {
    queryClient.invalidateQueries({ queryKey: [MODEL_QUERY_KEY] })
  }

  // 新增模型
  const createModelMutation = useMutation({
    mutationFn: (params: ModelActionParams) => ModelApi.addModel(params),
    onSuccess: (response) => {
      if (response.code === 0) {
        toast({
          title: '新增成功',
          description: '模型已成功创建'
        })
        invalidateModels()
      } else {
        toast({
          title: '新增失败',
          description: response.msg || '新增模型失败',
          variant: 'destructive'
        })
      }
    },
    onError: (error: Error) => {
      console.error('新增模型失败:', error)
      toast({
        title: '新增失败',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // 更新模型
  const updateModelMutation = useMutation({
    mutationFn: (params: ModelActionParams) => ModelApi.updateModel(params),
    onSuccess: (response) => {
      if (response.code === 0) {
        toast({
          title: '保存成功',
          description: '模型配置已更新'
        })
        invalidateModels()
      } else {
        toast({
          title: '保存失败',
          description: response.msg || '保存失败',
          variant: 'destructive'
        })
      }
    },
    onError: (error: Error) => {
      console.error('更新模型失败:', error)
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // 删除模型
  const deleteModelMutation = useMutation({
    mutationFn: (id: number) => ModelApi.deleteModel(id),
    onSuccess: (response) => {
      if (response.code === 0) {
        toast({
          title: '删除成功',
          description: '模型已删除'
        })
        invalidateModels()
      } else {
        toast({
          title: '删除失败',
          description: response.msg || '删除失败',
          variant: 'destructive'
        })
      }
    },
    onError: (error: Error) => {
      console.error('删除模型失败:', error)
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => ModelApi.batchDeleteModels(ids),
    onSuccess: (results) => {
      const successCount = results.filter(r => r.code === 0).length
      const totalCount = results.length
      
      if (successCount === totalCount) {
        toast({
          title: '批量删除成功',
          description: `已删除 ${successCount} 个模型`
        })
      } else {
        toast({
          title: '部分删除失败',
          description: `${successCount}/${totalCount} 个模型删除成功`,
          variant: 'destructive'
        })
      }
      invalidateModels()
    },
    onError: (error: Error) => {
      console.error('批量删除失败:', error)
      toast({
        title: '批量删除失败',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // 切换模型状态
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => 
      ModelApi.updateModelStatus(id, status),
    onSuccess: (response, { status }) => {
      if (response.code === 0) {
        toast({
          title: status === 1 ? '启用成功' : '禁用成功',
          description: `模型已${status === 1 ? '启用' : '禁用'}`
        })
        invalidateModels()
      } else {
        toast({
          title: '操作失败',
          description: response.msg || '操作失败',
          variant: 'destructive'
        })
        // 操作失败时刷新数据以恢复状态
        invalidateModels()
      }
    },
    onError: (error: Error) => {
      console.error('更新状态失败:', error)
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      })
      // 错误时刷新数据以恢复状态
      invalidateModels()
    }
  })

  // 设置默认模型
  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => ModelApi.setDefaultModel(id),
    onSuccess: (response) => {
      if (response.code === 0) {
        toast({
          title: '设置默认模型成功',
          description: '默认模型已更新'
        })
        invalidateModels()
      } else {
        toast({
          title: '设置失败',
          description: response.msg || '设置默认模型失败',
          variant: 'destructive'
        })
      }
    },
    onError: (error: Error) => {
      console.error('设置默认模型失败:', error)
      toast({
        title: '设置失败',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  return {
    createModel: async (params: ModelActionParams) => {
      return createModelMutation.mutateAsync(params)
    },
    updateModel: async (params: ModelActionParams) => {
      return updateModelMutation.mutateAsync(params)
    },
    deleteModel: async (id: number) => {
      return deleteModelMutation.mutateAsync(id)
    },
    toggleModelStatus: async (id: number, status: number) => {
      return toggleStatusMutation.mutateAsync({ id, status })
    },
    setDefaultModel: async (id: number) => {
      return setDefaultMutation.mutateAsync(id)
    },
    batchDelete: async (ids: number[]) => {
      return batchDeleteMutation.mutateAsync(ids)
    }
  }
}