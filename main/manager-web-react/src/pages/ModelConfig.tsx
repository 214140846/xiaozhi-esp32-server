import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Plus, Trash2 } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePagination } from '@/hooks/usePagination'
import {
  useModelsListGetModelConfigListQuery,
  useModelsEnableEnableModelConfigMutation,
  useModelsDefaultSetDefaultModelMutation,
  useModelsDeleteModelConfigMutation,
  useModelsAddModelConfigMutation,
  useModelsEditModelConfigMutation,
  useModelsGetModelConfigQuery,
} from '@/hooks/models'

const modelTypeOptions = [
  { label: 'VAD', value: 'vad' },
  { label: 'ASR', value: 'asr' },
  { label: 'LLM', value: 'llm' },
  { label: 'VLLM', value: 'vllm' },
  { label: 'Memory', value: 'memory' },
  { label: 'Intent', value: 'intent' },
  { label: 'TTS', value: 'tts' },
]

// 表单校验：使用 zod + hookform
const modelFormSchema = z.object({
  modelType: z.string().min(1, '请选择模型类型'),
  // 供应商编码不在 UI 展示，改为可选
  providerCode: z.string().optional().default(''),
  modelName: z.string().min(1, '请输入模型名称'),
  modelCode: z.string().min(1, '请输入模型标识'),
  isEnabled: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sort: z.coerce.number().int().min(0).default(0),
  docLink: z.string().url('链接格式不正确').optional().or(z.literal('')),
  remark: z.string().optional().or(z.literal('')),
  // 配置项以键值对形式编辑
  configEntries: z.array(z.object({ key: z.string().min(1, '键不能为空'), value: z.string().default('') })).default([]),
})

type ModelFormValues = z.infer<typeof modelFormSchema>

interface EditDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editId?: string | number | null
  initialType?: string
  onSuccess?: () => void
}

function ModelEditDialog({ open, onOpenChange, editId, initialType, onSuccess }: EditDialogProps) {
  const isEdit = Boolean(editId)

  // 读取详情用于编辑
  const { data: detail, isLoading: loadingDetail } = useModelsGetModelConfigQuery(
    { id: String(editId ?? '') },
    undefined,
    { enabled: isEdit }
  )

  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      modelType: (initialType || 'llm').toLowerCase(),
      providerCode: '',
      modelName: '',
      modelCode: '',
      isEnabled: true,
      isDefault: false,
      sort: 0,
      docLink: '',
      remark: '',
      configEntries: [],
    },
  })

  // 配置项表单数组
  const { fields: cfgFields, append: cfgAppend, remove: cfgRemove } = useFieldArray({
    control: form.control,
    name: 'configEntries',
  })

  const { mutateAsync: addModel, isPending: adding } = useModelsAddModelConfigMutation()
  const { mutateAsync: editModel, isPending: editing } = useModelsEditModelConfigMutation()

  // 详情返回后预填（编辑时），新建时同步当前页签类型
  React.useEffect(() => {
    if (!open) return
    if (isEdit && detail?.data) {
      const d = detail.data
      const entries = (() => {
        try {
          const obj = (d.configJson as any) || {}
          if (obj && typeof obj === 'object') {
            return Object.entries(obj).map(([k, v]) => ({ key: String(k), value: typeof v === 'string' ? v : JSON.stringify(v) }))
          }
          return []
        } catch {
          return []
        }
      })()
      form.reset({
        // 预填模型类型，统一成小写以匹配下拉选项值
        modelType: (d.modelType || initialType || 'llm').toLowerCase(),
        providerCode: (d as any).providerCode || '',
        modelName: d.modelName || '',
        modelCode: d.modelCode || '',
        isEnabled: (d.isEnabled ?? 1) === 1,
        isDefault: (d.isDefault ?? 0) === 1,
        sort: d.sort ?? 0,
        docLink: d.docLink || '',
        remark: d.remark || '',
        configEntries: entries,
      })
    } else if (!isEdit) {
      form.reset({
        modelType: (initialType || 'llm').toLowerCase(),
        providerCode: '',
        modelName: '',
        modelCode: '',
        isEnabled: true,
        isDefault: false,
        sort: 0,
        docLink: '',
        remark: '',
        configEntries: [],
      })
    }
  }, [open, isEdit, detail?.data, initialType])

  const onSubmit = async (values: ModelFormValues) => {
    // 将键值对还原为对象，支持布尔/数字/JSON自动解析
    const configObj: Record<string, unknown> = {}
    const seenKeys = new Set<string>()
    for (const { key, value } of values.configEntries || []) {
      const k = (key || '').trim()
      if (!k) continue
      if (seenKeys.has(k)) {
        toast.error(`配置项键重复：${k}`)
        return
      }
      seenKeys.add(k)
      const v = (value ?? '').trim()
      let parsed: unknown = v
      if (v === 'true' || v === 'false') parsed = v === 'true'
      else if (/^-?\d+(?:\.\d+)?$/.test(v)) parsed = Number(v)
      else if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
        try { parsed = JSON.parse(v) } catch { /* 保持字符串 */ }
      }
      configObj[k] = parsed
    }

    const body = {
      modelCode: values.modelCode,
      modelName: values.modelName,
      isDefault: values.isDefault ? 1 : 0,
      isEnabled: values.isEnabled ? 1 : 0,
      // 直接传入解析后的对象，后端以 JSON 存储
      configJson: Object.keys(configObj).length > 0 ? (configObj as any) : undefined,
      docLink: values.docLink || undefined,
      remark: values.remark || undefined,
      sort: values.sort,
    }

    try {
      if (isEdit) {
        await editModel({
          params: {
            modelType: values.modelType,
            id: String(editId),
            ...(values.providerCode ? { provideCode: values.providerCode } : {}),
          },
          data: body,
        })
        toast.success('模型配置已更新')
      } else {
        await addModel({
          params: {
            modelType: values.modelType,
            ...(values.providerCode ? { provideCode: values.providerCode } : {}),
          },
          data: body,
        })
        toast.success('模型配置已创建')
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.message || '操作失败')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑模型配置' : '新增模型配置'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="space-y-2">
              <Label htmlFor="modelType">模型类型</Label>
              <Select
                value={form.watch('modelType')}
                onValueChange={(v) => form.setValue('modelType', v)}
              >
                <SelectTrigger id="modelType">
                  <SelectValue placeholder="选择模型类型" />
                </SelectTrigger>
                <SelectContent>
                  {modelTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.modelType && (
                <p className="text-sm text-red-500">{form.formState.errors.modelType.message}</p>
              )}
            </div>

            {/* 供应商编码按需求不展示 */}

            <div className="space-y-2">
              <Label htmlFor="modelName">模型名称</Label>
              <Input id="modelName" {...form.register('modelName')} placeholder="展示名称" />
              {form.formState.errors.modelName && (
                <p className="text-sm text-red-500">{form.formState.errors.modelName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelCode">模型标识</Label>
              <Input id="modelCode" {...form.register('modelCode')} placeholder="服务端识别用" />
              {form.formState.errors.modelCode && (
                <p className="text-sm text-red-500">{form.formState.errors.modelCode.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.watch('isEnabled')}
                onCheckedChange={(c) => form.setValue('isEnabled', c)}
              />
              <Label>启用</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.watch('isDefault')}
                onCheckedChange={(c) => form.setValue('isDefault', c)}
              />
              <Label>默认</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">排序值</Label>
              <Input id="sort" type="number" {...form.register('sort')} />
              {form.formState.errors.sort && (
                <p className="text-sm text-red-500">{form.formState.errors.sort.message as any}</p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="docLink">文档链接</Label>
              <Input id="docLink" {...form.register('docLink')} placeholder="https://..." />
              {form.formState.errors.docLink && (
                <p className="text-sm text-red-500">{form.formState.errors.docLink.message as any}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <Label htmlFor="remark">备注</Label>
            <Textarea id="remark" rows={3} {...form.register('remark')} placeholder="可选" />
          </div>

          <div className="space-y-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <Label>配置项</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => cfgAppend({ key: '', value: '' })}>
                <Plus className="h-4 w-4 mr-1" /> 添加配置项
              </Button>
            </div>
            <div className="space-y-2">
              {cfgFields.length === 0 && (
                <p className="text-xs text-muted-foreground">当前无配置项，点击“添加配置项”开始编辑</p>
              )}
              {cfgFields.map((f, idx) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Input placeholder="键（如 apiKey）" {...form.register(`configEntries.${idx}.key` as const)} />
                  </div>
                  <div className="col-span-7">
                    <Input placeholder="值（支持字符串/数字/布尔/JSON）" {...form.register(`configEntries.${idx}.value` as const)} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => cfgRemove(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">将按键值对组装为 JSON 发送。复杂对象请以合法 JSON 输入。</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={adding || editing || loadingDetail}>
              {isEdit ? (editing ? '保存中...' : '保存') : adding ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ModelConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [editOpen, setEditOpen] = React.useState(false)
  const [editId, setEditId] = React.useState<string | number | null>(null)

  const type = searchParams.get('type') || 'llm'
  const q = searchParams.get('q') || ''

  const { currentPage, pageSize, setPageSize, pageSizeOptions, goFirst, goPrev, goNext, goToPage, visiblePages, pageCount, setTotal } = usePagination(10)

  const { data, isLoading, refetch } = useModelsListGetModelConfigListQuery(
    {},
    { modelType: type, modelName: q, page: currentPage, limit: pageSize }
  )

  React.useEffect(() => {
    if (data?.data?.total != null) setTotal(data.data.total)
  }, [data, setTotal])

  const { mutateAsync: toggleEnabled } = useModelsEnableEnableModelConfigMutation()
  const { mutateAsync: setDefault } = useModelsDefaultSetDefaultModelMutation()
  const { mutateAsync: deleteModel, isPending: deleting } = useModelsDeleteModelConfigMutation()

  const handleSearch = () => {
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev)
      n.set('type', type)
      if (q) n.set('q', q)
      else n.delete('q')
      return n
    })
    refetch()
  }

  const handleToggle = async (id: string | number, enabled: boolean) => {
    await toggleEnabled({ params: { id: String(id), status: enabled ? 1 : 0 } })
    toast.success(enabled ? '已启用' : '已停用')
    refetch()
  }

  const handleSetDefault = async (id: string | number) => {
    await setDefault({ params: { id: String(id) } })
    toast.success('已设为默认')
    refetch()
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('确认删除该模型配置？')) return
    await deleteModel({ params: { id: String(id) } })
    toast.success('已删除')
    refetch()
  }

  const list = data?.data?.list || []

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">模型配置</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEditId(null); setEditOpen(true) }}>新增配置</Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <Alert>
          <Info className="mt-0.5" />
          <AlertTitle>使用说明</AlertTitle>
          <AlertDescription>
            <p>用于集中管理各类 AI 模型（VAD/ASR/LLM/VLLM/Intent/Memory/TTS）的可用配置，供智能体/设备引用。</p>
            <p>通过上方类型切换查看；点击“新增配置”创建；表格中可设为默认、启用/停用、编辑、删除。</p>
            <p>配置 JSON 用于补充该模型所需的密钥、地址等字段，系统按原样保存为 JSON；留空则不更新。</p>
            <p>建议同一类型仅设置 1 个默认模型；敏感信息可考虑放在“参数管理”中集中维护。</p>
          </AlertDescription>
        </Alert>

        {/* 类型标签（Tabs-like） */}
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-1">
            {modelTypeOptions.map((m) => {
              const active = m.value === type
              return (
                <Button
                  key={m.value}
                  size="sm"
                  variant={active ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('type', m.value); return n })}
                >
                  {m.label}
                </Button>
              )
            })}
          </div>
        </ScrollArea>

        {/* 搜索 */}
        <div className="flex items-stretch gap-2">
          <Input
            placeholder="按名称搜索"
            defaultValue={q}
            onChange={(e) => setSearchParams((prev) => { const n = new URLSearchParams(prev); if (e.target.value) n.set('q', e.target.value); else n.delete('q'); return n })}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
          />
          <Button variant="outline" onClick={handleSearch}>搜索</Button>
        </div>

        <Separator />

        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>默认</TableHead>
                <TableHead>启用</TableHead>
                <TableHead className="w-56">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {list.map((m) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="border-b border-border"
                  >
                    <TableCell className="text-muted-foreground">{m.id}</TableCell>
                    <TableCell className="font-medium">{m.modelName}</TableCell>
                    <TableCell>{m.modelType}</TableCell>
                    <TableCell>
                      {(m.isDefault ?? 0) === 1 ? (
                        <span className="text-green-600 dark:text-green-400">是</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleSetDefault(String(m.id!))}>设为默认</Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={(m.isEnabled ?? 0) === 1}
                        onCheckedChange={(c) => handleToggle(String(m.id!), c)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditId(String(m.id!)); setEditOpen(true) }}>编辑</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(String(m.id!))} disabled={deleting}>删除</Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                {list.length === 0 && !isLoading && (
                  <tr>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">暂无数据</TableCell>
                  </tr>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每页</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v) as any)}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Button variant="outline" size="sm" onClick={goFirst}>首页</Button>
            <Button variant="outline" size="sm" onClick={goPrev}>上一页</Button>
            {visiblePages.map((p) => (
              <Button key={p} variant="outline" size="sm" onClick={() => goToPage(p)} className="w-8">{p}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={goNext}>下一页</Button>
          </div>
        </div>
      </div>

      <ModelEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editId={editId}
        initialType={type}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export default ModelConfigPage
