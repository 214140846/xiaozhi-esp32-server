import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useUserVoices } from '@/hooks/useUserVoices'
import { toast } from 'sonner'

export default function GlobalVoiceKeyButton() {
  const { settings, refresh, setSettings } = useUserVoices()
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')

  useEffect(() => {
    setVal(settings?.apiKey || '')
  }, [settings])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">TTS Key</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>全局 TTS API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="sk_xxx（用于TTS鉴权）" />
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                try {
                  await setSettings({ apiKey: val })
                  toast.success('已保存')
                  await refresh()
                  setOpen(false)
                } catch (e: any) {
                  toast.error(e?.response?.data?.msg || '保存失败')
                }
              }}
            >保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

