import { useMutation } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';
import type { UpdateDeviceParams } from '../types/device';

/** 更新设备信息（/device/update/{id}） */
export function useUpdateDeviceInfo() {
  return useMutation<void, Error, { deviceId: string; params: UpdateDeviceParams}>({
    mutationFn: ({ deviceId, params }) => DeviceApi.updateDeviceInfo(deviceId, params),
  });
}

export default useUpdateDeviceInfo;

