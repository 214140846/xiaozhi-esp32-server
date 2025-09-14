import { useAgentMcpAddressGetAgentMcpAccessAddressQuery, useAgentMcpToolsGetAgentMcpToolsListQuery } from '@/hooks/agent/generatedHooks'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function McpTab({ agentId }: { agentId: string }) {
  const addr = useAgentMcpAddressGetAgentMcpAccessAddressQuery({ agentId })
  const tools = useAgentMcpToolsGetAgentMcpToolsListQuery({ agentId })

  const address = addr.data?.data ?? ''
  const json = useMemo(() => JSON.stringify(tools.data?.data ?? {}, null, 2), [tools.data])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {}
  }

  return (
    <div className="space-y-3">
      {/* 顶部工具栏：小屏堆叠，避免拥挤 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">MCP 工具列表</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm shrink-0">接入地址:</span>
            <code className="px-2 py-1 rounded bg-muted text-xs max-w-full sm:max-w-[480px] truncate">{address || '—'}</code>
          </div>
          <div className="flex">
            <Button size="sm" variant="outline" onClick={copy} disabled={!address}>复制</Button>
          </div>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden bg-card">
        <ScrollArea className="h-96">
          <pre className="text-sm p-3 whitespace-pre-wrap text-foreground">{json}</pre>
        </ScrollArea>
      </div>
    </div>
  )
}
