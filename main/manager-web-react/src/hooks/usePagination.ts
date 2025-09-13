/**
 * 分页管理Hook
 * 复刻Vue版本的分页逻辑
 */

import { useState, useMemo, useCallback } from 'react'

export interface PaginationState {
  currentPage: number
  pageSize: number
  total: number
}

export interface PaginationActions {
  goFirst: () => void
  goPrev: () => void
  goNext: () => void
  goToPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotal: (total: number) => void
}

export interface UsePaginationResult extends PaginationState, PaginationActions {
  pageCount: number
  visiblePages: number[]
  pageSizeOptions: number[]
}

export function usePagination(
  initialPageSize = 10,
  onPageChange?: (page: number, pageSize: number) => void
): UsePaginationResult {
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [total, setTotal] = useState(0)
  
  // 分页选项
  const pageSizeOptions = [10, 20, 50, 100]

  // 总页数
  const pageCount = useMemo(() => {
    return Math.ceil(total / pageSize)
  }, [total, pageSize])

  // 可见页码（复刻Vue版本逻辑）
  const visiblePages = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 3
    let start = Math.max(1, currentPage - 1)
    let end = Math.min(pageCount, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }, [currentPage, pageCount])

  // 页码跳转
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page)
      onPageChange?.(page, pageSize)
    }
  }, [pageCount, pageSize, onPageChange])

  // 首页
  const goFirst = useCallback(() => {
    goToPage(1)
  }, [goToPage])

  // 上一页
  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  // 下一页
  const goNext = useCallback(() => {
    if (currentPage < pageCount) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, pageCount, goToPage])

  // 设置页面大小
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1) // 重置到第一页
    onPageChange?.(1, size)
  }, [onPageChange])

  return {
    currentPage,
    pageSize,
    total,
    pageCount,
    visiblePages,
    pageSizeOptions,
    goFirst,
    goPrev,
    goNext,
    goToPage,
    setPageSize,
    setTotal
  }
}