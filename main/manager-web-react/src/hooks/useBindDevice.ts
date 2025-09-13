import { useMutation } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';
import type { DeviceBindParams } from '../types/device';

/** 绑定设备（/device/bind/{agentId}/{deviceCode}） */
export function useBindDevice() {
  return useMutation<void, Error, DeviceBindParams>({
    mutationFn: (params: DeviceBindParams) => DeviceApi.bindDevice(params),
  });
}

export default useBindDevice;

