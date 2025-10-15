import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import SlotsTable, { type RowData, type BillingMode } from './SlotsTable'
import { useAdminUpdateSlotMutation } from '@/hooks/admin/ttsSlots'
import { adminListSlotsByUser } from '@/api/admin/ttsSlots'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  userId: string | null
  title?: string
}

export default function UserSlotsDialog({ open, onOpenChange, userId, title }: Props) {
  const { toast } = useToast()
  const { data: userSlots = [], refetch } = useQuery({
    queryKey: ['Admin.SlotsByUser.Dialog', userId ?? 'none'],
    queryFn: async () => (userId ? ((await adminListSlotsByUser({ userId })).data || []) : []),
    enabled: !!userId && open,
  })

  const [rows, setRows] = React.useState<RowData[]>([])
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const updateSlot = useAdminUpdateSlotMutation()

  const prevSigRef = React.useRef<string>("")
  React.useEffect(() => {
    const sig = JSON.stringify((userSlots || []).map((s: any) => [s.slotId, s.voiceId, s.ttsModelId, s.quotaMode, s.ttsCallLimit, s.ttsTokenLimit, s.cloneLimit]))
    if (sig === prevSigRef.current) return
    prevSigRef.current = sig
    const newRows: RowData[] = (userSlots || []).map((s: any, idx: number) => ({
      id: idx + 1,
      userId: String(s.userId ?? ''),
      userName: String(s.userId ?? ''),
      agentId: '',
      ttsModelId: s.ttsModelId,
      slotId: s.slotId,
      voiceId: s.voiceId,
      timbreName: s.name,
      billingMode: (s.quotaMode as BillingMode) || 'off',
      limit:
        s.quotaMode === 'count'
          ? s.ttsCallLimit ?? null
          : s.quotaMode === 'token' || s.quotaMode === 'char'
          ? s.ttsTokenLimit ?? null
          : null,
      cloneLimit: s.cloneLimit ?? null,
      remark: '',
    }))
    setRows(newRows)
    setEditingId(null)
  }, [userSlots])

  const startEdit = (id: number) => setEditingId(id)
  const cancelEdit = () => setEditingId(null)
  const updateRow = (id: number, patch: Partial<RowData>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const saveEdit = async () => {
    const r = rows.find((r) => r.id === editingId!)
    if (!r || !r.slotId) {
      setEditingId(null)
      return
    }
    const body: any = { quotaMode: r.billingMode, cloneLimit: r.cloneLimit ?? null }
    if (r.billingMode === 'count') body.ttsCallLimit = r.limit ?? null
    if (r.billingMode === 'token' || r.billingMode === 'char') body.ttsTokenLimit = r.limit ?? null
    try {
      await updateSlot.mutateAsync({ slotId: r.slotId, body })
      toast({ title: '已保存', description: '音色位设置已更新' })
      setEditingId(null)
      refetch()
    } catch (e: any) {
      toast({ title: '保存失败', description: e?.message || '请稍后重试' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:max-w-[98vw] md:max-w-[98vw] lg:max-w-[98vw] xl:max-w-[98vw] 2xl:max-w-[98vw] max-w-[98vw] h-[72vh] max-h-[72vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || `用户 ${userId} 的音色位`}</DialogTitle>
          <DialogDescription>编辑该用户音色位的克隆上限与扣费模式</DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <SlotsTable
            rows={rows}
            editingId={editingId}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            onSaveEdit={saveEdit}
            onUpdateRow={updateRow}
          />
        </div>
       
      </DialogContent>
    </Dialog>
  )
}
