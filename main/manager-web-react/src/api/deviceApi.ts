import { apiClient } from '../lib/api';
import type {
  Device,
  RawDeviceData,
  DeviceBindParams,
  ManualAddDeviceParams,
  UpdateDeviceParams,
  DeviceOperationResponse
} from '../types/device';
import type { DeviceRegisterParams, DeviceRegisterResponse } from '../types/device';

// 基于全局 apiClient 的基础路径（见 src/lib/api.ts）

/**
 * 设备管理相关API接口
 */
export class DeviceApi {
  
  /**
   * 获取指定Agent绑定的设备列表
   * @param agentId Agent ID
   * @returns Promise<Device[]>
   */
  static async getAgentBindDevices(agentId: string): Promise<Device[]> {
    try {
      console.log('🔄 Fetching devices for agent:', agentId);
      
      const response = await apiClient.get<DeviceOperationResponse>(
        `/device/bind/${agentId}`
      );
      
      if (response.data.code === 0 && response.data.data) {
        console.log('✅ Successfully fetched devices:', response.data.data.length);
        
        // 转换原始数据为前端使用的格式
        const devices = response.data.data.map((device: RawDeviceData) => ({
          device_id: device.id,
          model: device.board,
          firmwareVersion: device.appVersion,
          macAddress: device.macAddress,
          bindTime: device.createDate,
          lastConversation: device.lastConnectedAt,
          remark: device.alias,
          _originalRemark: device.alias,
          isEdit: false,
          _submitting: false,
          otaSwitch: device.autoUpdate === 1,
          rawBindTime: new Date(device.createDate).getTime(),
          selected: false
        })).sort((a: Device, b: Device) => (a.rawBindTime || 0) - (b.rawBindTime || 0));
        
        return devices;
      } else {
        throw new Error(response.data.msg || '获取设备列表失败');
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch devices:', error);
      throw new Error(error.response?.data?.msg || error.message || '网络请求失败');
    }
  }

  /**
   * 解绑单个设备
   * @param deviceId 设备ID
   */
  static async unbindDevice(deviceId: string): Promise<void> {
    try {
      console.log('🔄 Unbinding device:', deviceId);
      
      const response = await apiClient.post<DeviceOperationResponse>(
        `/device/unbind`,
        { deviceId }
      );
      
      if (response.data.code === 0) {
        console.log('✅ Successfully unbound device:', deviceId);
      } else {
        throw new Error(response.data.msg || '设备解绑失败');
      }
    } catch (error: any) {
      console.error('❌ Failed to unbind device:', error);
      throw new Error(error.response?.data?.msg || error.message || '网络请求失败');
    }
  }

  /**
   * 批量解绑设备
   * @param deviceIds 设备ID数组
   */
  static async batchUnbindDevices(deviceIds: string[]): Promise<void> {
    console.log('🔄 Batch unbinding devices:', deviceIds.length);
    
    // 并行执行所有解绑操作
    const promises = deviceIds.map(id => this.unbindDevice(id));
    
    try {
      await Promise.all(promises);
      console.log('✅ Successfully unbound all devices');
    } catch (error) {
      console.error('❌ Failed to unbind some devices:', error);
      throw error;
    }
  }

  /**
   * 通过验证码绑定设备
   * @param params 绑定参数
   */
  static async bindDevice(params: DeviceBindParams): Promise<void> {
    try {
      console.log('🔄 Binding device with code:', params.deviceCode);
      
      const response = await apiClient.post<DeviceOperationResponse>(
        `/device/bind/${params.agentId}/${params.deviceCode}`
      );
      
      if (response.data.code === 0) {
        console.log('✅ Successfully bound device');
      } else {
        throw new Error(response.data.msg || '设备绑定失败');
      }
    } catch (error: any) {
      console.error('❌ Failed to bind device:', error);
      throw new Error(error.response?.data?.msg || error.message || '网络请求失败');
    }
  }

  /**
   * 手动添加设备
   * @param params 设备信息参数
   */
  static async manualAddDevice(params: ManualAddDeviceParams): Promise<void> {
    try {
      console.log('🔄 Manually adding device:', params.macAddress);
      
      const response = await apiClient.post<DeviceOperationResponse>(
        `/device/manual-add`,
        params
      );
      
      if (response.data.code === 0) {
        console.log('✅ Successfully added device');
      } else {
        throw new Error(response.data.msg || '添加设备失败');
      }
    } catch (error: any) {
      console.error('❌ Failed to add device:', error);
      throw new Error(error.response?.data?.msg || error.message || '网络请求失败');
    }
  }

  /**
   * 设备注册（上报MAC地址换取注册码/标识）
   * @param params { macAddress }
   * @returns 注册返回字符串（具体含义由后端定义）
   */
  static async registerDevice(params: DeviceRegisterParams): Promise<string> {
    try {
      console.log('🔄 Registering device with MAC:', params.macAddress);

      const response = await apiClient.post<DeviceRegisterResponse>(
        `/device/register`,
        params
      );

      if (response.data.code === 0) {
        console.log('✅ Device registered successfully');
        return response.data.data || '';
      } else {
        throw new Error(response.data.msg || '设备注册失败');
      }
    } catch (error: any) {
      console.error('❌ Failed to register device:', error);
      throw new Error(error.response?.data?.msg || error.message || '网络请求失败');
    }
  }

  /**
   * 更新设备信息
   * @param deviceId 设备ID
   * @param params 更新参数
   */
  static async updateDeviceInfo(deviceId: string, params: UpdateDeviceParams): Promise<void> {
    try {
      console.log('🔄 Updating device info:', deviceId, params);
      
      const response = await apiClient.put<DeviceOperationResponse>(
        `/device/update/${deviceId}`,
        params
      );
      
      if (response.data.code === 0) {
        console.log('✅ Successfully updated device info');
      } else {
        throw new Error(response.data.msg || '更新设备信息失败');
      }
    } catch (error: any) {
      console.error('❌ Failed to update device info:', error);
      throw new Error(error.response?.data?.msg || error.message || '网络请求失败');
    }
  }
}
