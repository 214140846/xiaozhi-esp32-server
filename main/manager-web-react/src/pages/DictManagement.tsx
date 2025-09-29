import React from 'react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import DictTypeDialog from '@/components/dict/DictTypeDialog'
import { usePagination } from '@/hooks/usePagination'
import { toast } from 'sonner'
import {
  useAdminDictTypePagePage1Query,
  useAdminDictTypeDeleteDelete2Mutation,
  useAdminDictDataPagePage2Query,
  useAdminDictDataSaveSave2Mutation,
  useAdminDictDataUpdateUpdate3Mutation,
  useAdminDictDataDeleteDelete3Mutation,
} from '@/hooks/admin'
import type { SysDictTypeVO, SysDictDataVO, SysDictDataDTO } from '@/types/openapi/admin'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

//

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const e = error as {
      response?: { data?: { msg?: string; message?: string }; statusText?: string }
      message?: string
    }
    if (e.response?.data?.msg) return e.response.data.msg
    if (e.response?.data?.message) return e.response.data.message
    if (e.message) return e.message
    if (e.response?.statusText) return e.response.statusText
  }
  return '请求失败'
}

// 字典数据表单校验
const DATA_REMARK_MAX_LEN = 200
const DATA_LABEL_MAX_LEN = 64
const DATA_VALUE_MAX_LEN = 64
const dataSchema = z.object({
  dictLabel: z
    .string()
    .trim()
    .min(1, '标签为必填')
    .max(DATA_LABEL_MAX_LEN, `标签不能超过${DATA_LABEL_MAX_LEN}字符`),
  dictValue: z
    .string()
    .trim()
    .min(1, '值为必填')
    .max(DATA_VALUE_MAX_LEN, `值不能超过${DATA_VALUE_MAX_LEN}字符`),
  remark: z
    .string()
    .max(DATA_REMARK_MAX_LEN, `备注不能超过${DATA_REMARK_MAX_LEN}字符`)
    .optional()
    .or(z.literal('')),
  sort: z.coerce.number().int('排序需为整数').min(0, '排序不能小于0').default(0),
})
type DataFormValuesInput = z.input<typeof dataSchema>

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
  const queryClient = useQueryClient()

  // 左侧：字典类型筛选与分页
  const [typeFilter, setTypeFilter] = useState({ dictType: '', dictName: '' })
  // 本地输入态（避免输入过程中即触发查询）
  const [typeInput, setTypeInput] = useState({ dictType: '', dictName: '' })
  const [typeComposing, setTypeComposing] = useState(false)
  const typePager = usePagination(10)
  const handleTypeSearch = useCallback(() => {
    // 提交搜索条件并回到第一页
    typePager.goFirst()
    setTypeFilter({
      dictType: (typeInput.dictType || '').trim(),
      dictName: (typeInput.dictName || '').trim(),
    })
  }, [typeInput, typePager])

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
  }, [typeResp?.data?.total, typePager])

  const typeList = useMemo(() => typeResp?.data?.list || [], [typeResp?.data?.list])

  // 当前选中字典类型
  const [selectedType, setSelectedType] = useState<SysDictTypeVO | undefined>(undefined)
  useEffect(() => {
    // 列表为空时清空选择
    if (typeList.length === 0) {
      if (selectedType) setSelectedType(undefined)
      return
    }
    // 首次进入或无选择时，默认选中首项
    if (!selectedType) {
      setSelectedType(typeList[0])
      return
    }
    // 列表有变更时，用相同 id 的最新对象替换，确保名称等字段同步
    const latest = typeList.find((t) => t.id === selectedType.id)
    if (!latest) {
      // 例如被删除，则回落到首项
      setSelectedType(typeList[0])
    } else if (latest !== selectedType) {
      setSelectedType(latest)
    }
  }, [typeList, selectedType])

  // 右侧：字典数据筛选与分页
  const [dataFilter, setDataFilter] = useState({ dictLabel: '', dictValue: '' })
  // 本地输入态与组合输入状态
  const [dataInput, setDataInput] = useState({ dictLabel: '', dictValue: '' })
  const [dataComposing, setDataComposing] = useState(false)
  const dataPager = usePagination(10)
  const handleDataSearch = useCallback(() => {
    dataPager.goFirst()
    setDataFilter({
      dictLabel: (dataInput.dictLabel || '').trim(),
      dictValue: (dataInput.dictValue || '').trim(),
    })
  }, [dataInput, dataPager])

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
  }, [dataResp?.data?.total, dataPager])

  const dataList = dataResp?.data?.list || []

  // 新增/编辑：字典类型
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<SysDictTypeVO | undefined>(undefined)

  useEffect(() => {
    if (!typeDialogOpen) {
      setEditingType(undefined)
    }
  }, [typeDialogOpen])

  const typeDelete = useAdminDictTypeDeleteDelete2Mutation({
    onSuccess: () => {
      toast.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['AdminDictTypePage.Page1'] })
      refetchTypes()
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || '删除失败'),
  })

  const handleEditType = (t: SysDictTypeVO) => {
    setEditingType(t)
    setTypeDialogOpen(true)
  }

  // 字典类型的创建/编辑提交逻辑挪到 DictTypeDialog 内部，通过失焦关闭后刷新

  // 新增/编辑：字典数据
  const [dataDialogOpen, setDataDialogOpen] = useState(false)
  const [editingData, setEditingData] = useState<SysDictDataVO | undefined>(undefined)
  // 表单（字典数据）
  const {
    register: dataRegister,
    handleSubmit: dataHandleSubmit,
    reset: dataReset,
    setFocus,
    watch: dataWatch,
    formState: { errors: dataErrors, isSubmitting: dataIsSubmitting },
  } = useForm<DataFormValuesInput>({
    resolver: zodResolver(dataSchema),
    defaultValues: { dictLabel: '', dictValue: '', remark: '', sort: 0 },
    mode: 'onChange',
  })
  const dictLabelVal = dataWatch('dictLabel')
  const dictValueVal = dataWatch('dictValue')
  useEffect(() => {
    if (!dataDialogOpen) return
    if (editingData) {
      dataReset({
        dictLabel: editingData.dictLabel || '',
        dictValue: editingData.dictValue || '',
        remark: editingData.remark || '',
        sort: editingData.sort ?? 0,
      })
    } else {
      dataReset({ dictLabel: '', dictValue: '', remark: '', sort: 0 })
    }
  }, [dataDialogOpen, editingData, dataReset])

  const dataSave = useAdminDictDataSaveSave2Mutation({
    onSuccess: () => {
      toast.success('保存成功')
      setDataDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['AdminDictDataPage.Page2'] })
      refetchData()
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || '保存失败'),
  })
  const dataUpdate = useAdminDictDataUpdateUpdate3Mutation({
    onSuccess: () => {
      toast.success('修改成功')
      setDataDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['AdminDictDataPage.Page2'] })
      refetchData()
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || '修改失败'),
  })
  const dataDelete = useAdminDictDataDeleteDelete3Mutation({
    onSuccess: () => {
      toast.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['AdminDictDataPage.Page2'] })
      refetchData()
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e) || '删除失败'),
  })

  const handleEditData = (d: SysDictDataVO) => {
    setEditingData(d)
    setDataDialogOpen(true)
  }

  const handleSubmitData = async (values: DataFormValuesInput) => {
    const parsed = dataSchema.parse(values)
    const payload: SysDictDataDTO = {
      id: editingData?.id,
      dictTypeId: selectedType?.id,
      dictLabel: parsed.dictLabel.trim(),
      dictValue: parsed.dictValue.trim(),
      remark: (parsed.remark || '').trim(),
      sort: parsed.sort,
    }
    if (!payload.dictTypeId) {
      toast.error('请选择字典类型')
      return
    }
    if (payload.id) {
      await dataUpdate.mutateAsync({ data: payload })
    } else {
      await dataSave.mutateAsync({ data: payload })
    }
  }

  const handleInvalidData = useCallback((errs: FieldErrors<DataFormValuesInput>) => {
    if (errs.dictValue) {
      toast.error(errs.dictValue.message || '值为必填')
      setFocus('dictValue')
      return
    }
    if (errs.dictLabel) {
      toast.error(errs.dictLabel.message || '标签为必填')
      setFocus('dictLabel')
      return
    }
    toast.error('请完善必填项')
  }, [setFocus])

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

      <Alert>
        <Info className="mt-0.5" />
        <AlertTitle>使用说明</AlertTitle>
        <AlertDescription>
          <p>维护通用枚举/选项数据（如设备状态、地区等），供其他模块引用。</p>
          <p>左侧管理字典类型（编码+名称）；右侧维护该类型下的数据项（标签/值/排序/备注）。</p>
          <p>使用流程：先选中左侧类型，再在右侧新增/编辑/删除数据；字典编码创建后尽量保持稳定。</p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 左栏：字典类型 */}
        <div className="lg:col-span-2 space-y-3">
          <PageSection
            title="字典类型"
            actions={
              <>
                <Button size="sm" onClick={() => setTypeDialogOpen(true)}>新增类型</Button>
                <DictTypeDialog open={typeDialogOpen} onOpenChange={(v) => {
                  setTypeDialogOpen(v)
                  if (!v) {
                    // 关闭后刷新左侧列表
                    queryClient.invalidateQueries({ queryKey: ['AdminDictTypePage.Page1'] })
                    refetchTypes()
                  }
                }} editingType={editingType} />
              </>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="按编码搜索"
                value={typeInput.dictType}
                onChange={(e) => setTypeInput((s) => ({ ...s, dictType: e.target.value }))}
                onCompositionStart={() => setTypeComposing(true)}
                onCompositionEnd={() => setTypeComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !typeComposing) {
                    handleTypeSearch()
                  }
                }}
              />
              <Input
                placeholder="按名称搜索"
                value={typeInput.dictName}
                onChange={(e) => setTypeInput((s) => ({ ...s, dictName: e.target.value }))}
                onCompositionStart={() => setTypeComposing(true)}
                onCompositionEnd={() => setTypeComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !typeComposing) {
                    handleTypeSearch()
                  }
                }}
              />
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
              <Dialog open={dataDialogOpen} onOpenChange={(v) => { setDataDialogOpen(v); if (!v) setEditingData(undefined) }}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={!selectedType}>新增数据</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingData ? '编辑字典数据' : '新增字典数据'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={dataHandleSubmit(handleSubmitData, handleInvalidData)} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="dictLabel">标签</Label>
                      <Input id="dictLabel" placeholder="如: 在线" maxLength={DATA_LABEL_MAX_LEN} {...dataRegister('dictLabel')} />
                      <div className="flex items-center justify-end text-xs mt-1">
                        <span className="text-gray-500">{(dictLabelVal || '').length}/{DATA_LABEL_MAX_LEN}</span>
                      </div>
                      {dataErrors.dictLabel && (
                        <div className="text-xs text-red-500 mt-1">{dataErrors.dictLabel.message}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dictValue">值</Label>
                      <Input id="dictValue" placeholder="如: 1" maxLength={DATA_VALUE_MAX_LEN} {...dataRegister('dictValue')} />
                      <div className="flex items-center justify-end text-xs mt-1">
                        <span className="text-gray-500">{(dictValueVal || '').length}/{DATA_VALUE_MAX_LEN}</span>
                      </div>
                      {dataErrors.dictValue && (
                        <div className="text-xs text-red-500 mt-1">{dataErrors.dictValue.message}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataRemark">备注</Label>
                      <Input id="dataRemark" placeholder="可选" {...dataRegister('remark')} />
                      {dataErrors.remark && (
                        <div className="text-xs text-red-500 mt-1">{dataErrors.remark.message}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataSort">排序</Label>
                      <Input id="dataSort" type="number" min={0} step={1} {...dataRegister('sort', { valueAsNumber: true })} />
                      {dataErrors.sort && (
                        <div className="text-xs text-red-500 mt-1">{dataErrors.sort.message}</div>
                      )}
                    </div>
                    <DialogFooter className="gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">取消</Button>
                      </DialogClose>
                      <Button type="submit" disabled={dataSave.isPending || dataUpdate.isPending || dataIsSubmitting}>
                        {editingData ? '保存' : '创建'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="按标签搜索"
                value={dataInput.dictLabel}
                onChange={(e) => setDataInput((s) => ({ ...s, dictLabel: e.target.value }))}
                onCompositionStart={() => setDataComposing(true)}
                onCompositionEnd={() => setDataComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !dataComposing) {
                    handleDataSearch()
                  }
                }}
              />
              <Input
                placeholder="按值搜索"
                value={dataInput.dictValue}
                onChange={(e) => setDataInput((s) => ({ ...s, dictValue: e.target.value }))}
                onCompositionStart={() => setDataComposing(true)}
                onCompositionEnd={() => setDataComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !dataComposing) {
                    handleDataSearch()
                  }
                }}
              />
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
