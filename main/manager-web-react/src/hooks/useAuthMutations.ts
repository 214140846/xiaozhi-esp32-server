/**
 * 认证相关的React Query Mutations
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import type { LoginForm } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loginData: LoginForm) => {
      console.log('[useLoginMutation] 执行登录请求');
      return authAPI.login(loginData);
    },
    onSuccess: (_data) => {
      console.log('[useLoginMutation] 登录成功，更新认证状态');
      // 认证状态的更新交由调用方控制（避免重复请求）
      // 清除相关查询缓存
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      console.error('[useLoginMutation] 登录失败:', error);
      
      // 清除认证相关缓存
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      console.log('[useLogoutMutation] 执行登出请求');
      return authAPI.logout();
    },
    onSuccess: () => {
      console.log('[useLogoutMutation] 登出成功');
      
      // 更新认证上下文
      logout();
      
      // 清除所有查询缓存
      queryClient.clear();
    },
    onError: (error) => {
      console.error('[useLogoutMutation] 登出失败:', error);
      
      // 即使API调用失败也要清除本地状态
      logout();
      queryClient.clear();
    },
  });
};
