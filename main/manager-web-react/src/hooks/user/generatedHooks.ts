/** Auto-generated hooks for user APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/user/generated';

/** 找回密码 */
export function useUserRetrievePasswordRetrievePasswordMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.userRetrievePasswordRetrievePassword(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 修改用户密码 */
export function useUserChangePasswordChangePasswordMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.userChangePasswordChangePassword(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 短信验证码 */
export function useUserSmsVerificationSmsVerificationMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.userSmsVerificationSmsVerification(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 注册 */
export function useUserRegisterRegisterMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.userRegisterRegister(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 登录 */
export function useUserLoginLoginMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.userLoginLogin(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 公共配置 */
export function useUserPubConfigPubConfigQuery(params?: Record<string, never>, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['UserPubConfig.PubConfig', params, query], queryFn: () => Api.userPubConfigPubConfig(params as any, query), ...(options || {}) });
}

/** 用户信息获取 */
export function useUserInfoInfoQuery(params?: Record<string, never>, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['UserInfo.Info', params, query], queryFn: () => Api.userInfoInfo(params as any, query), ...(options || {}) });
}

/** 验证码 */
export function useUserCaptchaCaptchaQuery(params?: Record<string, never>, query?: { uuid?: any }, options?: any) {
  return useQuery({ queryKey: ['UserCaptcha.Captcha', params, query], queryFn: () => Api.userCaptchaCaptcha(params as any, query), ...(options || {}) });
}

