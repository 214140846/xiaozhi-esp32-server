/**
 * 公共配置查询Hook
 */
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import type { PublicConfig } from '../types/auth';

export const usePublicConfig = () => {
  return useQuery({
    queryKey: ['publicConfig'],
    queryFn: async (): Promise<PublicConfig> => {
      console.log('[usePublicConfig] 获取公共配置');
      const response = await authAPI.getPublicConfig();
      
      if (response.status === 200 && response.data) {
        console.log('[usePublicConfig] 公共配置获取成功:', response.data);
        return response.data;
      }
      
      throw new Error(response.msg || '获取公共配置失败');
    },
    staleTime: 30 * 60 * 1000, // 30分钟内数据保持新鲜
    gcTime: 60 * 60 * 1000,    // 1小时缓存时间
    retry: 2,
    // 提供默认数据，避免初始加载时的undefined状态
    placeholderData: {
      allowUserRegister: false,
      enableMobileRegister: false,
      mobileAreaList: [
        { key: '+86', name: '中国大陆' },
        { key: '+852', name: '香港' },
        { key: '+853', name: '澳门' },
        { key: '+886', name: '台湾' },
      ],
    },
  });
};