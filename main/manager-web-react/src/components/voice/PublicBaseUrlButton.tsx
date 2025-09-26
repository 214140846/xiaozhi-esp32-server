import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAdminParamsPagePageQuery, useAdminParamsSaveMutation, useAdminParamsUpdate1Mutation } from '@/hooks/admin'

const CODE = 'server.public_base_url'

export default function PublicBaseUrlButton() {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')

  const { data, refetch } = useAdminParamsPagePageQuery({}, { page: 1, limit: 1, paramCode: CODE }, { enabled: open })
  const record = useMemo(() => data?.data?.list?.[0] as any, [data])

  useEffect(() => {
    if (!open) return
    setVal(record?.paramValue || '')
  }, [open, record])

  const { mutateAsync: saveParam, isPending: saving } = useAdminParamsSaveMutation()
  const { mutateAsync: updateParam, isPending: updating } = useAdminParamsUpdate1Mutation()

  const onSave = async () => {
    try {
      if (record?.id) {
        await updateParam({ data: { id: record.id, paramCode: CODE, paramValue: val, valueType: 'string', remark: record?.remark || '公网基础地址' } as any })
      } else {
        await saveParam({ data: { paramCode: CODE, paramValue: val, valueType: 'string', remark: '公网基础地址（形如 http://host:port/上下文路径）' } as any })
      }
      toast.success('已保存')
      await refetch()
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || e?.message || '保存失败')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">Base URL</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>公共基础地址（server.public_base_url）</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="http://127.0.0.1:8002/xiaozhi" />
          <div className="text-xs text-muted-foreground">用于拼接 /userVoice/download/... 为完整 URL，供 TTS 服务拉取</div>
          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving || updating}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

