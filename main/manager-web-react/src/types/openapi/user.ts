import type { ApiResponse } from './common'

// DTOs from user_OpenAPI.json (no any)

export interface LoginDTO {
  username: string
  password: string
  captcha: string
  captchaId: string
  mobileCaptcha?: string
}

export interface TokenDTO {
  token: string
  expire: number
  clientHash: string
}

export type ResultTokenDTO = ApiResponse<TokenDTO>

export interface SmsVerificationDTO {
  phone: string
  captcha: string
  captchaId: string
}

export type ResultVoid = ApiResponse<undefined>

export interface RetrievePasswordDTO {
  phone: string
  code: string
  password: string
}

export interface PasswordDTO {
  password: string
  newPassword: string
}

export interface UserDetail {
  id?: number
  username?: string
  superAdmin?: number
  token?: string
  status?: number
}

export type ResultUserDetail = ApiResponse<UserDetail>

export type ResultMapStringObject = ApiResponse<Record<string, unknown>>

// 验证码响应（部分后端实现为 data 中返回多种字段，这里做宽松兼容）
export interface CaptchaResponse {
  captchaId?: string
  id?: string
  captchaUrl?: string
  url?: string
  image?: string
}

