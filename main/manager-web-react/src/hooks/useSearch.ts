import { useState, useMemo, useCallback } from 'react';

/**
 * 搜索功能Hook
 * 
 * @param data - 要搜索的数据数组
 * @param searchKeyExtractor - 从数据项中提取搜索关键字的函数
 * @returns 搜索相关的状态和方法
 */
export function useSearch<T>(
  data: T[],
  searchKeyExtractor: (item: T) => string
) {
  console.log('[useSearch] Hook初始化，数据量:', data.length);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // 过滤后的数据
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      console.log('[useSearch] 无搜索条件，返回全部数据');
      return data;
    }

    try {
      // 创建正则表达式进行搜索（忽略大小写）
      const regex = new RegExp(searchQuery.trim(), 'i');
      
      const filtered = data.filter(item => {
        const searchKey = searchKeyExtractor(item);
        return regex.test(searchKey);
      });

      console.log('[useSearch] 搜索结果:', {
        query: searchQuery,
        totalCount: data.length,
        filteredCount: filtered.length
      });

      return filtered;
    } catch (error) {
      console.error('[useSearch] 搜索过程出错:', error);
      // 如果正则表达式无效，返回空数组
      return [];
    }
  }, [data, searchQuery, searchKeyExtractor]);

  // 处理搜索
  const handleSearch = useCallback((query: string) => {
    console.log('[useSearch] 执行搜索:', query);
    setSearchQuery(query);
  }, []);

  // 重置搜索
  const handleSearchReset = useCallback(() => {
    console.log('[useSearch] 重置搜索');
    setSearchQuery('');
  }, []);

  // 搜索统计信息
  const searchStats = useMemo(() => ({
    totalCount: data.length,
    filteredCount: filteredData.length,
    isSearching: !!searchQuery.trim(),
    hasResults: filteredData.length > 0
  }), [data.length, filteredData.length, searchQuery]);

  return {
    searchQuery,
    filteredData,
    searchStats,
    handleSearch,
    handleSearchReset
  };
}