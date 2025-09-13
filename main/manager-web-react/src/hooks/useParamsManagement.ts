/**
 * 参数管理业务逻辑Hook
 * 封装参数的CRUD操作、分页、搜索等功能
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paramsApi } from '../api/params';
import type { ParamForm, ParamsListRequest, PageSize } from '../types/params';
import { PAGE_SIZE_OPTIONS } from '../types/params';

export const useParamsManagement = () => {
  const queryClient = useQueryClient();
  
  // 状态管理
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [searchCode, setSearchCode] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // 构建查询参数
  const queryParams: ParamsListRequest = {
    page: currentPage,
    limit: pageSize,
    paramCode: searchCode || undefined
  };

  // 获取参数列表查询
  const {
    data: paramsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['params', queryParams],
    queryFn: () => paramsApi.getParamsList(queryParams),
    select: (response) => {
      if (response.status === 0) {
        return response.data;
      }
      throw new Error(response.msg || '获取参数列表失败');
    }
  });

  // 新增参数
  const addParamMutation = useMutation({
    mutationFn: paramsApi.addParam,
    onSuccess: (response) => {
      if (response.status === 0) {
        queryClient.invalidateQueries({ queryKey: ['params'] });
      } else {
        throw new Error(response.msg || '新增参数失败');
      }
    }
  });

  // 更新参数
  const updateParamMutation = useMutation({
    mutationFn: paramsApi.updateParam,
    onSuccess: (response) => {
      if (response.status === 0) {
        queryClient.invalidateQueries({ queryKey: ['params'] });
      } else {
        throw new Error(response.msg || '更新参数失败');
      }
    }
  });

  // 删除参数
  const deleteParamMutation = useMutation({
    mutationFn: paramsApi.deleteParam,
    onSuccess: (response) => {
      if (response.status === 0) {
        queryClient.invalidateQueries({ queryKey: ['params'] });
        setSelectedRows([]); // 清空选中状态
      } else {
        throw new Error(response.msg || '删除参数失败');
      }
    }
  });

  // 处理搜索
  const handleSearch = useCallback((keyword: string) => {
    setSearchCode(keyword);
    setCurrentPage(1); // 搜索时重置到第一页
  }, []);

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 处理每页条数变化
  const handlePageSizeChange = useCallback((size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1); // 改变每页条数时重置到第一页
  }, []);

  // 处理行选择
  const handleRowSelection = useCallback((selectedRowKeys: number[]) => {
    setSelectedRows(selectedRowKeys);
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && paramsData?.list) {
      const allIds = paramsData.list.map(item => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  }, [paramsData?.list]);

  // 提交参数（新增或更新）
  const handleSubmitParam = useCallback(async (param: ParamForm) => {
    try {
      if (param.id) {
        await updateParamMutation.mutateAsync(param);
      } else {
        await addParamMutation.mutateAsync(param);
      }
    } catch (error) {
      throw error;
    }
  }, [addParamMutation, updateParamMutation]);

  // 删除选中的参数
  const handleDeleteSelected = useCallback(async () => {
    if (selectedRows.length === 0) {
      throw new Error('请先选择需要删除的参数');
    }
    await deleteParamMutation.mutateAsync(selectedRows);
  }, [selectedRows, deleteParamMutation]);

  // 删除单个参数
  const handleDeleteParam = useCallback(async (id: number) => {
    await deleteParamMutation.mutateAsync([id]);
  }, [deleteParamMutation]);

  return {
    // 数据
    params: paramsData?.list || [],
    total: paramsData?.total || 0,
    currentPage,
    pageSize,
    searchCode,
    selectedRows,
    
    // 状态
    loading: isLoading,
    error,
    submitting: addParamMutation.isPending || updateParamMutation.isPending,
    deleting: deleteParamMutation.isPending,
    
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
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    
    // 计算属性
    pageCount: Math.ceil((paramsData?.total || 0) / pageSize),
    isAllSelected: selectedRows.length > 0 && selectedRows.length === (paramsData?.list?.length || 0),
    hasSelection: selectedRows.length > 0
  };
};