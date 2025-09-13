import { useMutation } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';

/** 批量解绑（循环调用 /device/unbind） */
export function useBatchUnbindDevices() {
  return useMutation<void, Error, string[]>({
    mutationFn: (deviceIds: string[]) => DeviceApi.batchUnbindDevices(deviceIds),
  });
}

export default useBatchUnbindDevices;

