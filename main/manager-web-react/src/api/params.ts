/**
 * 参数管理相关的API接口
 */
import axios from 'axios';
import type { ApiResponse } from '../types/auth';
import type { ParamsListRequest, ParamsListResponse, ParamForm } from '../types/params';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截器，添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器，处理通用错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token 过期，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const paramsApi = {
  // 获取参数列表
  getParamsList: async (params: ParamsListRequest): Promise<ApiResponse<ParamsListResponse>> => {
    const { data } = await api.get('/admin/params', { params });
    return data;
  },

  // 新增参数
  addParam: async (param: ParamForm): Promise<ApiResponse<any>> => {
    const { data } = await api.post('/admin/params', param);
    return data;
  },

  // 更新参数
  updateParam: async (param: ParamForm): Promise<ApiResponse<any>> => {
    const { data } = await api.put(`/admin/params/${param.id}`, param);
    return data;
  },

  // 删除参数（支持单个或批量删除）
  deleteParam: async (ids: number[]): Promise<ApiResponse<any>> => {
    const { data } = await api.delete('/admin/params', { data: { ids } });
    return data;
  }
};