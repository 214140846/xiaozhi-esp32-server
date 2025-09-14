import { useCallback, useMemo, useState } from 'react'

export type PageSize = 10 | 20 | 50 | 100

export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: PageSize
  onChange?: (page: number, pageSize: number) => void
}

export function usePagination(
  initialPageSize: PageSize = 10,
  onChange?: (page: number, pageSize: number) => void
) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSizeState] = useState<PageSize>(initialPageSize)
  const [total, setTotal] = useState<number>(0)

  const pageCount = useMemo(() => {
    const count = Math.ceil((total || 0) / (pageSize || 1))
    return count > 0 ? count : 1
  }, [total, pageSize])

  const pageSizeOptions: PageSize[] = [10, 20, 50, 100]

  const emitChange = useCallback(
    (page: number, size: number) => {
      onChange?.(page, size)
    },
    [onChange]
  )

  const goToPage = useCallback(
    (page: number) => {
      const target = Math.min(Math.max(1, page), pageCount)
      setCurrentPage(target)
      emitChange(target, pageSize)
    },
    [emitChange, pageCount, pageSize]
  )

  const goFirst = useCallback(() => goToPage(1), [goToPage])
  const goPrev = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage])
  const goNext = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage])

  const setPageSize = useCallback(
    (size: PageSize) => {
      setPageSizeState(size)
      // 切换每页条数时，重置到第一页
      setCurrentPage(1)
      emitChange(1, size)
    },
    [emitChange]
  )

  const visiblePages = useMemo(() => {
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(pageCount, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
    const pages: number[] = []
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [currentPage, pageCount])

  return {
    // state
    currentPage,
    pageSize,
    total,
    pageCount,
    pageSizeOptions,
    visiblePages,

    // setters
    setTotal,
    setPageSize,

    // actions
    goFirst,
    goPrev,
    goNext,
    goToPage,
  }
}

