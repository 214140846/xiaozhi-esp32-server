/**
 * React Query 配置
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据保持新鲜时间：5分钟
      staleTime: 5 * 60 * 1000,
      // 缓存时间：10分钟
      gcTime: 10 * 60 * 1000,
      // 重试次数
      retry: (failureCount, error: any) => {
        // 对于认证错误，不进行重试
        if (error?.response?.status === 401) {
          return false;
        }
        // 最多重试2次
        return failureCount < 2;
      },
      // 重试延迟：指数退避
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 变更重试次数
      retry: (failureCount, error: any) => {
        // 对于客户端错误，不进行重试
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // 服务器错误最多重试1次
        return failureCount < 1;
      },
    },
  },
});