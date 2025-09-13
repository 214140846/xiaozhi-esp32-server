/**
 * 参数管理页面
 * 系统参数的管理界面，支持查看、搜索、新增、编辑、删除参数
 */
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { HeaderBar } from '../components/home/HeaderBar';
import { ParamTable } from '../components/params/ParamTable';
import { ParamPagination } from '../components/params/ParamPagination';
import { ParamFormDialog } from '../components/params/ParamFormDialog';
import { useParamsManagement } from '../hooks/useParamsManagement';
import type { ParamForm, ParamItem } from '../types/params';

export function ParamsManagementPage() {
  console.log('[ParamsManagementPage] 组件渲染');
  
  const {
    // 数据
    params,
    total,
    currentPage,
    pageSize,
    searchCode,
    selectedRows,
    
    // 状态
    loading,
    error,
    submitting,
    deleting,
    
    // 操作方法
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleRowSelection,
    handleSelectAll,
    handleSubmitParam,
    handleDeleteSelected,
    handleDeleteParam,
    refetch,
    
    // 配置
    pageCount,
    isAllSelected,
    hasSelection
  } = useParamsManagement();

  // 本地状态
  const [searchInput, setSearchInput] = useState(searchCode);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<ParamItem | null>(null);

  // 处理搜索输入
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // 处理搜索提交
  const handleSearchSubmit = () => {
    handleSearch(searchInput);
  };

  // 处理回车搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // 打开新增对话框
  const handleAdd = () => {
    console.log('[ParamsManagementPage] 打开新增对话框');
    setEditingParam(null);
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (param: ParamItem) => {
    console.log('[ParamsManagementPage] 打开编辑对话框', param);
    setEditingParam(param);
    setDialogOpen(true);
  };

  // 处理表单提交
  const handleFormSubmit = async (formData: ParamForm) => {
    console.log('[ParamsManagementPage] 提交表单数据', formData);
    
    try {
      const submitData = editingParam?.id 
        ? { ...formData, id: editingParam.id }
        : formData;
      
      await handleSubmitParam(submitData);
      console.log('[ParamsManagementPage] 表单提交成功');
    } catch (error) {
      console.error('[ParamsManagementPage] 表单提交失败:', error);
      throw error;
    }
  };

  // 处理删除单个参数
  const handleDeleteSingle = async (id: number) => {
    if (window.confirm('确定要删除这个参数吗？')) {
      console.log('[ParamsManagementPage] 删除单个参数', id);
      try {
        await handleDeleteParam(id);
        console.log('[ParamsManagementPage] 删除成功');
      } catch (error) {
        console.error('[ParamsManagementPage] 删除失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.length === 0) {
      alert('请先选择需要删除的参数');
      return;
    }
    
    if (window.confirm(`确定要删除选中的 ${selectedRows.length} 个参数吗？`)) {
      console.log('[ParamsManagementPage] 批量删除参数', selectedRows);
      try {
        await handleDeleteSelected();
        console.log('[ParamsManagementPage] 批量删除成功');
      } catch (error) {
        console.error('[ParamsManagementPage] 批量删除失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  // 全选/取消全选
  const handleToggleSelectAll = () => {
    handleSelectAll(!isAllSelected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部导航 */}
      <HeaderBar 
        onSearch={(q) => setSearchInput(q)}
        onSearchReset={() => setSearchInput('')}
        searchQuery={searchInput}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* 页面标题和操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            参数管理
          </h1>
          
          {/* 搜索和操作区域 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="请输入参数编码或备注查询"
                value={searchInput}
                onChange={handleSearchInput}
                onKeyPress={handleKeyPress}
                className="w-64"
              />
              <Button 
                onClick={handleSearchSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                搜索
              </Button>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">
                {error instanceof Error ? error.message : '加载数据失败，请重试'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                重新加载
              </Button>
            </div>
          )}

          {/* 表格区域 */}
          <div className="p-6">
            <ParamTable
              params={params}
              selectedRows={selectedRows}
              loading={loading}
              onRowSelection={handleRowSelection}
              onEdit={handleEdit}
              onDelete={handleDeleteSingle}
            />
          </div>

          {/* 底部操作栏和分页 */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex justify-between items-center">
              {/* 左侧操作按钮 */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleToggleSelectAll}
                  disabled={loading || params.length === 0}
                  className="min-w-[80px]"
                >
                  {isAllSelected ? '取消全选' : '全选'}
                </Button>
                
                <Button
                  onClick={handleAdd}
                  className="bg-green-600 hover:bg-green-700"
                >
                  新增
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleBatchDelete}
                  disabled={!hasSelection || deleting}
                >
                  {deleting ? '删除中...' : '删除'}
                </Button>
              </div>

              {/* 右侧分页 */}
              <ParamPagination
                currentPage={currentPage}
                pageSize={pageSize}
                total={total}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 参数表单对话框 */}
      <ParamFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingParam}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </div>
  );
}