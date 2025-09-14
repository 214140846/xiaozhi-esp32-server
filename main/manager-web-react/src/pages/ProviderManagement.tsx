import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

import { usePagination } from '@/hooks/usePagination'
import {
  useModelsProviderGetListPageQuery,
  useModelsProviderAddMutation,
  useModelsProviderEditMutation,
  useModelsProviderDeleteDeleteMutation,
} from '@/hooks/models'
import type { ModelProviderDTO } from '@/types/openapi/models'

const modelTypeOptions = [
  { label: 'VAD', value: 'VAD' },
  { label: 'ASR', value: 'ASR' },
  { label: 'LLM', value: 'LLM' },
  { label: 'VLLM', value: 'VLLM' },
  { label: 'Memory', value: 'Memory' },
  { label: 'Intent', value: 'Intent' },
  { label: 'TTS', value: 'TTS' },
  { label: 'Plugin', value: 'Plugin' },
]

type FieldItem = {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'dict' | 'array'
  default?: string
  selected?: boolean
  editing?: boolean
}

const providerSchema = z.object({
  id: z.string().optional(),
  modelType: z.string().min(1, '请选择类别'),
  providerCode: z.string().min(1, '请输入供应器编码'),
  name: z.string().min(1, '请输入供应器名称'),
  sort: z.coerce.number().int().min(0).default(0),
})

type ProviderFormValues = z.infer<typeof providerSchema>

interface ProviderEditDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editItem?: ModelProviderDTO | null
  onSuccess?: () => void
}

function ProviderEditDialog({ open, onOpenChange, editItem, onSuccess }: ProviderEditDialogProps) {
  const isEdit = Boolean(editItem?.id)
  const [fields, setFields] = React.useState<FieldItem[]>([])
  const [allSelected, setAllSelected] = React.useState(false)

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: { modelType: '', providerCode: '', name: '', sort: 0 },
  })

  React.useEffect(() => {
    if (!open) return
    if (isEdit && editItem) {
      form.reset({
        id: String(editItem.id),
        modelType: editItem.modelType,
        providerCode: editItem.providerCode,
        name: editItem.name,
        sort: editItem.sort ?? 0,
      })
      try {
        const arr = JSON.parse(editItem.fields || '[]') as FieldItem[]
        setFields(arr.map((f) => ({ ...f, selected: false, editing: false })))
      } catch {
        setFields([])
      }
    } else {
      form.reset({ modelType: '', providerCode: '', name: '', sort: 0 })
      setFields([])
    }
    setAllSelected(false)
  }, [open, isEdit, editItem])

  const { mutateAsync: createProvider, isPending: creating } = useModelsProviderAddMutation()
  const { mutateAsync: updateProvider, isPending: updating } = useModelsProviderEditMutation()

  const addField = () => {
    if (fields.some((f) => f.editing && (!f.key || !f.label || !f.type))) {
      toast.warning('请先完成当前字段的编辑')
      return
    }
    setFields((prev) => [{ key: '', label: '', type: 'string', default: '', selected: false, editing: true }, ...prev])
  }
  const toggleSelectAll = () => {
    const next = !allSelected
    setAllSelected(next)
    setFields((prev) => prev.map((f) => ({ ...f, selected: next })))
  }
  const removeSelected = () => {
    const count = fields.filter((f) => f.selected).length
    if (count === 0) return toast.warning('请先选择要删除的字段')
    setFields((prev) => prev.filter((f) => !f.selected))
    setAllSelected(false)
    toast.success(`已删除 ${count} 个字段`)
  }

  const onSubmit = async (values: ProviderFormValues) => {
    if (fields.some((f) => f.editing)) {
      toast.warning('请先完成字段编辑')
      return
    }
    const payload: ModelProviderDTO = {
      id: values.id || undefined,
      modelType: values.modelType,
      providerCode: values.providerCode,
      name: values.name,
      fields: JSON.stringify(fields.map(({ selected, editing, ...rest }) => rest)),
      sort: values.sort,
    } as any
    try {
      if (isEdit) {
        await updateProvider({ data: payload })
        toast.success('已更新供应器')
      } else {
        await createProvider({ data: payload })
        toast.success('已创建供应器')
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.message || '操作失败')
    }
  }

  const updateField = (idx: number, patch: Partial<FieldItem>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑供应器' : '新增供应器'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="modelType">类别</Label>
              <Select value={form.watch('modelType')} onValueChange={(v) => form.setValue('modelType', v)}>
                <SelectTrigger id="modelType"><SelectValue placeholder="选择类别" /></SelectTrigger>
                <SelectContent>
                  {modelTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.modelType && (<p className="text-xs text-destructive">{form.formState.errors.modelType.message}</p>)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerCode">编码</Label>
              <Input id="providerCode" placeholder="供应器编码" {...form.register('providerCode')} />
              {form.formState.errors.providerCode && (<p className="text-xs text-destructive">{form.formState.errors.providerCode.message}</p>)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input id="name" placeholder="供应器名称" {...form.register('name')} />
              {form.formState.errors.name && (<p className="text-xs text-destructive">{form.formState.errors.name.message}</p>)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">排序</Label>
              <Input id="sort" type="number" {...form.register('sort')} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-base font-medium">字段配置</div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={addField} disabled={fields.some((f) => f.editing && (!f.key || !f.label || !f.type))}>添加</Button>
              <Button type="button" size="sm" variant="secondary" onClick={toggleSelectAll}>{allSelected ? '取消全选' : '全选'}</Button>
              <Button type="button" size="sm" variant="destructive" onClick={removeSelected}>批量删除</Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>字段 Key</TableHead>
                  <TableHead>字段标签</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>默认值</TableHead>
                  <TableHead className="w-40">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((f, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Checkbox checked={!!f.selected} onCheckedChange={(c) => updateField(idx, { selected: Boolean(c) })} />
                    </TableCell>
                    <TableCell>
                      {f.editing ? (
                        <Input value={f.key} onChange={(e) => updateField(idx, { key: e.target.value })} placeholder="字段 key" />
                      ) : (
                        <span>{f.key}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {f.editing ? (
                        <Input value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} placeholder="字段标签" />
                      ) : (
                        <span>{f.label}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {f.editing ? (
                        <Select value={f.type} onValueChange={(v) => updateField(idx, { type: v as FieldItem['type'] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">字符串</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                            <SelectItem value="boolean">布尔值</SelectItem>
                            <SelectItem value="dict">字典</SelectItem>
                            <SelectItem value="array">分号分割的列表</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>{({ string: '字符串', number: '数字', boolean: '布尔值', dict: '字典', array: '分号分割的列表' } as any)[f.type]}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {f.editing ? (
                        <Input value={f.default || ''} onChange={(e) => updateField(idx, { default: e.target.value })} placeholder="可选" />
                      ) : (
                        <span className="text-muted-foreground">{f.default || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {f.editing ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" type="button" onClick={() => updateField(idx, { editing: false })} disabled={!f.key || !f.label}>完成</Button>
                          <Button size="sm" variant="destructive" type="button" onClick={() => setFields((prev) => prev.filter((_, i) => i !== idx))}>删除</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" type="button" onClick={() => updateField(idx, { editing: true })}>编辑</Button>
                          <Button size="sm" variant="destructive" type="button" onClick={() => setFields((prev) => prev.filter((_, i) => i !== idx))}>删除</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">暂无字段</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" disabled={creating || updating}>{isEdit ? (updating ? '保存中...' : '保存') : creating ? '创建中...' : '创建'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProviderManagementPage() {
  const [searchName, setSearchName] = React.useState('')
  // Radix Select.Item 不允许空字符串作为 value，这里用占位值表示“全部”
  const ALL = '__ALL__'
  const [searchType, setSearchType] = React.useState<string>(ALL)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [editOpen, setEditOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ModelProviderDTO | null>(null)

  const pager = usePagination(10)

  const { data, isLoading, refetch } = useModelsProviderGetListPageQuery(
    {},
    // Controller binds root-level query params name/modelType
    { name: searchName || undefined, modelType: searchType !== ALL ? searchType : undefined, page: pager.currentPage, limit: pager.pageSize } as any
  )

  React.useEffect(() => {
    if (data?.data?.total != null) pager.setTotal(data.data.total)
  }, [data?.data?.total])

  const list: (ModelProviderDTO & { fieldsMeta: FieldItem[] })[] = React.useMemo(() => {
    const raw = data?.data?.list || []
    return raw.map((it) => {
      let meta: FieldItem[] = []
      try { meta = JSON.parse(it.fields || '[]') } catch { meta = [] }
      return { ...it, fieldsMeta: meta }
    })
  }, [data?.data?.list])

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)))
  }
  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(Array.from(new Set([...selectedIds, ...list.map((i) => String(i.id))])))
    else setSelectedIds((prev) => prev.filter((x) => !list.some((i) => String(i.id) === x)))
  }

  const { mutateAsync: deleteProviders, isPending: deleting } = useModelsProviderDeleteDeleteMutation()
  const doDelete = async (ids: string[]) => {
    if (ids.length === 0) return
    if (!confirm(`确定删除选中的 ${ids.length} 项？`)) return
    try {
      await deleteProviders({ data: ids })
      toast.success('删除成功')
      setSelectedIds((prev) => prev.filter((x) => !ids.includes(x)))
      refetch()
    } catch (e: any) {
      toast.error(e?.message || '删除失败')
    }
  }

  const sensitiveKeys = ['api_key', 'personal_access_token', 'access_token', 'token', 'secret', 'access_key_secret', 'secret_key']
  const isSensitive = (k?: string) => !!k && sensitiveKeys.some((s) => k.toLowerCase().includes(s))

  const isAllChecked = list.length > 0 && list.every((i) => selectedIds.includes(String(i.id)))

  const handleSearch = () => {
    pager.goToPage(1)
    refetch()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">字段管理</h1>
          <Button onClick={() => { setEditing(null); setEditOpen(true) }}>新增供应器</Button>
        </div>

        <Alert>
          <Info className="mt-0.5" />
          <AlertTitle>使用说明</AlertTitle>
          <AlertDescription>
            <p>用于定义各模型类别下的“供应器”及其字段模板（如 API Key、Base URL、模型名等），以规范配置。</p>
            <p>点击“新增供应器”，选择类别并配置字段；字段支持类型选择、默认值设置与批量删除。</p>
            <p>字段类型包含：字符串、数字、布尔值、字典、分号分割的列表；包含 key/secret/token 等的字段会被标记为敏感。</p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-stretch gap-2 flex-1">
            <Input placeholder="按名称搜索" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }} />
            <Select value={searchType} onValueChange={(v) => setSearchType(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="全部类别" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>全部</SelectItem>
                {modelTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>搜索</Button>
          </div>
          <Button variant="destructive" disabled={selectedIds.length === 0 || deleting} onClick={() => doDelete(selectedIds)}>批量删除</Button>
        </div>

        <Separator />

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox checked={isAllChecked} onCheckedChange={(c) => toggleAll(Boolean(c))} />
                </TableHead>
                <TableHead className="w-12">ID</TableHead>
                <TableHead className="w-24">类别</TableHead>
                <TableHead className="w-40">供应器编码</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>字段配置</TableHead>
                <TableHead className="w-16">排序</TableHead>
                <TableHead className="w-44">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {list.map((item) => {
                  const id = String(item.id)
                  return (
                    <motion.tr key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="border-b border-border">
                      <TableCell>
                        <Checkbox checked={selectedIds.includes(id)} onCheckedChange={(c) => toggleSelect(id, Boolean(c))} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{id}</TableCell>
                      <TableCell>{item.modelType}</TableCell>
                      <TableCell className="text-muted-foreground">{item.providerCode}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {item.fieldsMeta.length === 0 && <span className="text-muted-foreground">-</span>}
                          {item.fieldsMeta.slice(0, 4).map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs">
                              <span className="font-medium">{f.label}</span>
                              <span className="text-muted-foreground">{f.type}</span>
                              {isSensitive(f.key) && <span className="text-amber-600">敏感</span>}
                            </span>
                          ))}
                          {item.fieldsMeta.length > 4 && <span className="text-muted-foreground">等 {item.fieldsMeta.length} 个字段</span>}
                        </div>
                      </TableCell>
                      <TableCell>{item.sort ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditing(item); setEditOpen(true) }}>编辑</Button>
                          <Button size="sm" variant="destructive" disabled={deleting} onClick={() => doDelete([id])}>删除</Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })}
                {list.length === 0 && !isLoading && (
                  <tr>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                  </tr>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每页</span>
            <Select value={String(pager.pageSize)} onValueChange={(v) => pager.setPageSize(Number(v) as any)}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {pager.pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Button variant="outline" size="sm" onClick={pager.goFirst}>首页</Button>
            <Button variant="outline" size="sm" onClick={pager.goPrev}>上一页</Button>
            {pager.visiblePages.map((p) => (
              <Button key={p} variant="outline" size="sm" onClick={() => pager.goToPage(p)} className="w-8">{p}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={pager.goNext}>下一页</Button>
          </div>
        </div>

        <ProviderEditDialog open={editOpen} onOpenChange={setEditOpen} editItem={editing} onSuccess={() => refetch()} />
      </div>
    </div>
  )
}

export default ProviderManagementPage
