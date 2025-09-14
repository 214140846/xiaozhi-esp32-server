// OTA related DTOs from ota_OpenAPI.json

export interface Application {
  name?: string
  version?: string
  compile_time?: string
  idf_version?: string
  elf_sha256?: string
}

export interface BoardInfo {
  type?: string
  ssid?: string
  rssi?: number
  channel?: number
  ip?: string
  mac?: string
}

export interface ChipInfo {
  model?: number
  cores?: number
  revision?: number
  features?: number
}

export interface OtaInfo {
  label?: string
}

export interface Partition {
  label?: string
  type?: number
  subtype?: number
  address?: number
  size?: number
}

export interface DeviceReportReqDTO {
  version?: number
  uuid?: string
  application?: Application
  ota?: OtaInfo
  board?: BoardInfo
  flash_size?: number
  minimum_free_heap_size?: number
  mac_address?: string
  chip_model_name?: string
  chip_info?: ChipInfo
  partition_table?: Partition[]
}

