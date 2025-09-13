import { useMutation } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';
import type { DeviceRegisterParams } from '../types/device';

/**
 * 设备注册 Hook（调用 /device/register）
 * 返回 mutateAsync 等属性用于发起注册
 */
export function useDeviceRegister() {
  return useMutation<string, Error, DeviceRegisterParams>({
    mutationFn: (params: DeviceRegisterParams) => DeviceApi.registerDevice(params),
  });
}

export default useDeviceRegister;

