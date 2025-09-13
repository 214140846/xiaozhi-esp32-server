import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../lib/api';

// 获取用户信息（GET /user/info）
export const useUserInfo = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const res = await authAPI.getUserInfo();
      if ((res as any)?.status === 200 || (res as any)?.code === 0) {
        return res.data;
      }
      throw new Error((res as any)?.msg || '获取用户信息失败');
    },
    staleTime: 5 * 60 * 1000,
  });
};

