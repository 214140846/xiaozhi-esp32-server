import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useAgentVoicePrintListListQuery,
  useAgentVoicePrintSaveMutation,
  useAgentVoicePrintUpdate1Mutation,
  useAgentVoicePrintDelete1Mutation,
  useAgentChatHistoryAudioGetContentByAudioIdQuery,
} from '@/hooks/agent/generatedHooks'
import type { AgentVoicePrintVO } from '@/types/openapi/agent'
import { toast } from 'sonner'
import { useAgentChatHistoryUserGetRecentlyFiftyByAgentIdQuery } from '@/hooks/agent/generatedHooks'

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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [audioSearch, setAudioSearch] = useState('')
  const [previewAudioId, setPreviewAudioId] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { agentId }
  })

  // 最近 50 条用户侧聊天记录（含音频ID）
  const recentChat = useAgentChatHistoryUserGetRecentlyFiftyByAgentIdQuery({ id: agentId })
  const audioOptions = useMemo(() => {
    const list = recentChat.data?.data ?? []
    const withAudio = list.filter(x => !!x.audioId)
    // 去重（按 audioId）并按时间倒序
    const seen = new Set<string>()
    const dedup = [] as { value: string; label: string }[]
    for (const item of withAudio) {
      const id = String(item.audioId)
      if (seen.has(id)) continue
      seen.add(id)
      const ts = item.createDate ?? ''
      const text = (item.text ?? '').slice(0, 28)
      dedup.push({ value: id, label: `${ts} ｜ ${text || '语音消息'}` })
    }
    return dedup
  }, [recentChat.data])

  const filtered = useMemo(() => {
    const kw = audioSearch.trim().toLowerCase()
    if (!kw) return recentChat.data?.data?.filter(x => !!x.audioId) ?? []
    return (recentChat.data?.data ?? [])
      .filter(x => !!x.audioId)
      .filter(x => {
        const text = (x.text ?? '').toLowerCase()
        const date = (x.createDate ?? '').toLowerCase()
        const id = String(x.audioId).toLowerCase()
        return text.includes(kw) || date.includes(kw) || id.includes(kw)
      })
  }, [recentChat.data, audioSearch])

  const preview = useAgentChatHistoryAudioGetContentByAudioIdQuery(
    previewAudioId ? { id: previewAudioId } : ({} as any),
    undefined,
    { enabled: !!previewAudioId }
  )

  const buildSrc = (val?: string) => {
    if (!val) return ''
    if (val.startsWith('http')) return val
    return `data:audio/wav;base64,${val}`
  }

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
              <div className="text-sm mb-1">音频ID（选择历史会话音频）</div>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Select
                    value={watch('audioId')}
                    onValueChange={(v) => setValue('audioId', v, { shouldValidate: true, shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={recentChat.isLoading ? '加载中...' : '选择历史音频'} />
                    </SelectTrigger>
                    <SelectContent>
                      {audioOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                      {(!recentChat.isLoading && audioOptions.length === 0) && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">暂无可用历史音频</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>选择历史音频</Button>
              </div>
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

      {/* 历史音频选择器（含搜索、预览、下载） */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>选择历史音频</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Input
                placeholder={recentChat.isLoading ? '加载中...' : '搜索（按文本 / 时间 / 音频ID）'}
                value={audioSearch}
                onChange={(e) => setAudioSearch(e.target.value)}
              />
            </div>
            <div className="border rounded-md">
              <div className="max-h-[360px] overflow-auto">
                <Table className="min-w-[720px]">
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-10 text-center hidden sm:table-cell">#</TableHead>
                      <TableHead className="whitespace-nowrap">时间</TableHead>
                      <TableHead className="min-w-[240px]">文本</TableHead>
                      <TableHead className="w-36 hidden sm:table-cell">音频</TableHead>
                      <TableHead className="w-40">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentChat.isLoading && (
                      <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">加载中...</TableCell></TableRow>
                    )}
                    {filtered.map((r, i) => (
                      <TableRow key={r.id ?? i}>
                        <TableCell className="text-center hidden sm:table-cell">{i + 1}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{r.createDate ?? '—'}</TableCell>
                        <TableCell className="max-w-[420px] truncate" title={r.text ?? ''}>{r.text ?? '—'}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {previewAudioId === r.audioId && preview.data?.data ? (
                            <audio controls src={buildSrc(preview.data?.data)} />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="secondary" onClick={() => setPreviewAudioId(String(r.audioId ?? ''))} disabled={!r.audioId}>预览</Button>
                          {previewAudioId === r.audioId && preview.data?.data && (
                            <a
                              href={buildSrc(preview.data?.data)}
                              download={`audio-${r.id ?? i}.wav`}
                              className="inline-block"
                            >
                              <Button size="sm" variant="outline">下载</Button>
                            </a>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              const id = String(r.audioId ?? '')
                              if (!id) return
                              setValue('audioId', id, { shouldValidate: true, shouldDirty: true })
                              toast.success('已选择音频')
                              setPickerOpen(false)
                            }}
                            disabled={!r.audioId}
                          >选择</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!recentChat.isLoading && filtered.length === 0) && (
                      <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">暂无匹配的历史音频</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPickerOpen(false)}>关闭</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
