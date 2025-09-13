/**
 * 字典类型管理 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictAPI } from '../api/dictApi';
import type { DictTypeQuery, DictTypeForm } from '../types/dict';

// 查询键
const DICT_TYPE_QUERY_KEY = ['dictTypes'];

export const useDictTypes = (params?: DictTypeQuery) => {
  return useQuery({
    queryKey: [...DICT_TYPE_QUERY_KEY, params],
    queryFn: async () => {
      const response = await dictAPI.getDictTypeList(params || {});
      if (response.code !== 0) {
        throw new Error(response.msg || '获取字典类型列表失败');
      }
      return response.data;
    },
    staleTime: 5000, // 5秒内认为数据是新鲜的
  });
};

export const useDictTypeActions = () => {
  const queryClient = useQueryClient();

  // 新增字典类型
  const addDictType = useMutation({
    mutationFn: async (data: DictTypeForm) => {
      const response = await dictAPI.addDictType(data);
      if (response.code !== 0) {
        throw new Error(response.msg || '新增字典类型失败');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DICT_TYPE_QUERY_KEY });
    },
  });

  // 更新字典类型
  const updateDictType = useMutation({
    mutationFn: async (data: DictTypeForm) => {
      const response = await dictAPI.updateDictType(data);
      if (response.code !== 0) {
        throw new Error(response.msg || '更新字典类型失败');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DICT_TYPE_QUERY_KEY });
    },
  });

  // 删除字典类型
  const deleteDictType = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await dictAPI.deleteDictType(ids);
      if (response.code !== 0) {
        throw new Error(response.msg || '删除字典类型失败');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DICT_TYPE_QUERY_KEY });
    },
  });

  return {
    addDictType,
    updateDictType,
    deleteDictType,
  };
};