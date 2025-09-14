/** Auto-generated hooks for device APIs. */
import { useQuery, useMutation } from '@tanstack/react-query'
import * as Api from '../../api/device/generated'
import type {
  DeviceUpdateDTO,
  DeviceUnBindDTO,
  DeviceRegisterDTO,
  DeviceManualAddDTO,
  ResultVoid,
  ResultString,
  ResultListDeviceEntity,
} from '../../types/openapi/device'
import type { MutationOptions, QueryOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'

/** 更新设备信息 */
export function useDeviceUpdateUpdateDeviceInfoMutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { id: string | number }; data?: DeviceUpdateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { id: string | number }; data?: DeviceUpdateDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.deviceUpdateUpdateDeviceInfo(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 解绑设备 */
export function useDeviceUnbindUnbindDeviceMutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: DeviceUnBindDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: DeviceUnBindDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.deviceUnbindUnbindDevice(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 注册设备 */
export function useDeviceRegisterRegisterDeviceMutation(
  options?: MutationOptions<ResultString, unknown, { params?: Record<string, never>; data?: DeviceRegisterDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultString, unknown, { params?: Record<string, never>; data?: DeviceRegisterDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.deviceRegisterRegisterDevice(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 手动添加设备 */
export function useDeviceManualAddManualAddDeviceMutation(
  options?: MutationOptions<ResultVoid, unknown, { params?: Record<string, never>; data?: DeviceManualAddDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params?: Record<string, never>; data?: DeviceManualAddDTO; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.deviceManualAddManualAddDevice(args.params, args.data, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 绑定设备 */
export function useDeviceBindBindDeviceMutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { agentId: string | number; deviceCode: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { agentId: string | number; deviceCode: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.deviceBindBindDevice(args.params, args.query, args.config),
      ...(options || {}),
    }
  )
}

/** 获取已绑定设备 */
export function useDeviceBindGetUserDevicesQuery(
  params: { agentId: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultListDeviceEntity>
) {
  return useQuery<ResultListDeviceEntity>({
    queryKey: ['DeviceBind.GetUserDevices', params, query],
    queryFn: () => Api.deviceBindGetUserDevices(params, query, options?.config),
    ...(options || {}),
  })
}
