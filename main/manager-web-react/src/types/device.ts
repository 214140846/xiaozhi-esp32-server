// 设备管理相关的TypeScript类型定义

/** 设备基本信息 */
export interface Device {
  /** 设备ID */
  device_id: string;
  /** 设备型号 */
  model: string;
  /** 固件版本 */
  firmwareVersion: string;
  /** Mac地址 */
  macAddress: string;
  /** 绑定时间 */
  bindTime: string;
  /** 最近对话时间 */
  lastConversation: string;
  /** 备注信息 */
  remark: string;
  /** OTA自动升级开关 */
  otaSwitch: boolean;
  /** 是否选中（用于批量操作） */
  selected: boolean;
  /** 原始备注（用于编辑时回退） */
  _originalRemark?: string;
  /** 是否处于编辑状态 */
  isEdit?: boolean;
  /** 是否正在提交 */
  _submitting?: boolean;
  /** 原始绑定时间戳（用于排序） */
  rawBindTime?: number;
}

/** API返回的原始设备数据 */
export interface RawDeviceData {
  id: string;
  board: string;
  appVersion: string;
  macAddress: string;
  createDate: string;
  lastConnectedAt: string;
  alias: string;
  autoUpdate: 0 | 1;
}

/** 设备绑定参数 */
export interface DeviceBindParams {
  agentId: string;
  deviceCode: string;
}

/** 手动添加设备参数 */
export interface ManualAddDeviceParams {
  agentId: string;
  board: string;
  appVersion: string;
  macAddress: string;
}

/** 更新设备信息参数 */
export interface UpdateDeviceParams {
  alias?: string;
  autoUpdate?: 0 | 1;
}

/** 设备操作响应 */
export interface DeviceOperationResponse {
  code: number;
  data?: any;
  msg?: string;
}

/** 设备注册请求 */
export interface DeviceRegisterParams {
  macAddress: string;
}

/** 设备注册响应（data为字符串） */
export interface DeviceRegisterResponse {
  code: number;
  data?: string;
  msg?: string;
}

/** 分页参数 */
export interface PaginationParams {
  currentPage: number;
  pageSize: number;
  total: number;
}

/** 搜索筛选参数 */
export interface SearchParams {
  keyword: string;
  agentId: string;
}

/** 设备管理页面状态 */
export interface DeviceManagementState {
  deviceList: Device[];
  loading: boolean;
  searchKeyword: string;
  activeSearchKeyword: string;
  currentPage: number;
  pageSize: number;
  addDeviceDialogVisible: boolean;
  manualAddDeviceDialogVisible: boolean;
}

/** 固件类型信息 */
export interface FirmwareType {
  key: string;
  name: string;
  value?: string;
}

/** 分页选项 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];
