/** Auto-generated hooks for user APIs. */
import { useQuery, useMutation } from '@tanstack/react-query'
import * as Api from '../../api/user/generated'
import type {
  LoginDTO,
  SmsVerificationDTO,
  RetrievePasswordDTO,
  PasswordDTO,
  ResultTokenDTO,
  ResultUserDetail,
  ResultMapStringObject,
  ResultVoid,
} from '../../types/openapi/user'
import type { ApiResponse } from '../../types/openapi/common'
import type { MutationOptions, QueryOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'

/** 找回密码 */
export function useUserRetrievePasswordRetrievePasswordMutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: RetrievePasswordDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: RetrievePasswordDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) =>
        Api.userRetrievePasswordRetrievePassword(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 修改用户密码 */
export function useUserChangePasswordChangePasswordMutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: PasswordDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: PasswordDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) =>
        Api.userChangePasswordChangePassword(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 短信验证码 */
export function useUserSmsVerificationSmsVerificationMutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: SmsVerificationDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: SmsVerificationDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) =>
        Api.userSmsVerificationSmsVerification(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 注册 */
export function useUserRegisterRegisterMutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: LoginDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: LoginDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) =>
        Api.userRegisterRegister(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 登录 */
export function useUserLoginLoginMutation(
  options?: MutationOptions<ResultTokenDTO, unknown, { params?: Record<string, never>; data?: LoginDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultTokenDTO, unknown, { params?: Record<string, never>; data?: LoginDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.userLoginLogin(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 公共配置 */
export function useUserPubConfigPubConfigQuery(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultMapStringObject>
) {
  return useQuery<ResultMapStringObject>({
    queryKey: ['UserPubConfig.PubConfig', params, query],
    queryFn: () => Api.userPubConfigPubConfig(params, query, options?.config),
    ...(options || {}),
  })
}

/** 用户信息获取 */
export function useUserInfoInfoQuery(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultUserDetail>
) {
  return useQuery<ResultUserDetail>({
    queryKey: ['UserInfo.Info', params, query],
    queryFn: () => Api.userInfoInfo(params, query, options?.config),
    ...(options || {}),
  })
}

/** 验证码 */
export function useUserCaptchaCaptchaQuery(
  params?: Record<string, never>,
  query?: { uuid?: string },
  options?: QueryOptions<ApiResponse<import('../../types/openapi/user').CaptchaResponse>>
) {
  return useQuery<ApiResponse<import('../../types/openapi/user').CaptchaResponse>>({
    queryKey: ['UserCaptcha.Captcha', params, query],
    queryFn: () => Api.userCaptchaCaptcha(params, query, options?.config),
    ...(options || {}),
  })
}
