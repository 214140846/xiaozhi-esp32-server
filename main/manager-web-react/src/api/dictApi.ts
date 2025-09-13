/**
 * 字典管理 API 接口
 */
import apiClient from '../lib/api';
import type { 
  ApiResponse, 
  DictType, 
  DictData, 
  DictTypeForm, 
  DictDataForm,
  DictTypeQuery,
  DictDataQuery,
  PageResponse 
} from '../types/dict';
import type { FirmwareType } from '../types/device';

export const dictAPI = {
  // ==================== 字典类型管理 ====================
  
  /**
   * 获取字典类型列表
   */
  getDictTypeList: async (params: DictTypeQuery): Promise<ApiResponse<PageResponse<DictType>>> => {
    console.log('[Dict API] 获取字典类型列表', params);
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<DictType>>>('/dict/type/list', { 
        params 
      });
      console.log('[Dict API] 字典类型列表获取成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典类型列表获取失败:', error);
      throw error;
    }
  },

  /**
   * 新增字典类型
   */
  addDictType: async (data: DictTypeForm): Promise<ApiResponse<any>> => {
    console.log('[Dict API] 新增字典类型', data);
    try {
      const response = await apiClient.post<ApiResponse<any>>('/dict/type/add', data);
      console.log('[Dict API] 字典类型新增成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典类型新增失败:', error);
      throw error;
    }
  },

  /**
   * 更新字典类型
   */
  updateDictType: async (data: DictTypeForm): Promise<ApiResponse<any>> => {
    console.log('[Dict API] 更新字典类型', data);
    try {
      const response = await apiClient.post<ApiResponse<any>>('/dict/type/update', data);
      console.log('[Dict API] 字典类型更新成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典类型更新失败:', error);
      throw error;
    }
  },

  /**
   * 删除字典类型（批量）
   */
  deleteDictType: async (ids: number[]): Promise<ApiResponse<any>> => {
    console.log('[Dict API] 删除字典类型', ids);
    try {
      const response = await apiClient.post<ApiResponse<any>>('/dict/type/delete', { ids });
      console.log('[Dict API] 字典类型删除成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典类型删除失败:', error);
      throw error;
    }
  },

  // 通过字典类型编码获取对应的字典数据（便捷方法）
  getDictDataByType: async (dictTypeCode: string): Promise<FirmwareType[]> => {
    try {
      // 1) 获取所有字典类型，找到匹配的类型ID
      const typeResp = await apiClient.get<ApiResponse<PageResponse<DictType>>>('/dict/type/list', {
        params: { page: 1, limit: 1000 }
      });
      if (typeResp.data.code !== 0) throw new Error(typeResp.data.msg || '获取字典类型失败');
      const dictTypes = typeResp.data.data?.list || [];
      const target = dictTypes.find(t => t.dictType === dictTypeCode);
      if (!target) return [];

      // 2) 按类型ID获取字典数据
      const dataResp = await apiClient.get<ApiResponse<PageResponse<DictData>>>('/dict/data/list', {
        params: { dictTypeId: target.id, page: 1, limit: 1000 }
      });
      if (dataResp.data.code !== 0) throw new Error(dataResp.data.msg || '获取字典数据失败');
      const list = dataResp.data.data?.list || [];

      // 3) 映射为通用的 FirmwareType 结构（key/value -> dictValue, name -> dictLabel）
      const result: FirmwareType[] = list.map(item => ({
        key: item.dictValue,
        name: item.dictLabel,
        value: item.dictValue
      }));
      return result;
    } catch (error) {
      console.error('[Dict API] getDictDataByType 调用失败:', error);
      throw error;
    }
  },

  // ==================== 字典数据管理 ====================

  /**
   * 获取字典数据列表
   */
  getDictDataList: async (params: DictDataQuery): Promise<ApiResponse<PageResponse<DictData>>> => {
    console.log('[Dict API] 获取字典数据列表', params);
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<DictData>>>('/dict/data/list', { 
        params 
      });
      console.log('[Dict API] 字典数据列表获取成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典数据列表获取失败:', error);
      throw error;
    }
  },

  /**
   * 新增字典数据
   */
  addDictData: async (data: DictDataForm): Promise<ApiResponse<any>> => {
    console.log('[Dict API] 新增字典数据', data);
    try {
      const response = await apiClient.post<ApiResponse<any>>('/dict/data/add', data);
      console.log('[Dict API] 字典数据新增成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典数据新增失败:', error);
      throw error;
    }
  },

  /**
   * 更新字典数据
   */
  updateDictData: async (data: DictDataForm): Promise<ApiResponse<any>> => {
    console.log('[Dict API] 更新字典数据', data);
    try {
      const response = await apiClient.post<ApiResponse<any>>('/dict/data/update', data);
      console.log('[Dict API] 字典数据更新成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典数据更新失败:', error);
      throw error;
    }
  },

  /**
   * 删除字典数据（批量）
   */
  deleteDictData: async (ids: number[]): Promise<ApiResponse<any>> => {
    console.log('[Dict API] 删除字典数据', ids);
    try {
      const response = await apiClient.post<ApiResponse<any>>('/dict/data/delete', { ids });
      console.log('[Dict API] 字典数据删除成功');
      return response.data;
    } catch (error) {
      console.error('[Dict API] 字典数据删除失败:', error);
      throw error;
    }
  }
};

export default dictAPI;