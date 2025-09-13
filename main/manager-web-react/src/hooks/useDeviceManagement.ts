import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';
import type { Device, PageSizeOption } from '../types/device';
import { PAGE_SIZE_OPTIONS } from '../types/device';

/**
 * 设备管理相关的自定义Hook
 * 封装设备列表管理、搜索、分页、CRUD操作等业务逻辑
 */
export function useDeviceManagement(agentId: string) {
  
  // 本地状态管理
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearchKeyword, setActiveSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [deviceList, setDeviceList] = useState<Device[]>([]);

  // 查询设备列表
  const {
    data: devices = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['devices', agentId],
    queryFn: () => DeviceApi.getAgentBindDevices(agentId),
    enabled: !!agentId,
  });

  // 同步设备数据到本地状态
  React.useEffect(() => {
    if (devices) {
      console.log('✅ Devices loaded successfully:', devices.length);
      setDeviceList(devices);
    }
  }, [devices]);

  // 筛选后的设备列表
  const filteredDevices = useMemo(() => {
    if (!activeSearchKeyword) return deviceList;
    
    const keyword = activeSearchKeyword.toLowerCase();
    return deviceList.filter(device =>
      (device.model && device.model.toLowerCase().includes(keyword)) ||
      (device.macAddress && device.macAddress.toLowerCase().includes(keyword))
    );
  }, [deviceList, activeSearchKeyword]);

  // 分页后的设备列表
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredDevices.slice(start, end);
  }, [filteredDevices, currentPage, pageSize]);

  // 总页数
  const pageCount = useMemo(() => {
    return Math.ceil(filteredDevices.length / pageSize);
  }, [filteredDevices.length, pageSize]);

  // 当前页是否全选
  const isCurrentPageAllSelected = useMemo(() => {
    return paginatedDevices.length > 0 && paginatedDevices.every(device => device.selected);
  }, [paginatedDevices]);

  // 可见页码
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(pageCount, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, pageCount]);

  // 解绑设备 Mutation
  const unbindMutation = useMutation({
    mutationFn: DeviceApi.unbindDevice,
    onSuccess: () => {
      console.log('✅ Device unbound successfully');
      refetch();
    },
    onError: (error) => {
      console.error('❌ Failed to unbind device:', error);
      throw error;
    }
  });

  // 批量解绑 Mutation
  const batchUnbindMutation = useMutation({
    mutationFn: DeviceApi.batchUnbindDevices,
    onSuccess: () => {
      console.log('✅ Devices batch unbound successfully');
      refetch();
    },
    onError: (error) => {
      console.error('❌ Failed to batch unbind devices:', error);
      throw error;
    }
  });

  // 绑定设备 Mutation
  const bindMutation = useMutation({
    mutationFn: DeviceApi.bindDevice,
    onSuccess: () => {
      console.log('✅ Device bound successfully');
      refetch();
    },
    onError: (error) => {
      console.error('❌ Failed to bind device:', error);
      throw error;
    }
  });

  // 手动添加设备 Mutation
  const manualAddMutation = useMutation({
    mutationFn: DeviceApi.manualAddDevice,
    onSuccess: () => {
      console.log('✅ Device manually added successfully');
      refetch();
    },
    onError: (error) => {
      console.error('❌ Failed to manually add device:', error);
      throw error;
    }
  });

  // 更新设备信息 Mutation
  const updateMutation = useMutation({
    mutationFn: ({ deviceId, params }: { deviceId: string; params: any }) =>
      DeviceApi.updateDeviceInfo(deviceId, params),
    onSuccess: () => {
      console.log('✅ Device info updated successfully');
      refetch();
    },
    onError: (error) => {
      console.error('❌ Failed to update device info:', error);
      throw error;
    }
  });

  // 处理搜索
  const handleSearch = useCallback(() => {
    console.log('🔍 Searching devices with keyword:', searchKeyword);
    setActiveSearchKeyword(searchKeyword);
    setCurrentPage(1);
  }, [searchKeyword]);

  // 处理全选/取消全选
  const handleSelectAll = useCallback(() => {
    const shouldSelectAll = !isCurrentPageAllSelected;
    console.log('📋 Select all:', shouldSelectAll);
    
    setDeviceList(prevList =>
      prevList.map(device => {
        const isInCurrentPage = paginatedDevices.some(p => p.device_id === device.device_id);
        return isInCurrentPage ? { ...device, selected: shouldSelectAll } : device;
      })
    );
  }, [isCurrentPageAllSelected, paginatedDevices]);

  // 处理页面大小变化
  const handlePageSizeChange = useCallback((newPageSize: PageSizeOption) => {
    console.log('📄 Page size changed to:', newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // 分页导航
  const goToPage = useCallback((page: number) => {
    console.log('📄 Navigating to page:', page);
    setCurrentPage(page);
  }, []);

  const goFirst = useCallback(() => goToPage(1), [goToPage]);
  const goPrev = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  const goNext = useCallback(() => {
    if (currentPage < pageCount) goToPage(currentPage + 1);
  }, [currentPage, pageCount, goToPage]);

  // 更新设备选择状态
  const updateDeviceSelection = useCallback((deviceId: string, selected: boolean) => {
    setDeviceList(prevList =>
      prevList.map(device =>
        device.device_id === deviceId ? { ...device, selected } : device
      )
    );
  }, []);

  // 更新设备编辑状态
  const updateDeviceEditState = useCallback((deviceId: string, isEdit: boolean) => {
    setDeviceList(prevList =>
      prevList.map(device =>
        device.device_id === deviceId ? { ...device, isEdit } : device
      )
    );
  }, []);

  return {
    // 数据状态
    devices: deviceList,
    filteredDevices,
    paginatedDevices,
    isLoading,
    error,
    
    // 搜索状态
    searchKeyword,
    setSearchKeyword,
    activeSearchKeyword,
    handleSearch,
    
    // 分页状态
    currentPage,
    pageSize,
    pageCount,
    visiblePages,
    PAGE_SIZE_OPTIONS,
    handlePageSizeChange,
    goFirst,
    goPrev,
    goNext,
    goToPage,
    
    // 选择状态
    isCurrentPageAllSelected,
    handleSelectAll,
    updateDeviceSelection,
    updateDeviceEditState,
    
    // 操作方法
    refetch,
    unbindDevice: unbindMutation.mutateAsync,
    batchUnbindDevices: batchUnbindMutation.mutateAsync,
    bindDevice: bindMutation.mutateAsync,
    manualAddDevice: manualAddMutation.mutateAsync,
    updateDeviceInfo: updateMutation.mutateAsync,
    
    // 加载状态
    isUnbinding: unbindMutation.isPending,
    isBatchUnbinding: batchUnbindMutation.isPending,
    isBinding: bindMutation.isPending,
    isManualAdding: manualAddMutation.isPending,
    isUpdating: updateMutation.isPending
  };
}