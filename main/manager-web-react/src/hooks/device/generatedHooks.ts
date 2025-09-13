/** Auto-generated hooks for device APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/device/generated';

/** 更新设备信息 */
export function useDeviceUpdateUpdateDeviceInfoMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.deviceUpdateUpdateDeviceInfo(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 解绑设备 */
export function useDeviceUnbindUnbindDeviceMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.deviceUnbindUnbindDevice(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 注册设备 */
export function useDeviceRegisterRegisterDeviceMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.deviceRegisterRegisterDevice(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 手动添加设备 */
export function useDeviceManualAddManualAddDeviceMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.deviceManualAddManualAddDevice(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 绑定设备 */
export function useDeviceBindBindDeviceMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { agentId: string | number; deviceCode: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.deviceBindBindDevice(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 获取已绑定设备 */
export function useDeviceBindGetUserDevicesQuery(params: { agentId: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['DeviceBind.GetUserDevices', params, query], queryFn: () => Api.deviceBindGetUserDevices(params as any, query), ...(options || {}) });
}

