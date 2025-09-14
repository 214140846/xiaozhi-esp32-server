// OpenAPI-derived types for OTA Management (OTAMagController)
import type { ApiResponse, PageData, Id } from './common'

export interface OtaEntity {
  id?: string
  firmwareName?: string
  type?: string
  version?: string
  size?: number
  remark?: string
  firmwarePath?: string
  sort?: number
  updater?: number
  updateDate?: string
  creator?: number
  createDate?: string
}

export type ResultOtaEntity = ApiResponse<OtaEntity>
export type ResultPageOtaEntity = ApiResponse<PageData<OtaEntity>>
export type ResultVoid = ApiResponse<undefined>
export type ResultString = ApiResponse<string>

