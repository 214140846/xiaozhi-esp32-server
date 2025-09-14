import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useAgentVoicePrintListListQuery,
  useAgentVoicePrintSaveMutation,
  useAgentVoicePrintUpdate1Mutation,
  useAgentVoicePrintDelete1Mutation,
} from '@/hooks/agent/generatedHooks'
import type { AgentVoicePrintVO } from '@/types/openapi/agent'
import { toast } from 'sonner'

const schema = z.object({
  id: z.string().optional(),
  agentId: z.string(),
  audioId: z.string().min(1, '音频ID不能为空'),
  sourceName: z.string().min(1, '名称不能为空'),
  introduce: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function VoicePrintTab({ agentId }: { agentId: string }) {
  const listQuery = useAgentVoicePrintListListQuery({ id: agentId })
  const saveMutation = useAgentVoicePrintSaveMutation()
  const updateMutation = useAgentVoicePrintUpdate1Mutation()
  const delMutation = useAgentVoicePrintDelete1Mutation()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AgentVoicePrintVO | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { agentId }
  })

  const onCreate = () => {
    setEditing(null)
    reset({ agentId, audioId: '', sourceName: '', introduce: '' })
    setOpen(true)
  }

  const onEdit = (row: AgentVoicePrintVO) => {
    setEditing(row)
    reset({ id: row.id, agentId, audioId: row.audioId ?? '', sourceName: row.sourceName ?? '', introduce: row.introduce ?? '' })
    setOpen(true)
  }

  const onDelete = async (row: AgentVoicePrintVO) => {
    if (!row.id) return
    if (!confirm('确认删除该声纹吗？')) return
    await delMutation.mutateAsync({ params: { id: row.id } })
    await listQuery.refetch()
    toast.success('已删除')
  }

  const onSubmit = async (values: FormValues) => {
    if (editing) {
      await updateMutation.mutateAsync({ data: { id: values.id, agentId: values.agentId, audioId: values.audioId, sourceName: values.sourceName, introduce: values.introduce } })
      toast.success('已更新')
    } else {
      await saveMutation.mutateAsync({ data: { agentId: values.agentId, audioId: values.audioId, sourceName: values.sourceName, introduce: values.introduce } })
      toast.success('已创建')
    }
    setOpen(false)
    await listQuery.refetch()
  }

  const rows = useMemo(() => listQuery.data?.data ?? [], [listQuery.data])

  return (
    <div className="space-y-3">
      {/* 顶部工具栏：小屏堆叠，按钮可触达 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">声纹列表</div>
        <div className="flex">
          <Button size="sm" onClick={onCreate}>新建</Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto bg-card">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>音频ID</TableHead>
              <TableHead>备注</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">加载中...</TableCell></TableRow>
            )}
            {rows.map((r, i) => (
              <TableRow key={r.id ?? i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{r.sourceName ?? '—'}</TableCell>
                <TableCell className="font-mono text-xs">{r.audioId ?? '—'}</TableCell>
                <TableCell>{r.introduce ?? '—'}</TableCell>
                <TableCell>{r.createDate ?? '—'}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(r)}>编辑</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(r)}>删除</Button>
                </TableCell>
              </TableRow>
            ))}
            {(!listQuery.isLoading && rows.length === 0) && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">暂无数据</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑声纹' : '新建声纹'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input type="hidden" {...register('agentId')} />
            <div>
              <div className="text-sm mb-1">名称</div>
              <Input placeholder="名称" {...register('sourceName')} />
              {errors.sourceName && <div className="text-xs text-destructive mt-1">{errors.sourceName.message}</div>}
            </div>
            <div>
              <div className="text-sm mb-1">音频ID</div>
              <Input placeholder="音频ID" {...register('audioId')} />
              {errors.audioId && <div className="text-xs text-destructive mt-1">{errors.audioId.message}</div>}
            </div>
            <div>
              <div className="text-sm mb-1">备注</div>
              <Textarea placeholder="可选" {...register('introduce')} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '提交中...' : '提交'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
