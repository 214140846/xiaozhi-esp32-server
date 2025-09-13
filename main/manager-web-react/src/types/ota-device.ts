// Types for OTA device endpoints based on api-docs/ota_OpenAPI.json

// Application build info
export interface Application {
  name?: string;
  version?: string;
  compile_time?: string;
  idf_version?: string;
  elf_sha256?: string;
}

// OTA info
export interface OtaInfo {
  label?: string;
}

// Board connectivity info
export interface BoardInfo {
  type?: string;
  ssid?: string;
  rssi?: number;
  bssid?: string;
  channel?: number;
  local_ip?: string;
  netmask?: string;
  gw?: string;
  dns?: string;
  mqtt_server?: string;
}

// Chip detailed info
export interface ChipInfo {
  features?: string;
  number_of_cores?: number;
  revision?: number;
}

// Partition info
export interface Partition {
  label?: string;
  type?: number;
  subtype?: number;
  address?: number;
  size?: number;
}

// Device report request body
export interface DeviceReportReqDTO {
  version?: number; // firmware version
  uuid?: string; // device UUID
  application?: Application;
  ota?: OtaInfo;
  board?: BoardInfo;
  flash_size?: number;
  minimum_free_heap_size?: number;
  mac_address?: string;
  chip_model_name?: string;
  chip_info?: ChipInfo;
  partition_table?: Partition[];
}

// Headers required by both endpoints
export interface OtaHeaders {
  deviceId: string; // maps to header 'Device-Id'
  clientId?: string; // maps to header 'Client-Id'
}

