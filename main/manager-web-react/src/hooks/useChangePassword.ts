import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../lib/api';

interface ChangePasswordParams {
  password: string;
  newPassword: string;
}

// 修改密码（PUT /user/change-password）
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordParams) => {
      const res = await authAPI.changePassword(data);
      if ((res as any)?.status === 200 || (res as any)?.code === 0) {
        return res.data;
      }
      throw new Error((res as any)?.msg || '修改密码失败');
    },
  });
};

