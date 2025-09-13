/** Auto-generated hooks for ota APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/ota/generated';

/** 设备快速检查激活状态 */
export function useOtaActivateActivateDeviceMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, query?: Record<string, any> | undefined, config?: any }) => Api.otaActivateActivateDevice(args.params as any, args.query, args.config), ...(options || {}) });
}

/** OTA版本和设备激活状态检查 */
export function useOtaCheckOTAVersionMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.otaCheckOTAVersion(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

