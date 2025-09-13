import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { 
  getOtaList, 
  deleteOta, 
  getDownloadUrl, 
  downloadFirmware 
} from '@/api/otaApi';
import type { 
  OtaFirmware, 
  OtaListParams, 
  ApiResponse 
} from '@/types/ota';

export const useOtaList = () => {
  const queryClient = useQueryClient();
  
  // 查询参数状态
  const [queryParams, setQueryParams] = useState<OtaListParams>({
    pageNum: 1,
    pageSize: 10,
    firmwareName: '',
    orderField: 'create_date',
    order: 'desc'
  });

  // 获取OTA列表
  const {
    data: otaListData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['otaList', queryParams],
    queryFn: async () => {
      console.log('useOtaList: 查询OTA列表, 参数:', queryParams);
      const response = await getOtaList(queryParams);
      console.log('useOtaList: OTA列表响应:', response);
      
      if (response.code === 0) {
        const firmwareList = response.data.list.map((item: OtaFirmware) => ({
          ...item,
          selected: false
        }));
        return {
          list: firmwareList,
          total: response.data.total || 0,
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize
        };
      } else {
        throw new Error(response.message || response.msg || '获取OTA固件列表失败');
      }
    },
    select: (data) => data,
  });

  // 删除OTA固件
  const deleteMutation = useMutation({
    mutationFn: deleteOta,
    onSuccess: (response: ApiResponse) => {
      console.log('useOtaList: 删除成功响应:', response);
      if (response.code === 0) {
        toast({
          title: '删除成功',
          description: '固件删除操作完成',
        });
        // 刷新列表
        queryClient.invalidateQueries({ queryKey: ['otaList'] });
      } else {
        throw new Error(response.message || response.msg || '删除失败');
      }
    },
    onError: (error: Error) => {
      console.error('useOtaList: 删除失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '删除固件时发生错误',
        variant: 'destructive',
      });
    },
  });

  // 获取下载链接并下载
  const downloadMutation = useMutation({
    mutationFn: getDownloadUrl,
    onSuccess: (response: ApiResponse<string>) => {
      console.log('useOtaList: 获取下载链接成功:', response);
      if (response.code === 0) {
        const downloadUuid = response.data;
        if (downloadUuid) {
          downloadFirmware(downloadUuid);
        } else {
          throw new Error('下载链接无效');
        }
        toast({
          title: '下载开始',
          description: '固件文件正在下载中...',
        });
      } else {
        throw new Error(response.message || response.msg || '获取下载链接失败');
      }
    },
    onError: (error: Error) => {
      console.error('useOtaList: 获取下载链接失败:', error);
      toast({
        title: '下载失败',
        description: error.message || '获取下载链接时发生错误',
        variant: 'destructive',
      });
    },
  });

  // 更新查询参数
  const updateParams = useCallback((newParams: Partial<OtaListParams>) => {
    console.log('useOtaList: 更新查询参数:', newParams);
    setQueryParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // 搜索功能
  const handleSearch = useCallback((firmwareName: string) => {
    console.log('useOtaList: 执行搜索, 关键词:', firmwareName);
    updateParams({ 
      firmwareName: firmwareName.trim(), 
      pageNum: 1 
    });
  }, [updateParams]);

  // 分页处理
  const handlePageChange = useCallback((pageNum: number) => {
    console.log('useOtaList: 页码变更:', pageNum);
    updateParams({ pageNum });
  }, [updateParams]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    console.log('useOtaList: 页大小变更:', pageSize);
    updateParams({ pageSize, pageNum: 1 });
  }, [updateParams]);

  // 删除操作
  const handleDelete = useCallback((firmware: OtaFirmware | OtaFirmware[]) => {
    const firmwares = Array.isArray(firmware) ? firmware : [firmware];
    const ids = firmwares.map(f => f.id!).filter(Boolean);
    
    if (ids.length === 0) {
      toast({
        title: '删除失败',
        description: '请选择需要删除的固件',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('useOtaList: 执行删除操作, IDs:', ids);
    deleteMutation.mutate(ids);
  }, [deleteMutation]);

  // 下载操作
  const handleDownload = useCallback((firmware: OtaFirmware) => {
    if (!firmware.id) {
      toast({
        title: '下载失败',
        description: '固件信息不完整',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('useOtaList: 执行下载操作, 固件ID:', firmware.id);
    downloadMutation.mutate(firmware.id);
  }, [downloadMutation]);

  return {
    // 数据
    firmwareList: otaListData?.list || [],
    total: otaListData?.total || 0,
    currentPage: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    
    // 状态
    isLoading,
    error,
    isDeleting: deleteMutation.isPending,
    isDownloading: downloadMutation.isPending,
    
    // 方法
    refetch,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleDownload,
    updateParams,
  };
};
