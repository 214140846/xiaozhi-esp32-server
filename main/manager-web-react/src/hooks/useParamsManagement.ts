import { useCallback, useMemo, useState } from 'react'
import type { ParamForm, ParamItem, PageSize } from '../types/params'
import { PAGE_SIZE_OPTIONS } from '../types/params'

// 轻量本地状态版参数管理 Hook
// 目的：
// - 解决页面对 useParamsManagement 的导入报错（以当前代码结构为准）
// - 提供页面运行所需的完整 API，后续可无痛替换为基于 react-query + axios 的真实实现

export interface UseParamsManagementResult {
  // 数据
  params: ParamItem[]
  total: number
  currentPage: number
  pageSize: PageSize
  searchCode: string
  selectedRows: number[]

  // 状态
  loading: boolean
  error: unknown
  submitting: boolean
  deleting: boolean

  // 操作方法
  handleSearch: (q: string) => void
  handlePageChange: (page: number) => void
  handlePageSizeChange: (size: PageSize) => void
  handleRowSelection: (selected: number[]) => void
  handleSelectAll: (all: boolean) => void
  handleSubmitParam: (data: ParamForm) => Promise<void>
  handleDeleteSelected: () => Promise<void>
  handleDeleteParam: (id: number) => Promise<void>
  refetch: () => Promise<void>

  // 配置/派生
  pageCount: number
  isAllSelected: boolean
  hasSelection: boolean
}

const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZE_OPTIONS[0]

// 生成一个简单的自增 ID（仅用于本地状态占位）
let __id = 1
const nextId = () => __id++

export function useParamsManagement(): UseParamsManagementResult {
  // 本地状态（可后续替换为后端数据）
  const [allParams, setAllParams] = useState<ParamItem[]>([])
  const [searchCode, setSearchCode] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  // 状态标识
  const [loading] = useState(false)
  const [error] = useState<unknown>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 过滤 + 分页
  const filtered = useMemo(() => {
    const q = searchCode.trim().toLowerCase()
    if (!q) return allParams
    return allParams.filter(p =>
      p.paramCode.toLowerCase().includes(q) ||
      (p.remark ? p.remark.toLowerCase().includes(q) : false)
    )
  }, [allParams, searchCode])

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(currentPage, pageCount)
  const pagedParams = useMemo(() => {
    const start = (safePage - 1) * pageSize
    const end = start + pageSize
    return filtered.slice(start, end)
  }, [filtered, pageSize, safePage])

  // 页面“全选”基于当前分页可见列表
  const isAllSelected = pagedParams.length > 0 && pagedParams.every(p => selectedRows.includes(p.id))
  const hasSelection = selectedRows.length > 0

  // 交互函数
  const handleSearch = useCallback((q: string) => {
    setSearchCode(q)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page))
  }, [])

  const handlePageSizeChange = useCallback((size: PageSize) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  const handleRowSelection = useCallback((selected: number[]) => {
    setSelectedRows(selected)
  }, [])

  const handleSelectAll = useCallback((all: boolean) => {
    if (all) {
      setSelectedRows(Array.from(new Set([...selectedRows, ...pagedParams.map(p => p.id)])))
    } else {
      // 仅取消当前页已选
      const currentIds = new Set(pagedParams.map(p => p.id))
      setSelectedRows(prev => prev.filter(id => !currentIds.has(id)))
    }
  }, [pagedParams, selectedRows])

  const handleSubmitParam = useCallback(async (data: ParamForm) => {
    setSubmitting(true)
    try {
      if (data.id) {
        setAllParams(prev => prev.map(p => (p.id === data.id ? { ...p, ...data } as ParamItem : p)))
      } else {
        const newItem: ParamItem = {
          id: nextId(),
          paramCode: data.paramCode,
          paramValue: data.paramValue,
          remark: data.remark,
        }
        setAllParams(prev => [newItem, ...prev])
      }
    } finally {
      setSubmitting(false)
    }
  }, [])

  const handleDeleteSelected = useCallback(async () => {
    if (selectedRows.length === 0) return
    setDeleting(true)
    try {
      const selected = new Set(selectedRows)
      setAllParams(prev => prev.filter(p => !selected.has(p.id)))
      setSelectedRows([])
    } finally {
      setDeleting(false)
    }
  }, [selectedRows])

  const handleDeleteParam = useCallback(async (id: number) => {
    setDeleting(true)
    try {
      setAllParams(prev => prev.filter(p => p.id !== id))
      setSelectedRows(prev => prev.filter(x => x !== id))
    } finally {
      setDeleting(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    // 预留：后续替换为真实接口刷新
    // 这里保持空实现即可
  }, [])

  return {
    // 数据
    params: pagedParams,
    total,
    currentPage: safePage,
    pageSize,
    searchCode,
    selectedRows,

    // 状态
    loading,
    error,
    submitting,
    deleting,

    // 方法
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleRowSelection,
    handleSelectAll,
    handleSubmitParam,
    handleDeleteSelected,
    handleDeleteParam,
    refetch,

    // 派生
    pageCount,
    isAllSelected,
    hasSelection,
  }
}
