/** Auto-generated hooks for ota APIs. */
import { useMutation } from '@tanstack/react-query'
import * as Api from '../../api/ota/generated'
import type { DeviceReportReqDTO } from '../../types/openapi/ota'
import type { MutationOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'

/** 设备快速检查激活状态 */
export function useOtaActivateActivateDeviceMutation(
  options?: MutationOptions<string, unknown, { params?: Record<string, never>; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<string, unknown, { params?: Record<string, never>; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.otaActivateActivateDevice(args.params, args.query, args.config),
    ...(options || {}),
  })
}

/** OTA版本和设备激活状态检查 */
export function useOtaCheckOTAVersionMutation(
  options?: MutationOptions<string, unknown, { params?: Record<string, never>; data?: DeviceReportReqDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<string, unknown, { params?: Record<string, never>; data?: DeviceReportReqDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>({
    mutationFn: (args) => Api.otaCheckOTAVersion(args.params, args.data, args.query, args.config),
    ...(options || {}),
  })
}
