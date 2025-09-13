/**
 * 参数管理相关的TypeScript类型定义
 */

// 参数数据接口
export interface ParamItem {
  id: number;
  paramCode: string;
  paramValue: string;
  remark: string;
  selected?: boolean; // 用于表格选择
  showValue?: boolean; // 用于敏感参数显示控制
}

// 参数表单数据接口
export interface ParamForm {
  id?: number;
  paramCode: string;
  paramValue: string;
  remark: string;
}

// 参数列表请求参数
export interface ParamsListRequest {
  page: number;
  limit: number;
  paramCode?: string; // 搜索关键词
}

// 参数列表响应数据
export interface ParamsListResponse {
  list: ParamItem[];
  total: number;
  page: number;
  limit: number;
}

// 敏感参数关键词列表
export const SENSITIVE_KEYS = [
  'api_key',
  'personal_access_token',
  'access_token',
  'token',
  'secret',
  'access_key_secret',
  'secret_key',
  'password',
  'pwd',
  'key'
] as const;

// 分页配置
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];

// 表格列定义
export interface ParamTableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
  render?: (value: any, record: ParamItem, index: number) => React.ReactNode;
}