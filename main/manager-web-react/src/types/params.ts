/**
 * 参数管理相关的前端类型与常量
 * 说明：OpenAPI 的 SysParamsDTO 字段均为可选，这里定义 UI 层使用的必填字段类型，
 * 以方便表格与表单直接消费。同时提供分页与敏感字段的常量。
 */

// 每页条数可选项
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];

// UI 使用的参数项（表格行）
export interface ParamItem {
  id: number;
  paramCode: string;
  paramValue: string;
  remark?: string;
}

// 表单提交的数据结构
export interface ParamForm {
  id?: number;
  paramCode: string;
  paramValue: string;
  remark?: string;
}

// 常见敏感关键词（用于前端遮罩展示）
export const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'apikey',
  'api_key',
  'key',
];

