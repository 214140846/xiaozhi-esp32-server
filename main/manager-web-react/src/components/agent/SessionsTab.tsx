import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAgentSessionsGetAgentSessionsQuery, useAgentChatHistoryGetAgentChatHistoryQuery } from '@/hooks/agent/generatedHooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export function SessionsTab({ agentId }: { agentId: string }) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const { data, isLoading } = useAgentSessionsGetAgentSessionsQuery(
    { id: agentId },
    { page, limit }
  )

  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const historyQuery = useAgentChatHistoryGetAgentChatHistoryQuery(
    sessionId ? { id: agentId, sessionId } : ({} as any),
    undefined,
    { enabled: !!sessionId && open }
  )

  const pageCount = Math.max(1, Math.ceil((data?.data?.total ?? 0) / limit))

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">会话列表（分页）</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(1)}>首页</Button>
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>上一页</Button>
          <span className="text-sm">{page} / {pageCount}</span>
          <Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>下一页</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>会话名</TableHead>
              <TableHead>最近消息</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">加载中...</TableCell>
              </TableRow>
            )}
            {(data?.data?.list ?? []).map((s, idx) => (
              <TableRow key={s.id ?? idx}>
                <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                <TableCell>{s.sessionName ?? '—'}</TableCell>
                <TableCell>{s.lastMessageAt ?? '—'}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => {/* 预留：进入会话页面 */}} disabled>进入会话</Button>
                  <Button size="sm" variant="outline" onClick={() => { setSessionId(String(s.id!)); setOpen(true) }}>查看聊天记录</Button>
                </TableCell>
              </TableRow>
            ))}
            {(!isLoading && (data?.data?.list ?? []).length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">暂无数据</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>聊天记录</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96 border rounded-md p-3 bg-background">
            {historyQuery.isLoading && (
              <div className="text-sm text-muted-foreground">加载中...</div>
            )}
            {(!historyQuery.isLoading && (historyQuery.data?.data?.length ?? 0) === 0) && (
              <div className="text-sm text-muted-foreground">暂无聊天记录</div>
            )}
            {(historyQuery.data?.data ?? []).map((m, i) => (
              <div key={m.id ?? i} className="mb-3">
                <div className="text-xs text-muted-foreground">{m.createDate}</div>
                <div className="text-sm">
                  <span className="inline-block min-w-14 text-muted-foreground">{m.role}</span>
                  <span className="whitespace-pre-wrap">{m.text ?? '—'}</span>
                </div>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
