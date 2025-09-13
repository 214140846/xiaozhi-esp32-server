import { useMutation } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';

/** 单个解绑（/device/unbind） */
export function useUnbindDevice() {
  return useMutation<void, Error, string>({
    // variables: deviceId
    mutationFn: (deviceId: string) => DeviceApi.unbindDevice(deviceId),
  });
}

export default useUnbindDevice;

