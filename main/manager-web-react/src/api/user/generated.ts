/** Auto-generated from user_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { ApiResponse } from '../../types/model';

/** 找回密码 */
export async function userRetrievePasswordRetrievePassword(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/retrieve-password`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 修改用户密码 */
export async function userChangePasswordChangePassword(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/change-password`;
  const res = await apiClient.put<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 短信验证码 */
export async function userSmsVerificationSmsVerification(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/smsVerification`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 注册 */
export async function userRegisterRegister(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/register`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 登录 */
export async function userLoginLogin(params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/login`;
  const res = await apiClient.post<ApiResponse<any>>(url, data, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 公共配置 */
export async function userPubConfigPubConfig(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/pub-config`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 用户信息获取 */
export async function userInfoInfo(params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/info`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

/** 验证码 */
export async function userCaptchaCaptcha(params?: Record<string, never>, query?: { uuid?: any }, config?: any): Promise<ApiResponse<any>> {
  const url = `/user/captcha`;
  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);
  return res.data;
}

