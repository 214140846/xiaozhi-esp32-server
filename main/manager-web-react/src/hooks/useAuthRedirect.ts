/**
 * 认证重定向Hook
 */
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = (redirectTo: string = '/home') => {
  const { state } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      console.log('[useAuthRedirect] 用户已登录，准备重定向到:', redirectTo);
      // 这里可以使用路由库进行重定向
      // 暂时使用window.location进行演示
      // window.location.href = redirectTo;
    }
  }, [state.isAuthenticated, state.user, redirectTo]);

  return {
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    user: state.user,
  };
};