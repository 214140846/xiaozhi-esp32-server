// OTA固件信息接口
export interface OtaFirmware {
  id?: number | string;
  firmwareName: string;
  type: string;
  version: string;
  size: number;
  remark?: string;
  firmwarePath: string;
  createDate?: string;
  updateDate?: string;
  selected?: boolean;
}

// 固件类型选项接口
export interface FirmwareType {
  key: string;
  name: string;
}

// OTA列表查询参数接口
export interface OtaListParams {
  pageNum: number;
  pageSize: number;
  firmwareName?: string;
  orderField?: string;
  order?: string;
}

// API响应基础结构
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  msg?: string;
  data?: T;
}

// 分页数据结构
export interface PaginationData<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// OTA表单数据接口
export interface OtaFormData {
  id?: number | string | null;
  firmwareName: string;
  type: string;
  version: string;
  size: number;
  remark: string;
  firmwarePath: string;
}

// 文件上传进度回调接口
export interface UploadProgressEvent {
  loaded: number;
  total: number;
}

// 表格列排序配置
export interface TableSortConfig {
  field: string;
  order: 'asc' | 'desc';
}