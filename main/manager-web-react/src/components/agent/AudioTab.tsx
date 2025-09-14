import { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAgentChatHistoryUserGetRecentlyFiftyByAgentIdQuery, useAgentChatHistoryAudioGetContentByAudioIdQuery } from '@/hooks/agent/generatedHooks'

export function AudioTab({ agentId }: { agentId: string }) {
  const list = useAgentChatHistoryUserGetRecentlyFiftyByAgentIdQuery({ id: agentId })

  const [audioId, setAudioId] = useState<string | null>(null)
  const audio = useAgentChatHistoryAudioGetContentByAudioIdQuery(audioId ? { id: audioId } : ({} as any), undefined, { enabled: !!audioId })

  const rows = useMemo(() => list.data?.data ?? [], [list.data])

  const buildSrc = (val?: string) => {
    if (!val) return ''
    if (val.startsWith('http')) return val
    return `data:audio/wav;base64,${val}`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>历史音频</CardTitle>
        <CardDescription>最近记录，可播放或下载</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[680px]">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-10 text-center hidden sm:table-cell">#</TableHead>
              <TableHead className="whitespace-nowrap">时间</TableHead>
              <TableHead className="min-w-[240px]">文本</TableHead>
              <TableHead className="w-36 hidden sm:table-cell">音频</TableHead>
              <TableHead className="w-28">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">加载中...</TableCell></TableRow>
            )}
            {rows.map((r, i) => (
              <TableRow key={r.id ?? i}>
                <TableCell className="text-center hidden sm:table-cell">{i + 1}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{r.createDate ?? '—'}</TableCell>
                <TableCell className="max-w-[420px] truncate" title={r.text ?? ''}>{r.text ?? '—'}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {audioId === r.audioId && audio.data?.data ? (
                    <audio controls src={buildSrc(audio.data?.data)} />
                  ) : (
                    <span className="text-xs text-muted-foreground">未加载</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => setAudioId(String(r.audioId ?? ''))} disabled={!r.audioId}>播放</Button>
                  {audioId === r.audioId && audio.data?.data && (
                    <a
                      href={buildSrc(audio.data?.data)}
                      download={`audio-${r.id ?? i}.wav`}
                      className="inline-block"
                    >
                      <Button size="sm" variant="outline">下载</Button>
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!list.isLoading && rows.length === 0) && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">暂无数据</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
