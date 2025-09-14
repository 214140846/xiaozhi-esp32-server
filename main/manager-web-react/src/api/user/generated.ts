/** Auto-generated from user_OpenAPI.json. Do not edit manually. */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../types/openapi/common';
import type {
  LoginDTO,
  TokenDTO,
  ResultTokenDTO,
  SmsVerificationDTO,
  ResultVoid,
  RetrievePasswordDTO,
  PasswordDTO,
  ResultUserDetail,
  ResultMapStringObject,
} from '../../types/openapi/user';

/** 找回密码 */
export async function userRetrievePasswordRetrievePassword(
  params?: Record<string, never>,
  data?: RetrievePasswordDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/user/retrieve-password`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.put<ResultVoid>(url, data, requestConfig);
  return res.data;
}

/** 修改用户密码 */
export async function userChangePasswordChangePassword(
  params?: Record<string, never>,
  data?: PasswordDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/user/change-password`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.put<ResultVoid>(url, data, requestConfig);
  return res.data;
}

/** 短信验证码 */
export async function userSmsVerificationSmsVerification(
  params?: Record<string, never>,
  data?: SmsVerificationDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/user/smsVerification`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultVoid>(url, data, requestConfig);
  return res.data;
}

/** 注册 */
export async function userRegisterRegister(
  params?: Record<string, never>,
  data?: LoginDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/user/register`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultVoid>(url, data, requestConfig);
  return res.data;
}

/** 登录 */
export async function userLoginLogin(
  params?: Record<string, never>,
  data?: LoginDTO,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultTokenDTO> {
  const url = `/user/login`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.post<ResultTokenDTO>(url, data, requestConfig);
  return res.data;
}

/** 公共配置 */
export async function userPubConfigPubConfig(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultMapStringObject> {
  const url = `/user/pub-config`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultMapStringObject>(url, requestConfig);
  return res.data;
}

/** 用户信息获取 */
export async function userInfoInfo(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  config?: AxiosRequestConfig
): Promise<ResultUserDetail> {
  const url = `/user/info`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ResultUserDetail>(url, requestConfig);
  return res.data;
}

/** 验证码 */
export async function userCaptchaCaptcha(
  params?: Record<string, never>,
  query?: { uuid?: string },
  config?: AxiosRequestConfig
): Promise<ApiResponse<import('../../types/openapi/user').CaptchaResponse>> {
  const url = `/user/captcha`;
  const existingParams = (config?.params ?? {}) as Record<string, unknown>;
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...(query ?? {}) } };
  const res = await apiClient.get<ApiResponse<import('../../types/openapi/user').CaptchaResponse>>(url, requestConfig);
  return res.data;
}
