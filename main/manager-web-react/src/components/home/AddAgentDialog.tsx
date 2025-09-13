import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Bot, Plus } from 'lucide-react';

export interface AddAgentDialogProps {
  /** 对话框显示状态 */
  open: boolean;
  /** 对话框状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 添加成功回调 */
  onSuccess: () => void;
}

/**
 * 添加智能体对话框组件
 * 
 * 功能包括：
 * - 智能体名称输入
 * - 智能体描述输入（可选）
 * - 表单验证
 * - 添加操作
 */
export function AddAgentDialog({ open, onOpenChange, onSuccess }: AddAgentDialogProps) {
  console.log('[AddAgentDialog] 对话框状态:', open);

  const [formData, setFormData] = useState({
    agentName: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 处理表单输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除错误信息
    if (error) {
      setError('');
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      agentName: '',
      description: ''
    });
    setError('');
    setIsLoading(false);
  };

  // 处理关闭对话框
  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.agentName.trim()) {
      setError('请输入智能体名称');
      return;
    }

    if (formData.agentName.trim().length < 2) {
      setError('智能体名称至少需要2个字符');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[AddAgentDialog] 提交表单数据:', formData);
      
      // TODO: 调用API添加智能体
      // const response = await addAgentApi(formData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[AddAgentDialog] 智能体添加成功');
      resetForm();
      onSuccess();
    } catch (err) {
      console.error('[AddAgentDialog] 添加智能体失败:', err);
      setError(err instanceof Error ? err.message : '添加智能体失败，请重试');
      setIsLoading(false);
    }
  };

  // 对话框未打开时不渲染
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 对话框主体 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto transform transition-all">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                添加智能体
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                创建一个新的AI助手
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 智能体名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              智能体名称 *
            </label>
            <Input
              type="text"
              value={formData.agentName}
              onChange={(e) => handleInputChange('agentName', e.target.value)}
              placeholder="输入智能体名称"
              disabled={isLoading}
              className="w-full"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.agentName.length}/50
            </p>
          </div>

          {/* 智能体描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              描述 (可选)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="简单描述一下这个智能体的功能..."
              disabled={isLoading}
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.description.length}/200
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.agentName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  创建智能体
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}