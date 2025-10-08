/**
 * API客户端配置和封装
 */
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  AxiosError,
  type AxiosRequestHeaders,
} from "axios";
import { queryClient } from "./query-client"; 

function serializeParams(input: unknown, parentKey?: string, parts: string[] = []): string {
  if (input == null) return parts.join("&");
  if (Array.isArray(input)) {
    for (const v of input) {
      serializeParams(v, parentKey, parts);
    }
    return parts.join("&");
  }
  if (typeof input === "object") {
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const key = parentKey ? `${parentKey}.${k}` : k;
      serializeParams(v, key, parts);
    }
    return parts.join("&");
  }
  const encK = encodeURIComponent(parentKey ?? "");
  const encV = encodeURIComponent(String(input));
  parts.push(`${encK}=${encV}`);
  return parts.join("&");
}

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
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: { serialize: (params) => serializeParams(params) },
});

// 导出 axios 实例
export { apiClient };

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

    const token = localStorage.getItem("token");
    if (token) {
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

    try {
      const data: any = response.data;
      if (data && typeof data === "object") {
        if (data.code === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          try {
            queryClient.clear();
          } catch {}
          window.location.replace("/login");
          const unauthorizedError: any = new Error(data.msg || "Unauthorized");
          unauthorizedError.response = { status: 401, data, config: response.config };
          return Promise.reject(unauthorizedError);
        }
        if (data.code === 403) {
          const forbiddenError: any = new Error(data.msg || "Forbidden");
          forbiddenError.response = { status: 403, data, config: response.config };
          return Promise.reject(forbiddenError);
        }
      }
    } catch (_) {}

    return response;
  },
  (error: AxiosError) => {
    console.error(
      `[API Response Error] ${error.config?.url}:`,
      (error as any)?.response?.data || error.message
    );

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      try {
        queryClient.clear();
      } catch {}
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

// API接口定义
export const authAPI = {
  getCaptcha: async (captchaId: string): Promise<Blob> => {
    console.log(`[Auth API] 获取验证码, captchaId: ${captchaId}`);
    const response = await apiClient.get(`/user/captcha`, {
      params: { uuid: captchaId },
      responseType: "blob",
    });
    return response.data;
  },

  login: async (loginData: LoginDTO): Promise<ResultTokenDTO> => {
    console.log(`[Auth API] 用户登录请求, username: ${loginData.username}`);
    const response = await apiClient.post<ResultTokenDTO>("/user/login", loginData);
    return response.data;
  },

  getPublicConfig: async (): Promise<ResultMapStringObject> => {
    const response = await apiClient.get<ResultMapStringObject>("/user/pub-config");
    return response.data;
  },

  logout: async (): Promise<ApiResponse<undefined>> => {
    const response = await apiClient.post<ApiResponse<undefined>>("/user/logout");
    return response.data;
  },

  getUserInfo: async (): Promise<ResultUserDetail> => {
    const response = await apiClient.get<ResultUserDetail>("/user/info");
    return response.data;
  },

  register: async (registerData: LoginDTO & { mobileCaptcha?: string }): Promise<ApiResponse<undefined>> => {
    const payload: LoginDTO & { mobileCaptcha?: string } = {
      username: registerData.username,
      password: registerData.password,
      captcha: registerData.captcha,
      captchaId: registerData.captchaId,
      ...(registerData.mobileCaptcha ? { mobileCaptcha: registerData.mobileCaptcha } : {}),
    };
    const response = await apiClient.post<ApiResponse<undefined>>("/user/register", payload);
    return response.data;
  },

  sendSmsVerification: async (smsData: SmsVerificationDTO): Promise<ApiResponse<undefined>> => {
    const response = await apiClient.post<ApiResponse<undefined>>("/user/smsVerification", smsData);
    return response.data;
  },

  retrievePassword: async (
    retrieveData: RetrievePasswordDTO & { areaCode?: string; mobile?: string; mobileCaptcha?: string }
  ): Promise<ApiResponse<unknown>> => {
    const requestData = {
      phone: (retrieveData.areaCode ?? "") + (retrieveData.mobile ?? ""),
      password: (retrieveData as unknown as Record<string, string>).newPassword ?? "",
      code: retrieveData.mobileCaptcha,
    };
    const response = await apiClient.put<ApiResponse<unknown>>("/user/retrieve-password", requestData);
    return response.data;
  },

  changePassword: async (data: PasswordDTO & { newPassword?: string }): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.put<ApiResponse<unknown>>("/user/change-password", data);
    return response.data;
  },
};

// 工具函数
export const apiUtils = {
  generateUUID: (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  validateMobile: (mobile: string, areaCode: string = "+86"): boolean => {
    if (!mobile || !areaCode) return false;
    if (areaCode === "+86") return /^1[3-9]\d{9}$/.test(mobile);
    return mobile.length >= 7 && mobile.length <= 15;
  },

  createBlobUrl: (blob: Blob): string => URL.createObjectURL(blob),
  revokeBlobUrl: (url: string): void => URL.revokeObjectURL(url),
};

export default apiClient;
