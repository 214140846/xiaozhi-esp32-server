import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserVoices } from '@/hooks/useUserVoices'

type Props = { onClose?: () => void }

export default function MyVoiceManager({ onClose }: Props) {
  const { list, quota, settings, loading, refresh, upload, addByUrl, remove, setSettings } = useUserVoices()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const canUpload = quota ? quota.used < quota.total : false

  const handleUpload = async () => {
    if (!file) {
      toast.error('请先选择WAV文件')
      return
    }
    try {
      const n = name && name.trim().length > 0 ? name.trim() : `我的音色${(quota?.used ?? 0) + 1}`
      await upload(file, n)
      toast.success('上传成功')
      setName('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      await refresh()
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || '上传失败')
    }
  }

  const handleAddUrl = async () => {
    if (!url) {
      toast.error('请输入可访问的音色URL（http/https）')
      return
    }
    try {
      const n = name && name.trim().length > 0 ? name.trim() : `我的音色${(quota?.used ?? 0) + 1}`
      await addByUrl(n, url)
      toast.success('添加成功')
      setName('')
      setUrl('')
      await refresh()
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || '添加失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {loading ? '加载中…' : `已用 ${quota?.used ?? 0} / 总配额 ${quota?.total ?? 0}（默认${quota?.default ?? 0}，额外${quota?.extra ?? 0}）`}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="space-y-2">
          <Label>音色名称</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：我的音色1" />
        </div>
        <div className="space-y-2">
          <Label>上传WAV</Label>
          <Input ref={fileRef} type="file" accept="audio/wav" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!file || !canUpload}>上传并占用音色位</Button>
            {!canUpload && <span className="text-xs text-destructive self-center">音色位不足</span>}
          </div>
        </div>
        <div className="space-y-2">
          <Label>或填写音色文件URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http(s)://.../voice.wav" />
          <div>
            <Button variant="secondary" onClick={handleAddUrl} disabled={!canUpload}>添加URL占用音色位</Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">全局 API Key（只需填一次）</div>
        <div className="flex gap-2 items-end">
          <Input defaultValue={settings?.apiKey || ''} placeholder="sk_xxx（用于TTS鉴权）" id="global-voice-ak" />
          <Button
            onClick={async () => {
              const v = (document.getElementById('global-voice-ak') as HTMLInputElement)?.value || ''
              try {
                await setSettings({ apiKey: v })
                toast.success('已保存')
                await refresh()
              } catch (e: any) {
                toast.error(e?.response?.data?.msg || '保存失败')
              }
            }}
          >保存</Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">我的音色</div>
        <div className="space-y-2">
          {list.map((v) => (
            <div key={v.id} className="flex items-center justify-between border rounded p-2">
              <div className="flex-1">
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-muted-foreground break-all">{v.tosUrl}</div>
              </div>
              <audio src={v.tosUrl} controls className="mx-3" />
              <Button variant="destructive" onClick={async () => { await remove(v.id); await refresh() }}>删除</Button>
            </div>
          ))}
          {list.length === 0 && <div className="text-sm text-muted-foreground">暂无音色，先在上方上传一个吧</div>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>关闭</Button>
      </div>
    </div>
  )
}
