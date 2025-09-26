/**
 * API客户端配置和封装
 */
import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type AxiosRequestHeaders } from "axios";
import type { ApiResponse } from "../types/openapi/common";
import type {
  LoginDTO,
  TokenDTO,
  ResultTokenDTO,
  SmsVerificationDTO,
  RetrievePasswordDTO,
  PasswordDTO,
  ResultUserDetail,
  ResultMapStringObject,
} from "../types/openapi/user";

// 创建axios实例
// 开发环境通过Vite代理到后端，生产环境使用VITE_API_BASE_URL
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 导出 axios 实例，供其他 API 模块复用
export { apiClient };

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

    // 添加认证token
    const token = localStorage.getItem("token");
    if (token) {
      // 支持两种存储方式：原始字符串或序列化对象
      try {
        const tokenData = JSON.parse(token);
        const value = (tokenData && (tokenData.token || tokenData)) || token;
        if (!config.headers) config.headers = {};
        (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${value}`;
      } catch {
        if (!config.headers) config.headers = {};
        (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);

    // 统一处理“业务码 401/403”的未授权/无权限场景（例如后端 HTTP 200 但返回 { code: 401/403 }）
    try {
      const data: any = response.data;
      if (data && typeof data === "object") {
        // code === 401 代表未登录或令牌失效：需要退出并跳转登录
        if (data.code === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          window.location.replace("/login");
          const unauthorizedError: any = new Error(data.msg || "Unauthorized");
          unauthorizedError.response = { status: 401, data, config: response.config };
          return Promise.reject(unauthorizedError);
        }
        // code === 403 仅表示无权限，不应清除登录态或跳回登录页
        if (data.code === 403) {
          const forbiddenError: any = new Error(data.msg || "Forbidden");
          forbiddenError.response = { status: 403, data, config: response.config };
          return Promise.reject(forbiddenError);
        }
      }
    } catch (_) {
      // ignore
    }

    return response;
  },
  (error: AxiosError) => {
    console.error(`[API Response Error] ${error.config?.url}:`, (error as any)?.response?.data || error.message);

    // 处理真正的 HTTP 401 未授权错误
    if (error.response?.status === 401) {
      // 清理本地认证信息
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      // 使用非 SPA 跳转，确保应用完全重置
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

// API接口定义
export const authAPI = {
  /**
   * 获取图形验证码
   */
  getCaptcha: async (captchaId: string): Promise<Blob> => {
    console.log(`[Auth API] 获取验证码, captchaId: ${captchaId}`);
    try {
      const response = await apiClient.get(`/user/captcha`, {
        params: { uuid: captchaId },
        responseType: "blob",
      });
      console.log(`[Auth API] 验证码获取成功`);
      return response.data;
    } catch (error) {
      console.error("[Auth API] 验证码获取失败:", error);
      throw error;
    }
  },

  /**
   * 用户登录
   */
  login: async (loginData: LoginDTO): Promise<ResultTokenDTO> => {
    console.log(`[Auth API] 用户登录请求, username: ${loginData.username}`);
    try {
      const response = await apiClient.post<ResultTokenDTO>("/user/login", loginData);
      console.log(`[Auth API] 登录成功`);
      return response.data;
    } catch (error: unknown) {
      console.error("[Auth API] 登录失败:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 获取公共配置
   */
  getPublicConfig: async (): Promise<ResultMapStringObject> => {
    console.log(`[Auth API] 获取公共配置`);
    try {
      const response = await apiClient.get<ResultMapStringObject>("/user/pub-config");
      console.log(`[Auth API] 公共配置获取成功:`, response.data);
      return response.data;
    } catch (error) {
      console.error("[Auth API] 获取公共配置失败:", error);
      throw error;
    }
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<ApiResponse<undefined>> => {
    console.log(`[Auth API] 用户登出`);
    try {
      const response = await apiClient.post<ApiResponse<undefined>>("/user/logout");
      console.log(`[Auth API] 登出成功`);
      return response.data;
    } catch (error) {
      console.error("[Auth API] 登出失败:", error);
      throw error;
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: async (): Promise<ResultUserDetail> => {
    console.log(`[Auth API] 获取用户信息`);
    try {
      const response = await apiClient.get<ResultUserDetail>("/user/info");
      console.log(`[Auth API] 用户信息获取成功`);
      return response.data;
    } catch (error) {
      console.error("[Auth API] 获取用户信息失败:", error);
      throw error;
    }
  },

  /**
   * 用户注册
   */
  register: async (registerData: LoginDTO & { mobileCaptcha?: string }): Promise<ApiResponse<undefined>> => {
    console.log(`[Auth API] 用户注册请求, username: ${registerData.username}`);
    try {
      // 按OpenAPI规范构造请求体：LoginDTO
      const payload: LoginDTO & { mobileCaptcha?: string } = {
        username: registerData.username,
        password: registerData.password,
        captcha: registerData.captcha,
        captchaId: registerData.captchaId,
        ...(registerData.mobileCaptcha ? { mobileCaptcha: registerData.mobileCaptcha } : {}),
      };
      const response = await apiClient.post<ApiResponse<undefined>>("/user/register", payload);
      console.log(`[Auth API] 注册成功`);
      return response.data;
    } catch (error: unknown) {
      console.error("[Auth API] 注册失败:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 发送短信验证码
   */
  sendSmsVerification: async (smsData: SmsVerificationDTO): Promise<ApiResponse<undefined>> => {
    console.log(`[Auth API] 发送短信验证码, phone: ${smsData.phone}`);
    try {
      // OpenAPI路径：/user/smsVerification
      const response = await apiClient.post<ApiResponse<undefined>>("/user/smsVerification", smsData);
      console.log(`[Auth API] 验证码发送成功`);
      return response.data;
    } catch (error: unknown) {
      console.error("[Auth API] 验证码发送失败:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 找回密码
   */
  retrievePassword: async (
    retrieveData: RetrievePasswordDTO & { areaCode?: string; mobile?: string; mobileCaptcha?: string }
  ): Promise<ApiResponse<unknown>> => {
    console.log(`[Auth API] 找回密码请求, phone: ${retrieveData.areaCode + retrieveData.mobile}`);
    try {
      const requestData = {
        phone: (retrieveData.areaCode ?? "") + (retrieveData.mobile ?? ""),
        password: (retrieveData as unknown as Record<string, string>).newPassword ?? "",
        code: retrieveData.mobileCaptcha,
      };
      // OpenAPI方法：PUT /user/retrieve-password
      const response = await apiClient.put<ApiResponse<unknown>>("/user/retrieve-password", requestData);
      console.log(`[Auth API] 密码重置成功`);
      return response.data;
    } catch (error: unknown) {
      console.error("[Auth API] 密码重置失败:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 修改用户密码（PUT /user/change-password）
   */
  changePassword: async (data: PasswordDTO & { newPassword?: string }): Promise<ApiResponse<unknown>> => {
    console.log(`[Auth API] 修改密码请求`);
    try {
      const response = await apiClient.put<ApiResponse<unknown>>("/user/change-password", data);
      console.log(`[Auth API] 修改密码成功`);
      return response.data;
    } catch (error: unknown) {
      console.error("[Auth API] 修改密码失败:", error.response?.data || error.message);
      throw error;
    }
  },
};

// 工具函数
export const apiUtils = {
  /**
   * 生成UUID (用于验证码ID)
   */
  generateUUID: (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * 手机号验证
   */
  validateMobile: (mobile: string, areaCode: string = "+86"): boolean => {
    if (!mobile || !areaCode) return false;

    // 简单的手机号验证 (可根据实际需求扩展)
    if (areaCode === "+86") {
      return /^1[3-9]\d{9}$/.test(mobile);
    }

    // 其他国家区号的验证逻辑可在此扩展
    return mobile.length >= 7 && mobile.length <= 15;
  },

  /**
   * 创建Blob URL (用于验证码图片显示)
   */
  createBlobUrl: (blob: Blob): string => {
    return URL.createObjectURL(blob);
  },

  /**
   * 清理Blob URL
   */
  revokeBlobUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },
};

export default apiClient;
