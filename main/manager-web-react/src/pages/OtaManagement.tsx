import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePagination } from '@/hooks/usePagination'
import { toast } from 'sonner'
import { useFirmwareTypes } from '@/hooks/ota/useFirmwareTypes'
import { useOtaMagPageQuery, useOtaMagSaveMutation, useOtaMagUpdateMutation, useOtaMagDeleteMutation, useOtaMagUploadMutation } from '@/hooks/otaMag/generatedHooks'
import type { OtaEntity } from '@/types/openapi/otaMag'

interface EditDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editItem?: OtaEntity | null
  onSuccess?: () => void
}

function bytesToSize(bytes?: number) {
  if (!bytes) return '—'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

function OtaEditDialog({ open, onOpenChange, editItem, onSuccess }: EditDialogProps) {
  const isEdit = Boolean(editItem?.id)
  const { firmwareTypes } = useFirmwareTypes()
  const { mutateAsync: save, isPending: saving } = useOtaMagSaveMutation()
  const { mutateAsync: update, isPending: updating } = useOtaMagUpdateMutation()
  const { mutateAsync: upload, isPending: uploading } = useOtaMagUploadMutation()

  const [form, setForm] = React.useState<{
    firmwareName: string
    type: string
    version: string
    remark: string
    firmwarePath: string
    size?: number
    sort?: number
  }>({
    firmwareName: '',
    type: firmwareTypes[0]?.key || 'esp32',
    version: '',
    remark: '',
    firmwarePath: '',
    size: undefined,
    sort: 0,
  })

  React.useEffect(() => {
    if (!open) return
    if (isEdit && editItem) {
      setForm({
        firmwareName: editItem.firmwareName || '',
        type: editItem.type || (firmwareTypes[0]?.key || 'esp32'),
        version: editItem.version || '',
        remark: editItem.remark || '',
        firmwarePath: editItem.firmwarePath || '',
        size: editItem.size,
        sort: editItem.sort ?? 0,
      })
    } else {
      setForm({ firmwareName: '', type: firmwareTypes[0]?.key || 'esp32', version: '', remark: '', firmwarePath: '', size: undefined, sort: 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, editItem?.id])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await upload({ file })
      if (res.code === 0 && res.data) {
        setForm((p) => ({ ...p, firmwarePath: res.data!, size: file.size }))
        toast.success('固件上传成功')
      } else {
        throw new Error(res.msg || '上传失败')
      }
    } catch (e: any) {
      toast.error(e?.message || '上传失败')
    }
  }

  const onSubmit = async () => {
    if (!form.firmwareName?.trim()) return toast.error('请输入固件名称')
    if (!form.type?.trim()) return toast.error('请选择固件类型')
    if (!form.version?.trim()) return toast.error('请输入版本号')
    if (!form.firmwarePath?.trim()) return toast.error('请先上传固件文件')
    try {
      if (isEdit && editItem?.id) {
        const r = await update({ params: { id: String(editItem.id) }, data: form })
        if (r.code === 0) toast.success('已更新固件信息')
        else throw new Error(r.msg || '更新失败')
      } else {
        const r = await save({ data: form })
        if (r.code === 0) toast.success('已新增固件')
        else throw new Error(r.msg || '保存失败')
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.message || '操作失败')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑固件' : '新增固件'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firmwareName">固件名称</Label>
              <Input id="firmwareName" value={form.firmwareName} onChange={(e) => setForm((p) => ({ ...p, firmwareName: e.target.value }))} placeholder="便于识别的名称" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">固件类型</Label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="选择固件类型" />
                </SelectTrigger>
                <SelectContent>
                  {firmwareTypes.map((t) => (
                    <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">版本号</Label>
              <Input id="version" value={form.version} onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))} placeholder="例如 1.0.0" />
            </div>
            <div className="space-y-2">
              <Label>固件文件</Label>
              <Input type="file" accept=".bin,.apk" onChange={handleFileChange} disabled={uploading} />
              <div className="text-xs text-muted-foreground">{form.firmwarePath ? `已上传：${form.firmwarePath} (${bytesToSize(form.size)})` : '支持 .bin/.apk'}</div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="remark">备注</Label>
              <Textarea id="remark" value={form.remark} onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))} placeholder="可选，说明用途等" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={onSubmit} disabled={saving || updating || uploading}>{isEdit ? '保存' : '创建'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OtaManagementPage() {
  const { currentPage, pageSize, pageSizeOptions, setPageSize, visiblePages, pageCount, goFirst, goPrev, goNext, goToPage, setTotal } = usePagination(10)
  const [searchKeyword, setSearchKeyword] = React.useState('')
  const [editOpen, setEditOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<OtaEntity | null>(null)
  const { getFirmwareTypeName } = useFirmwareTypes()

  const { data, isLoading, refetch } = useOtaMagPageQuery({ page: currentPage, limit: pageSize, keyword: searchKeyword })
  React.useEffect(() => {
    if (data?.data?.total != null) setTotal(data.data.total)
  }, [data, setTotal])

  const { mutateAsync: remove, isPending: removing } = useOtaMagDeleteMutation()

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该固件？')) return
    try {
      const r = await remove({ params: { id } })
      if (r.code === 0) {
        toast.success('删除成功')
        refetch()
      } else {
        throw new Error(r.msg || '删除失败')
      }
    } catch (e: any) {
      toast.error(e?.message || '删除失败')
    }
  }

  const list = data?.data?.list ?? []

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-semibold">OTA 固件管理</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Input placeholder="按名称/版本搜索" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && refetch()} />
          </div>
          <Button onClick={() => { setEditing(null); setEditOpen(true) }}>上传固件</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead className="hidden md:table-cell">备注</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">{item.firmwareName}</TableCell>
                      <TableCell className="whitespace-nowrap">{getFirmwareTypeName(item.type)}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.version}</TableCell>
                      <TableCell className="whitespace-nowrap">{bytesToSize(item.size)}</TableCell>
                      <TableCell className="hidden md:table-cell truncate max-w-[320px]">{item.remark || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditing(item); setEditOpen(true) }}>编辑</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(String(item.id))} disabled={removing}>删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {list.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground">暂无固件</div>
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator />
        <div className="flex items-center gap-3 justify-between p-4">
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(parseInt(v, 10) as any)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((sz) => (
                  <SelectItem key={sz} value={String(sz)}>{sz}条/页</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goFirst} disabled={currentPage === 1}>首页</Button>
            <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage === 1}>上一页</Button>
            {visiblePages.map((p) => (
              <Button key={p} variant={p === currentPage ? 'default' : 'outline'} size="sm" onClick={() => goToPage(p)} className="w-8">{p}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={goNext} disabled={currentPage === pageCount}>下一页</Button>
          </div>
          <div className="text-sm text-muted-foreground">共 {data?.data?.total ?? 0} 条</div>
        </div>
      </div>

      <OtaEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editItem={editing}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

export default OtaManagementPage
