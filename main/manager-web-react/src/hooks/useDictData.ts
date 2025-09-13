/**
 * 字典数据管理 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictAPI } from '../api/dictApi';
import type { DictDataQuery, DictDataForm } from '../types/dict';

// 查询键
const DICT_DATA_QUERY_KEY = ['dictData'];

export const useDictData = (params: DictDataQuery) => {
  return useQuery({
    queryKey: [...DICT_DATA_QUERY_KEY, params],
    queryFn: async () => {
      const response = await dictAPI.getDictDataList(params);
      if (response.code !== 0) {
        throw new Error(response.msg || '获取字典数据列表失败');
      }
      return response.data;
    },
    enabled: !!params.dictTypeId, // 只有当 dictTypeId 存在时才启用查询
    staleTime: 5000, // 5秒内认为数据是新鲜的
  });
};

export const useDictDataActions = () => {
  const queryClient = useQueryClient();

  // 新增字典数据
  const addDictData = useMutation({
    mutationFn: async (data: DictDataForm) => {
      const response = await dictAPI.addDictData(data);
      if (response.code !== 0) {
        throw new Error(response.msg || '新增字典数据失败');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 刷新对应字典类型的数据
      queryClient.invalidateQueries({ 
        queryKey: [...DICT_DATA_QUERY_KEY],
        predicate: (query) => {
          const params = query.queryKey[1] as DictDataQuery;
          return params?.dictTypeId === variables.dictTypeId;
        }
      });
    },
  });

  // 更新字典数据
  const updateDictData = useMutation({
    mutationFn: async (data: DictDataForm) => {
      const response = await dictAPI.updateDictData(data);
      if (response.code !== 0) {
        throw new Error(response.msg || '更新字典数据失败');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 刷新对应字典类型的数据
      queryClient.invalidateQueries({ 
        queryKey: [...DICT_DATA_QUERY_KEY],
        predicate: (query) => {
          const params = query.queryKey[1] as DictDataQuery;
          return params?.dictTypeId === variables.dictTypeId;
        }
      });
    },
  });

  // 删除字典数据
  const deleteDictData = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await dictAPI.deleteDictData(ids);
      if (response.code !== 0) {
        throw new Error(response.msg || '删除字典数据失败');
      }
      return response.data;
    },
    onSuccess: () => {
      // 刷新所有字典数据查询
      queryClient.invalidateQueries({ queryKey: DICT_DATA_QUERY_KEY });
    },
  });

  return {
    addDictData,
    updateDictData,
    deleteDictData,
  };
};