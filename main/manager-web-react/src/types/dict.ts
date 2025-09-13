/**
 * 字典管理相关类型定义
 */

// 字典类型
export interface DictType {
  id: number;
  dictName: string;   // 字典类型名称
  dictType: string;   // 字典类型编码
  createTime?: string;
  updateTime?: string;
}

// 字典数据
export interface DictData {
  id: number;
  dictTypeId: number; // 字典类型ID
  dictLabel: string;  // 字典标签
  dictValue: string;  // 字典值
  sort: number;       // 排序
  selected?: boolean; // 用于批量操作的选择状态
  createTime?: string;
  updateTime?: string;
}

// 字典类型表单
export interface DictTypeForm {
  id?: number | null;
  dictName: string;
  dictType: string;
}

// 字典数据表单  
export interface DictDataForm {
  id?: number | null;
  dictTypeId: number;
  dictLabel: string;
  dictValue: string;
  sort: number;
}

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 分页响应
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

// 查询参数
export interface DictTypeQuery {
  page?: number;
  limit?: number;
  dictName?: string;
}

export interface DictDataQuery {
  dictTypeId: number;
  page?: number;
  limit?: number;
  dictLabel?: string;
  dictValue?: string;
}