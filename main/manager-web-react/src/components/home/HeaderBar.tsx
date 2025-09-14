import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, X, Home } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';
import UserMenu from '../layout/UserMenu';

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
  // 用户菜单与操作在 UserMenu 中实现（桌面与移动端复用）
  // 全局移动端顶部栏负责侧边栏开关，这里不重复实现

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
    <header className="bg-card shadow-sm border-b border-border">
      <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* 左侧：Logo 和标题 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-lg flex-shrink-0">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                智能体管理
              </h1>
              <p className="hidden sm:block text-sm text-muted-foreground">
                管理您的AI助手
              </p>
            </div>
          </div>

          {/* 右侧：搜索框 */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>

              <Input
                type="text"
                placeholder="搜索智能体..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-9"
              />

              {localSearchQuery && (
                <button
                  onClick={handleSearchReset}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="清除搜索"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </button>
              )}
            </div>

            {/* 搜索状态指示与重置 */}
            {searchQuery && (
              <>
                <div className="hidden sm:block text-sm text-muted-foreground">
                  搜索: "{searchQuery}"
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSearchReset}
                  className=""
                >
                  重置
                </Button>
              </>
            )}

            {/* 主题切换（移动端顶部栏已有，这里仅桌面显示） */}
            <ThemeToggle className="hidden sm:inline-flex" />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
