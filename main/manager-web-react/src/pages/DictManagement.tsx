import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { usePagination } from '@/hooks/usePagination'
import {
  useAdminDictTypePagePage1Query,
  useAdminDictTypeSaveSave1Mutation,
  useAdminDictTypeUpdateUpdate2Mutation,
  useAdminDictTypeDeleteDelete2Mutation,
  useAdminDictDataPagePage2Query,
  useAdminDictDataSaveSave2Mutation,
  useAdminDictDataUpdateUpdate3Mutation,
  useAdminDictDataDeleteDelete3Mutation,
} from '@/hooks/admin'
import type { SysDictTypeVO, SysDictTypeDTO, SysDictDataVO, SysDictDataDTO } from '@/types/openapi/admin'
import { useQueryClient } from '@tanstack/react-query'

const PageSection: React.FC<{ title: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, children, actions }) => (
  <div className="flex flex-col gap-3 border rounded-md p-3 dark:border-gray-800">
    <div className="flex items-center justify-between">
      <div className="text-base font-medium">{title}</div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
    {children}
  </div>
)

export default function DictManagementPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 左侧：字典类型筛选与分页
  const [typeFilter, setTypeFilter] = useState({ dictType: '', dictName: '' })
  const typePager = usePagination(10)

  const {
    data: typeResp,
    isLoading: typeLoading,
    refetch: refetchTypes,
  } = useAdminDictTypePagePage1Query(
    undefined,
    { dictType: typeFilter.dictType || undefined, dictName: typeFilter.dictName || undefined, page: typePager.currentPage, limit: typePager.pageSize },
    { enabled: true }
  )

  useEffect(() => {
    typePager.setTotal(typeResp?.data?.total || 0)
  }, [typeResp?.data?.total])

  const typeList = typeResp?.data?.list || []

  // 当前选中字典类型
  const [selectedType, setSelectedType] = useState<SysDictTypeVO | undefined>(undefined)
  useEffect(() => {
    if (!selectedType && typeList.length > 0) {
      setSelectedType(typeList[0])
    } else if (selectedType) {
      // 如果当前选中的类型不在列表中（例如被删除），则重置
      const exists = typeList.some((t) => t.id === selectedType.id)
      if (!exists) setSelectedType(typeList[0])
    }
  }, [typeList, selectedType])

  // 右侧：字典数据筛选与分页
  const [dataFilter, setDataFilter] = useState({ dictLabel: '', dictValue: '' })
  const dataPager = usePagination(10)

  const {
    data: dataResp,
    isLoading: dataLoading,
    refetch: refetchData,
  } = useAdminDictDataPagePage2Query(
    undefined,
    {
      dictTypeId: selectedType?.id,
      dictLabel: dataFilter.dictLabel || undefined,
      dictValue: dataFilter.dictValue || undefined,
      page: dataPager.currentPage,
      limit: dataPager.pageSize,
    },
    { enabled: !!selectedType?.id }
  )

  useEffect(() => {
    dataPager.setTotal(dataResp?.data?.total || 0)
  }, [dataResp?.data?.total])

  const dataList = dataResp?.data?.list || []

  // 新增/编辑：字典类型
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<SysDictTypeVO | undefined>(undefined)
  const [typeForm, setTypeForm] = useState<SysDictTypeDTO>({ dictType: '', dictName: '', remark: '', sort: 0 })
  const resetTypeForm = () => setTypeForm({ dictType: '', dictName: '', remark: '', sort: 0 })

  useEffect(() => {
    if (typeDialogOpen) return
    setEditingType(undefined)
    resetTypeForm()
  }, [typeDialogOpen])

  const typeSave = useAdminDictTypeSaveSave1Mutation({
    onSuccess: () => {
      toast({ description: '保存成功' })
      setTypeDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['AdminDictTypePage.Page1'] })
      refetchTypes()
    },
    onError: (e: any) => toast({ description: e?.response?.data?.msg || '保存失败', variant: 'destructive' }),
  })
  const typeUpdate = useAdminDictTypeUpdateUpdate2Mutation({
    onSuccess: () => {
      toast({ description: '修改成功' })
      setTypeDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['AdminDictTypePage.Page1'] })
      refetchTypes()
    },
    onError: (e: any) => toast({ description: e?.response?.data?.msg || '修改失败', variant: 'destructive' }),
  })
  const typeDelete = useAdminDictTypeDeleteDelete2Mutation({
    onSuccess: () => {
      toast({ description: '删除成功' })
      queryClient.invalidateQueries({ queryKey: ['AdminDictTypePage.Page1'] })
      refetchTypes()
    },
    onError: (e: any) => toast({ description: e?.response?.data?.msg || '删除失败', variant: 'destructive' }),
  })

  const handleEditType = (t: SysDictTypeVO) => {
    setEditingType(t)
    setTypeForm({ id: t.id, dictType: t.dictType, dictName: t.dictName, remark: t.remark, sort: t.sort })
    setTypeDialogOpen(true)
  }

  const handleSubmitType = async () => {
    const payload: SysDictTypeDTO = {
      id: typeForm.id,
      dictType: (typeForm.dictType || '').trim(),
      dictName: (typeForm.dictName || '').trim(),
      remark: (typeForm.remark || '').trim(),
      sort: Number(typeForm.sort || 0),
    }
    if (!payload.dictType || !payload.dictName) {
      toast({ description: '请填写字典编码和名称', variant: 'destructive' })
      return
    }
    if (payload.id) {
      await typeUpdate.mutateAsync({ data: payload })
    } else {
      await typeSave.mutateAsync({ data: payload })
    }
  }

  // 新增/编辑：字典数据
  const [dataDialogOpen, setDataDialogOpen] = useState(false)
  const [editingData, setEditingData] = useState<SysDictDataVO | undefined>(undefined)
  const [dataForm, setDataForm] = useState<SysDictDataDTO>({ dictTypeId: undefined, dictLabel: '', dictValue: '', remark: '', sort: 0 })
  const resetDataForm = () => setDataForm({ dictTypeId: selectedType?.id, dictLabel: '', dictValue: '', remark: '', sort: 0 })
  useEffect(() => {
    if (dataDialogOpen) return
    setEditingData(undefined)
    resetDataForm()
  }, [dataDialogOpen, selectedType?.id])

  const dataSave = useAdminDictDataSaveSave2Mutation({
    onSuccess: () => {
      toast({ description: '保存成功' })
      setDataDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['AdminDictDataPage.Page2'] })
      refetchData()
    },
    onError: (e: any) => toast({ description: e?.response?.data?.msg || '保存失败', variant: 'destructive' }),
  })
  const dataUpdate = useAdminDictDataUpdateUpdate3Mutation({
    onSuccess: () => {
      toast({ description: '修改成功' })
      setDataDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['AdminDictDataPage.Page2'] })
      refetchData()
    },
    onError: (e: any) => toast({ description: e?.response?.data?.msg || '修改失败', variant: 'destructive' }),
  })
  const dataDelete = useAdminDictDataDeleteDelete3Mutation({
    onSuccess: () => {
      toast({ description: '删除成功' })
      queryClient.invalidateQueries({ queryKey: ['AdminDictDataPage.Page2'] })
      refetchData()
    },
    onError: (e: any) => toast({ description: e?.response?.data?.msg || '删除失败', variant: 'destructive' }),
  })

  const handleEditData = (d: SysDictDataVO) => {
    setEditingData(d)
    setDataForm({ id: d.id, dictTypeId: d.dictTypeId, dictLabel: d.dictLabel, dictValue: d.dictValue, remark: d.remark, sort: d.sort })
    setDataDialogOpen(true)
  }

  const handleSubmitData = async () => {
    const payload: SysDictDataDTO = {
      id: dataForm.id,
      dictTypeId: selectedType?.id,
      dictLabel: (dataForm.dictLabel || '').trim(),
      dictValue: (dataForm.dictValue || '').trim(),
      remark: (dataForm.remark || '').trim(),
      sort: Number(dataForm.sort || 0),
    }
    if (!payload.dictTypeId) {
      toast({ description: '请选择字典类型', variant: 'destructive' })
      return
    }
    if (!payload.dictLabel || !payload.dictValue) {
      toast({ description: '请填写字典数据的标签和值', variant: 'destructive' })
      return
    }
    if (payload.id) {
      await dataUpdate.mutateAsync({ data: payload })
    } else {
      await dataSave.mutateAsync({ data: payload })
    }
  }

  // 删除动作
  const handleDeleteType = async (id: number | undefined) => {
    if (!id) return
    await typeDelete.mutateAsync({ data: [String(id)] })
  }
  const handleDeleteData = async (id: number | undefined) => {
    if (!id) return
    await dataDelete.mutateAsync({ data: [String(id)] })
  }

  // 渲染
  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-semibold">字典管理</div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 左栏：字典类型 */}
        <div className="lg:col-span-2 space-y-3">
          <PageSection
            title="字典类型"
            actions={
              <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">新增类型</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingType ? '编辑字典类型' : '新增字典类型'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="dictType">字典编码</Label>
                      <Input id="dictType" value={typeForm.dictType || ''} onChange={(e) => setTypeForm((s) => ({ ...s, dictType: e.target.value }))} placeholder="如: device_status" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dictName">字典名称</Label>
                      <Input id="dictName" value={typeForm.dictName || ''} onChange={(e) => setTypeForm((s) => ({ ...s, dictName: e.target.value }))} placeholder="如: 设备状态" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="typeRemark">备注</Label>
                      <Input id="typeRemark" value={typeForm.remark || ''} onChange={(e) => setTypeForm((s) => ({ ...s, remark: e.target.value }))} placeholder="可选" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="typeSort">排序</Label>
                      <Input id="typeSort" type="number" value={Number(typeForm.sort || 0)} onChange={(e) => setTypeForm((s) => ({ ...s, sort: Number(e.target.value || 0) }))} />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button onClick={handleSubmitType} disabled={typeSave.isPending || typeUpdate.isPending}>
                      {editingType ? '保存' : '创建'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="按编码搜索" value={typeFilter.dictType} onChange={(e) => setTypeFilter((s) => ({ ...s, dictType: e.target.value }))} />
              <Input placeholder="按名称搜索" value={typeFilter.dictName} onChange={(e) => setTypeFilter((s) => ({ ...s, dictName: e.target.value }))} />
            </div>
            <div className="mt-2 border rounded-md overflow-hidden dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>编码</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead className="w-28">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeLoading && (
                    <TableRow>
                      <TableCell colSpan={4}>加载中...</TableCell>
                    </TableRow>
                  )}
                  {!typeLoading && typeList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">暂无数据</TableCell>
                    </TableRow>
                  )}
                  {typeList.map((t) => (
                    <TableRow key={t.id} className={selectedType?.id === t.id ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''} onClick={() => setSelectedType(t)}>
                      <TableCell className="font-medium">{t.dictName}</TableCell>
                      <TableCell className="text-gray-500">{t.dictType}</TableCell>
                      <TableCell>{t.sort ?? 0}</TableCell>
                      <TableCell className="space-x-1">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditType(t) }}>编辑</Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteType(t.id) }}>删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* 分页 */}
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600 dark:text-gray-300">
              <div>共 {typePager.total} 条</div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={typePager.goPrev} disabled={typePager.currentPage <= 1}>上一页</Button>
                <span>第 {typePager.currentPage} / {typePager.pageCount} 页</span>
                <Button variant="outline" size="sm" onClick={typePager.goNext} disabled={typePager.currentPage >= typePager.pageCount}>下一页</Button>
              </div>
            </div>
          </PageSection>
        </div>

        {/* 右栏：字典数据 */}
        <div className="lg:col-span-3 space-y-3">
          <PageSection
            title={selectedType ? `字典数据（${selectedType.dictName}）` : '字典数据'}
            actions={
              <Dialog open={dataDialogOpen} onOpenChange={setDataDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={!selectedType}>新增数据</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingData ? '编辑字典数据' : '新增字典数据'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="dictLabel">标签</Label>
                      <Input id="dictLabel" value={dataForm.dictLabel || ''} onChange={(e) => setDataForm((s) => ({ ...s, dictLabel: e.target.value }))} placeholder="如: 在线" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dictValue">值</Label>
                      <Input id="dictValue" value={dataForm.dictValue || ''} onChange={(e) => setDataForm((s) => ({ ...s, dictValue: e.target.value }))} placeholder="如: 1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataRemark">备注</Label>
                      <Input id="dataRemark" value={dataForm.remark || ''} onChange={(e) => setDataForm((s) => ({ ...s, remark: e.target.value }))} placeholder="可选" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataSort">排序</Label>
                      <Input id="dataSort" type="number" value={Number(dataForm.sort || 0)} onChange={(e) => setDataForm((s) => ({ ...s, sort: Number(e.target.value || 0) }))} />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button onClick={handleSubmitData} disabled={dataSave.isPending || dataUpdate.isPending}>
                      {editingData ? '保存' : '创建'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="按标签搜索" value={dataFilter.dictLabel} onChange={(e) => setDataFilter((s) => ({ ...s, dictLabel: e.target.value }))} />
              <Input placeholder="按值搜索" value={dataFilter.dictValue} onChange={(e) => setDataFilter((s) => ({ ...s, dictValue: e.target.value }))} />
            </div>
            <div className="mt-2 border rounded-md overflow-hidden dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标签</TableHead>
                    <TableHead>值</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead className="w-28">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataLoading && (
                    <TableRow>
                      <TableCell colSpan={5}>加载中...</TableCell>
                    </TableRow>
                  )}
                  {!dataLoading && dataList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">{selectedType ? '暂无数据' : '请选择左侧字典类型'}</TableCell>
                    </TableRow>
                  )}
                  {dataList.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.dictLabel}</TableCell>
                      <TableCell className="text-gray-500">{d.dictValue}</TableCell>
                      <TableCell>{d.sort ?? 0}</TableCell>
                      <TableCell className="truncate max-w-[24rem]">{d.remark}</TableCell>
                      <TableCell className="space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditData(d)}>编辑</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteData(d.id)}>删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* 分页 */}
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600 dark:text-gray-300">
              <div>共 {dataPager.total} 条</div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={dataPager.goPrev} disabled={dataPager.currentPage <= 1}>上一页</Button>
                <span>第 {dataPager.currentPage} / {dataPager.pageCount} 页</span>
                <Button variant="outline" size="sm" onClick={dataPager.goNext} disabled={dataPager.currentPage >= dataPager.pageCount}>下一页</Button>
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </div>
  )
}

