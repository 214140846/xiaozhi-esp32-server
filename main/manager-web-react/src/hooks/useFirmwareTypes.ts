import { useQuery } from '@tanstack/react-query';
import type { FirmwareType } from '../types/device';
import { dictAPI } from '../api/dictApi';

/**
 * 固件类型管理Hook
 * 用于获取和管理固件类型字典数据
 */
export function useFirmwareTypes() {
  // 查询固件类型数据
  const {
    data: firmwareTypes = [],
    isLoading,
    error,
    refetch
  } = useQuery<FirmwareType[]>({
    queryKey: ['firmwareTypes', 'FIRMWARE_TYPE'],
    queryFn: () => dictAPI.getDictDataByType('FIRMWARE_TYPE'),
    staleTime: 5 * 60 * 1000 // 5分钟缓存
  });

  /**
   * 根据固件类型key获取显示名称
   * @param typeKey 固件类型key
   * @returns 固件类型名称或原key
   */
  const getFirmwareTypeName = (typeKey: string): string => {
    if (!typeKey) return '未知型号';
    const list = (firmwareTypes as FirmwareType[]) || [];
    const firmwareType = list.find((item: FirmwareType) => item.key === typeKey);
    return firmwareType ? firmwareType.name : typeKey;
  };

  return {
    firmwareTypes,
    isLoading,
    error,
    refetch,
    getFirmwareTypeName
  };
}