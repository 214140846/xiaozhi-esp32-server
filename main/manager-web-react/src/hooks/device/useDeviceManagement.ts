import { useMemo, useState } from 'react'
import {
  useDeviceBindGetUserDevicesQuery,
  useDeviceUnbindUnbindDeviceMutation,
  useDeviceUpdateUpdateDeviceInfoMutation,
  useDeviceBindBindDeviceMutation,
  useDeviceManualAddManualAddDeviceMutation,
} from './generatedHooks'
import type {
  DeviceEntity,
  DeviceUnBindDTO,
  DeviceUpdateDTO,
  DeviceManualAddDTO,
} from '../../types/openapi/device'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type RowSelectionState,
  type VisibilityState,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'

export type UIDevice = DeviceEntity & { selected: boolean }

const DEFAULT_PAGE_SIZES = [10, 20, 50]

export function useDeviceManagement(agentId: string) {
  // 搜索关键词（作为全局过滤条件）
  const [searchKeyword, setSearchKeyword] = useState('')

  // TanStack Table 状态（分页、选择、排序、列可见性等）
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZES[0] })

  // 数据查询
  const devicesQuery = useDeviceBindGetUserDevicesQuery(
    { agentId },
    undefined,
    { enabled: !!agentId }
  )

  const unbindMutation = useDeviceUnbindUnbindDeviceMutation()
  const updateMutation = useDeviceUpdateUpdateDeviceInfoMutation()
  const bindMutation = useDeviceBindBindDeviceMutation()
  const manualAddMutation = useDeviceManualAddManualAddDeviceMutation()

  // 客户端搜索过滤
  const filteredDevices = useMemo<DeviceEntity[]>(() => {
    const list = devicesQuery.data?.data ?? []
    const kw = searchKeyword.trim().toLowerCase()
    if (!kw) return list
    return list.filter((d) =>
      [d.macAddress, d.board, d.appVersion, d.alias]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(kw))
    )
  }, [devicesQuery.data, searchKeyword])

  // 为了让选择稳定，指定 getRowId 使用后端返回的 id 或 macAddress
  const getRowId = (row: DeviceEntity, index: number) => {
    return String(row.id ?? row.macAddress ?? `row-${index}`)
  }

  // 最小列定义（主要是为了让表实例合法，不强制 UI 使用这些列）
  const columns: ColumnDef<UIDevice>[] = useMemo(
    () => [
      { accessorKey: 'board', header: '设备型号' },
      { accessorKey: 'appVersion', header: '固件版本' },
      { accessorKey: 'macAddress', header: 'Mac地址' },
      { accessorKey: 'createDate', header: '绑定时间' },
      { accessorKey: 'alias', header: '备注' },
      { accessorKey: 'autoUpdate', header: 'OTA升级' },
      { accessorKey: 'id', header: 'ID' },
    ],
    []
  )

  // 构建表实例（分页 + 选择）
  const table = useReactTable<UIDevice>({
    data: filteredDevices as UIDevice[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      rowSelection,
      columnVisibility,
      sorting,
      columnFilters,
      pagination,
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getRowId,
    enableRowSelection: true,
  })

  // 衍生分页与页面信息
  const currentPage = table.getState().pagination.pageIndex + 1
  const pageSize = table.getState().pagination.pageSize
  const pageCount = Math.max(1, table.getPageCount())

  const paginatedDevices: UIDevice[] = useMemo(() => {
    return table.getRowModel().rows.map((row) => ({
      ...(row.original as DeviceEntity),
      selected: row.getIsSelected(),
    }))
  }, [table, table.getState().rowSelection, table.getState().pagination])

  const visiblePages = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(pageCount, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [currentPage, pageCount])

  // 搜索时回到第一页
  const handleSearch = () => {
    table.setPageIndex(0)
  }

  const handlePageSizeChange = (size: number) => {
    table.setPageSize(size)
    table.setPageIndex(0)
  }

  const goFirst = () => table.setPageIndex(0)
  const goPrev = () => table.previousPage()
  const goNext = () => table.nextPage()
  const goToPage = (p: number) => table.setPageIndex(Math.min(pageCount - 1, Math.max(0, p - 1)))

  // 当前页是否全选/切换全选
  const isCurrentPageAllSelected = table.getIsAllPageRowsSelected()
  const handleSelectAll = () => {
    table.toggleAllPageRowsSelected(!isCurrentPageAllSelected)
  }

  // 单行选择切换
  const updateDeviceSelection = (id: string | number, checked: boolean) => {
    const row = table.getRowModel().rowsById[String(id)]
    if (row) row.toggleSelected(checked)
  }

  // 刷新
  const refetch = () => devicesQuery.refetch()

  // 业务动作
  const unbindDevice = async (deviceId: string) => {
    const payload: DeviceUnBindDTO = { deviceId }
    const res = await unbindMutation.mutateAsync({ data: payload })
    if (res?.code !== 0) {
      throw new Error(res?.msg || '解绑失败')
    }
    await refetch()
  }

  const batchUnbindDevices = async (deviceIds: string[]) => {
    for (const id of deviceIds) {
      await unbindDevice(id)
    }
  }

  const updateDeviceInfo = async ({ deviceId, params }: { deviceId: string; params: DeviceUpdateDTO }) => {
    const res = await updateMutation.mutateAsync({ params: { id: deviceId }, data: params })
    if (res?.code !== 0) {
      throw new Error(res?.msg || '更新失败')
    }
    await refetch()
  }

  const bindDevice = async ({ agentId, deviceCode }: { agentId: string; deviceCode: string }) => {
    const res = await bindMutation.mutateAsync({ params: { agentId, deviceCode } })
    if (res?.code !== 0) {
      throw new Error(res?.msg || '绑定失败')
    }
    await refetch()
  }

  const manualAddDevice = async (data: DeviceManualAddDTO) => {
    const res = await manualAddMutation.mutateAsync({ data })
    if (res?.code !== 0) {
      throw new Error(res?.msg || '添加失败')
    }
    await refetch()
  }

  return {
    // 提供 TanStack Table 实例，便于用 shadcn Table 对接
    table,

    // data（兼容旧页面）
    paginatedDevices,
    PAGE_SIZE_OPTIONS: DEFAULT_PAGE_SIZES,
    visiblePages,
    currentPage,
    pageSize,
    pageCount,
    isLoading: devicesQuery.isLoading,

    // search
    searchKeyword,
    setSearchKeyword,
    handleSearch,

    // selection & pagination（兼容旧页面 API）
    isCurrentPageAllSelected,
    handleSelectAll,
    updateDeviceSelection,
    handlePageSizeChange,
    goFirst,
    goPrev,
    goNext,
    goToPage,

    // actions
    refetch,
    unbindDevice,
    batchUnbindDevices,
    updateDeviceInfo,
    bindDevice,
    manualAddDevice,

    // states
    isUnbinding: unbindMutation.isPending,
    isBatchUnbinding: unbindMutation.isPending, // 简化：批量时同一个 mutation
    isUpdating: updateMutation.isPending,
  }
}
