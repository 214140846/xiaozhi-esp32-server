import type { ApiResponse } from './common'

export interface DeviceUpdateDTO {
  autoUpdate?: number
  alias?: string
}

export interface DeviceUnBindDTO {
  deviceId: string
}

export interface DeviceRegisterDTO {
  macAddress?: string
}

export interface DeviceManualAddDTO {
  agentId?: string
  board?: string
  appVersion?: string
  macAddress?: string
}

export interface DeviceEntity {
  id?: string
  userId?: number
  macAddress?: string
  lastConnectedAt?: string
  autoUpdate?: number
  board?: string
  alias?: string
  agentId?: string
  appVersion?: string
  sort?: number
  updater?: number
  updateDate?: string
  creator?: number
  createDate?: string
}

export type ResultVoid = ApiResponse<undefined>
export type ResultString = ApiResponse<string>
export type ResultListDeviceEntity = ApiResponse<DeviceEntity[]>

