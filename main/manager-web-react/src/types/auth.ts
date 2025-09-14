// 认证相关的前端本地类型（UI/表单用）

export enum LoginType {
  USERNAME = 'USERNAME',
  MOBILE = 'MOBILE',
}

export type LoginTypeValue = `${LoginType}`

export interface RegisterForm {
  username?: string
  password: string
  confirmPassword: string
  captcha: string
  captchaId?: string
  // 手机注册相关
  mobile?: string
  areaCode?: string
  mobileCaptcha?: string
}

export interface RetrievePasswordForm {
  username?: string
  password: string
  confirmPassword: string
  captcha: string
  captchaId?: string
  mobile?: string
  areaCode?: string
  mobileCaptcha?: string
}

export interface MobileArea {
  key: string
  name: string
}

