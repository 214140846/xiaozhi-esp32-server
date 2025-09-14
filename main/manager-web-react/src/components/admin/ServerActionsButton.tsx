import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminServerEmitActionEmitServerActionMutation, useAdminServerServerListGetWsServerListQuery } from '@/hooks/admin/generatedHooks'

/**
 * Admin-only button to manage server actions.
 * Shows a dialog to select WS server and emit an action.
 */
export const ServerActionsButton: React.FC = () => {
  const { state } = useAuth()
  const user = state.user as any
  const isAdmin = user?.superAdmin === 1
  const { toast } = useToast()

  const [open, setOpen] = React.useState(false)
  const [targetWs, setTargetWs] = React.useState<string>('')
  const [action, setAction] = React.useState<string>('reload-config')

  const { data: serversRes, isLoading } = useAdminServerServerListGetWsServerListQuery({}, undefined, { enabled: isAdmin })
  const servers = serversRes?.data ?? []

  const emitMutation = useAdminServerEmitActionEmitServerActionMutation({
    onSuccess: (res) => {
      if ((res?.code ?? 1) === 0) {
        toast({ description: '操作已发送' })
        setOpen(false)
      } else {
        toast({ description: res?.msg || '操作失败', variant: 'destructive' })
      }
    },
    onError: (e: any) => toast({ description: e?.message || e?.response?.data?.msg || '操作失败', variant: 'destructive' }),
  })

  if (!isAdmin) return null

  const handleSubmit = async () => {
    await emitMutation.mutateAsync({ data: { action, targetWs } })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">服务端管理</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>服务端管理</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>目标服务器</Label>
            <select
              className="w-full h-9 border rounded-md bg-background"
              value={targetWs}
              onChange={(e) => setTargetWs(e.target.value)}
              disabled={isLoading}
            >
              <option value="" disabled>
                {isLoading ? '加载中...' : '请选择服务端'}
              </option>
              {servers.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>操作指令</Label>
            <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="如: reload-config" />
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Button type="button" size="sm" variant="secondary" onClick={() => setAction('reload-config')}>
                reload-config
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setAction('ping')}>
                ping
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!targetWs || !action || emitMutation.isPending}>
            发送
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ServerActionsButton

