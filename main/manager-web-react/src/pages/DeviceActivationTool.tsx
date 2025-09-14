import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useOtaActivateActivateDeviceMutation, useOtaCheckOTAVersionMutation } from '@/hooks/ota/generatedHooks'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ScrollArea } from '@/components/ui/scroll-area'

const headersSchema = z.string().transform((val, ctx) => {
  if (!val.trim()) return {}
  try { return JSON.parse(val) }
  catch { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Headers 需为合法 JSON' }); return z.NEVER }
})

const reportSchema = z.object({
  headers: headersSchema,
  payload: z.string().transform((val, ctx) => {
    if (!val.trim()) return {}
    try { return JSON.parse(val) }
    catch { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Payload 需为合法 JSON' }); return z.NEVER }
  })
})

type ReportValues = z.infer<typeof reportSchema>

export default function DeviceActivationTool() {
  const [resp, setResp] = useState('')
  const activate = useOtaActivateActivateDeviceMutation()
  const check = useOtaCheckOTAVersionMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportValues>({ resolver: zodResolver(reportSchema), defaultValues: { headers: {}, payload: {} } as any })

  const onActivate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const raw = String(fd.get('headers') || '')
    let headers: any = {}
    try { headers = raw ? JSON.parse(raw) : {} } catch { setResp('Headers 需为合法 JSON'); return }
    const res = await activate.mutateAsync({ config: { headers } })
    setResp(typeof res === 'string' ? res : JSON.stringify(res))
  }

  const onCheck = handleSubmit(async (v) => {
    const res = await check.mutateAsync({ data: v.payload as any, config: { headers: v.headers as any } })
    setResp(typeof res === 'string' ? res : JSON.stringify(res))
  })

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-xl font-semibold">设备注册 / 激活联调</h1>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 space-y-3">
          <div className="font-medium">激活请求头</div>
          <form className="space-y-3" onSubmit={onActivate}>
            <Textarea rows={8} placeholder='{"X-Device-Id":"..."}' name="headers" />
            <div className="flex justify-end">
              <Button type="submit" size="sm">发送</Button>
            </div>
          </form>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <div className="font-medium">版本检查</div>
          <form className="space-y-3" onSubmit={onCheck}>
            <div>
              <div className="text-sm mb-1">Headers JSON</div>
              <Textarea rows={5} placeholder='{"X-Device-Id":"..."}' {...register('headers' as any)} />
              {errors.headers && <div className="text-xs text-destructive mt-1">{String(errors.headers.message)}</div>}
            </div>
            <div>
              <div className="text-sm mb-1">Payload JSON</div>
              <Textarea rows={8} placeholder='{"board":"esp32-s3","appVersion":"1.0.0"}' {...register('payload' as any)} />
              {errors.payload && <div className="text-xs text-destructive mt-1">{String(errors.payload.message)}</div>}
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? '发送中...' : '发送'}</Button>
            </div>
          </form>
        </div>
      </div>

      <Separator />
      <div className="p-4">
        <div className="font-medium mb-2">响应</div>
        <div className="border rounded-lg bg-muted p-3">
          <ScrollArea className="h-48">
            <pre className="text-sm whitespace-pre-wrap">{resp || '—'}</pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

