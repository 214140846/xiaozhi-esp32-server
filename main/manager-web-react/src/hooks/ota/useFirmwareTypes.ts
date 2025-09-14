import { useMemo } from 'react'

export interface FirmwareType {
  key: string
  name: string
}

// 目前后端未提供字典接口，这里先内置常见类型；
// 若后续有接口，可改为请求并缓存。
const BUILTIN_FIRMWARE_TYPES: FirmwareType[] = [
  { key: 'esp32', name: 'ESP32' },
  { key: 'esp32s3', name: 'ESP32-S3' },
  { key: 'esp32c3', name: 'ESP32-C3' },
]

export function useFirmwareTypes() {
  const firmwareTypes = useMemo(() => BUILTIN_FIRMWARE_TYPES, [])

  const getFirmwareTypeName = (key?: string) => {
    if (!key) return ''
    return firmwareTypes.find((t) => t.key === key)?.name ?? key
  }

  return {
    firmwareTypes,
    getFirmwareTypeName,
    isLoading: false,
  }
}

