/**
 * 参数表格分页组件
 * 提供分页控制功能，包括页码跳转、每页条数选择等
 */
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import type { PageSize } from '../../types/params';
import { PAGE_SIZE_OPTIONS } from '../../types/params';

export interface ParamPaginationProps {
  currentPage: number;
  pageSize: PageSize;
  total: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

export function ParamPagination({
  currentPage,
  pageSize,
  total,
  pageCount,
  onPageChange,
  onPageSizeChange
}: ParamPaginationProps) {
  // 计算可见页码
  const getVisiblePages = (): number[] => {
    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(pageCount, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  // 处理第一页
  const handleFirst = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  // 处理上一页
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // 处理下一页
  const handleNext = () => {
    if (currentPage < pageCount) {
      onPageChange(currentPage + 1);
    }
  };

  // 处理页码跳转
  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  // 处理每页条数变化
  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value) as PageSize;
    onPageSizeChange(newPageSize);
  };

  if (pageCount <= 1) {
    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="每页条数" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={size.toString()}>{`${size}条/页`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          共 {total} 条记录
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-4">
      {/* 左侧控制 */}
      <div className="flex items-center gap-4">
<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="每页条数" />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map(size => (
            <SelectItem key={size} value={size.toString()}>{`${size}条/页`}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      </div>

      {/* 右侧分页控制 */}
      <div className="flex items-center gap-2">
        {/* 首页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirst}
          disabled={currentPage === 1}
          className="min-w-[60px]"
        >
          首页
        </Button>

        {/* 上一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="min-w-[60px]"
        >
          上一页
        </Button>

        {/* 页码 */}
        <div className="flex items-center gap-1">
          {visiblePages.map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageClick(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
        </div>

        {/* 下一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === pageCount}
          className="min-w-[60px]"
        >
          下一页
        </Button>

        {/* 总记录数 */}
        <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
          共 {total} 条记录
        </div>
      </div>
    </div>
  );
}