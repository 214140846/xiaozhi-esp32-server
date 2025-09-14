import type { ApiResponse, PageData } from './common'

// Common results
export type ResultVoid = ApiResponse<undefined>
export type ResultString = ApiResponse<string>
export type ResultBoolean = ApiResponse<boolean>
export type ResultListString = ApiResponse<string[]>

// Params (SysParams)
export interface SysParamsDTO {
  id?: number
  paramCode?: string
  paramValue?: string
  remark?: string
  sort?: number
  creator?: number
  createDate?: string
  updater?: number
  updateDate?: string
}
export type ResultSysParamsDTO = ApiResponse<SysParamsDTO>
export type PageDataSysParamsDTO = PageData<SysParamsDTO>
export type ResultPageDataSysParamsDTO = ApiResponse<PageDataSysParamsDTO>

// Dict Type
export interface SysDictTypeDTO {
  id?: number
  dictType?: string
  dictName?: string
  remark?: string
  sort?: number
}
export interface SysDictTypeVO extends SysDictTypeDTO {
  creator?: number
  creatorName?: string
  createDate?: string
  updater?: number
  updaterName?: string
  updateDate?: string
}
export type ResultSysDictTypeVO = ApiResponse<SysDictTypeVO>
export type PageDataSysDictTypeVO = PageData<SysDictTypeVO>
export type ResultPageDataSysDictTypeVO = ApiResponse<PageDataSysDictTypeVO>

// Dict Data
export interface SysDictDataDTO {
  id?: number
  dictTypeId?: number
  dictLabel?: string
  dictValue?: string
  remark?: string
  sort?: number
}
export interface SysDictDataVO extends SysDictDataDTO {
  creator?: number
  creatorName?: string
  createDate?: string
  updater?: number
  updaterName?: string
  updateDate?: string
}
export type ResultSysDictDataVO = ApiResponse<SysDictDataVO>
export type PageDataSysDictDataVO = PageData<SysDictDataVO>
export type ResultPageDataSysDictDataVO = ApiResponse<PageDataSysDictDataVO>

// Emit server action
export interface EmitSeverActionDTO {
  action?: string
  payload?: Record<string, unknown>
}

// User device list VO
export interface UserShowDeviceListVO {
  appVersion?: string
  bindUserName?: string
  deviceType?: string
  id?: string
  macAddress?: string
  otaUpgrade?: number
  recentChatTime?: string
}
export type PageDataUserShowDeviceListVO = PageData<UserShowDeviceListVO>
export type ResultPageDataUserShowDeviceListVO = ApiResponse<PageDataUserShowDeviceListVO>

