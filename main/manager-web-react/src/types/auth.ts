/**
 * 认证相关的TypeScript类型定义
 */

// 登录表单数据接口
export interface LoginForm {
  username: string;
  password: string;
  captcha: string;
  captchaId: string;
  areaCode: string;
  mobile: string;
}

// 手机区号列表项接口
export interface MobileArea {
  key: string;
  name: string;
}

// 公共配置接口
export interface PublicConfig {
  allowUserRegister: boolean;
  enableMobileRegister: boolean;
  mobileAreaList: MobileArea[];
}

// API响应基础结构
export interface ApiResponse<T = any> {
  status: number;
  msg: string;
  data: T;
}

// 登录响应数据
export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

// 验证码获取响应
export interface CaptchaResponse {
  captchaId: string;
  imageData: Blob;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// 注册表单数据接口
export interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  captcha: string;
  captchaId: string;
  areaCode: string;
  mobile: string;
  mobileCaptcha: string;
}

// 找回密码表单数据接口
export interface RetrievePasswordForm {
  areaCode: string;
  mobile: string;
  captcha: string;
  captchaId: string;
  mobileCaptcha: string;
  newPassword: string;
  confirmPassword: string;
}

// 短信验证码请求接口
export interface SendSmsRequest {
  phone: string;
  captcha: string;
  captchaId: string;
}

// 认证上下文动作
export type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserInfo; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// 登录方式常量
export const LoginType = {
  USERNAME: 'username' as const,
  MOBILE: 'mobile' as const
} as const;

export type LoginTypeValue = typeof LoginType[keyof typeof LoginType];