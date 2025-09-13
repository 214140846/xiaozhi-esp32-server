import { useMutation } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';
import type { ManualAddDeviceParams } from '../types/device';

/** 手动添加设备（/device/manual-add） */
export function useManualAddDevice() {
  return useMutation<void, Error, ManualAddDeviceParams>({
    mutationFn: (params: ManualAddDeviceParams) => DeviceApi.manualAddDevice(params),
  });
}

export default useManualAddDevice;

