import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, X, Home } from 'lucide-react';

export interface HeaderBarProps {
  /** 搜索回调 */
  onSearch: (query: string) => void;
  /** 搜索重置回调 */
  onSearchReset: () => void;
  /** 当前搜索关键词 */
  searchQuery: string;
}

/**
 * 顶部搜索栏组件
 * 
 * 功能包括：
 * - 智能体搜索
 * - 搜索重置
 * - 主题切换（通过全局组件）
 */
export function HeaderBar({ onSearch, onSearchReset, searchQuery }: HeaderBarProps) {
  console.log('[HeaderBar] 渲染，当前搜索词:', searchQuery);

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // 处理搜索输入变化
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchQuery(value);
    
    // 实时搜索
    onSearch(value);
  }, [onSearch]);

  // 处理搜索重置
  const handleSearchReset = useCallback(() => {
    console.log('[HeaderBar] 重置搜索');
    setLocalSearchQuery('');
    onSearchReset();
  }, [onSearchReset]);

  // 处理回车搜索
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(localSearchQuery);
    }
    if (event.key === 'Escape') {
      handleSearchReset();
    }
  }, [localSearchQuery, onSearch, handleSearchReset]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧：Logo 和标题 */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                智能体管理
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                管理您的AI助手
              </p>
            </div>
          </div>

          {/* 右侧：搜索框 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              
              <Input
                type="text"
                placeholder="搜索智能体..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-64 pl-9 pr-9 py-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              
              {localSearchQuery && (
                <button
                  onClick={handleSearchReset}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="清除搜索"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
                </button>
              )}
            </div>

            {/* 搜索状态指示 */}
            {searchQuery && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                搜索: "{searchQuery}"
              </div>
            )}

            {/* 重置按钮（当有搜索时显示） */}
            {searchQuery && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSearchReset}
                className="text-gray-600 dark:text-gray-300"
              >
                重置
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}