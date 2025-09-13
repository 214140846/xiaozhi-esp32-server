import { useQuery } from '@tanstack/react-query';
import { DeviceApi } from '../api/deviceApi';
import type { Device } from '../types/device';

/**
 * 查询指定 agent 的已绑定设备列表
 */
export function useAgentDevices(agentId: string) {
  return useQuery<Device[]>({
    queryKey: ['devices', agentId],
    queryFn: () => DeviceApi.getAgentBindDevices(agentId),
    enabled: !!agentId,
  });
}

export default useAgentDevices;

