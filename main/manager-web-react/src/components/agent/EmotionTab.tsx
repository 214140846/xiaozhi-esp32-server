import React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { DEFAULT_EMOTIONS } from '@/lib/defaultEmotions'
import { apiClient } from '@/lib/api'
import type { AgentEmotionAsset, DeviceEmotion } from '@/types/emotion'
import { listAgentEmotions, uploadAgentEmotion } from '@/api/emotion'

type Props = { agentId: string }

export function EmotionTab({ agentId }: Props) {
  const [assets, setAssets] = useState<AgentEmotionAsset[]>([])
  const [loading, setLoading] = useState(false)

  const assetMap = useMemo(() => Object.fromEntries(assets.map(a => [a.code, a])), [assets])
  const viewList: DeviceEmotion[] = useMemo(
    () => DEFAULT_EMOTIONS.map(e => ({
      ...e,
      ...(assetMap[e.code]
        ? { url: assetMap[e.code].url, fileSize: assetMap[e.code].fileSize }
        : {}),
    })),
    [assets]
  )

  // 将相对URL转为可访问的API地址（支持Vite代理与生产环境）
  const toImgUrl = (path: string) => {
    const base = (apiClient.defaults.baseURL || '/api').replace(/\/$/, '')
    const p = (path || '').startsWith('/') ? path : `/${path}`
    return `${base}${p}`
  }

  const ImageBox = ({ src, alt }: { src?: string; alt: string }) => {
    const [error, setError] = useState(false)
    if (!src || error) {
      return (
        <div className="h-28 w-full rounded-md bg-muted text-xs text-muted-foreground flex items-center justify-center">
          无预览
        </div>
      )
    }
    return (
      <img
        src={toImgUrl(src)}
        alt={alt}
        className="h-28 w-full object-contain rounded-md bg-muted"
        onError={() => setError(true)}
        draggable={false}
      />
    )
  }

  const load = async () => {
    setLoading(true)
    try {
      const list = await listAgentEmotions(agentId)
      setAssets(list)
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (agentId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  const onUpload = async (code: string, file?: File | null) => {
    if (!file) return
    try {
      await uploadAgentEmotion(agentId, code, file)
      toast.success('上传成功')
      await load()
    } catch (e: any) {
      toast.error(e?.response?.data?.msg || '上传失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">表情包管理</h2>
        <Button variant="outline" onClick={load} disabled={loading}>{loading ? '刷新中...' : '刷新'}</Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>默认表情列表（可上传覆盖）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {viewList.map((e) => (
              <div key={e.code} className="rounded-lg border p-3 shadow-sm hover:shadow transition flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-2xl" title={e.code}>{e.emoji}</div>
                  <div className="text-xs text-muted-foreground select-all">{e.code}</div>
                </div>
                <ImageBox src={e.url} alt={e.code} />
                <div className="flex items-center justify-end gap-2">
                  <UploadButton code={e.code} onUpload={onUpload} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmotionTab

// 子组件：更美观的上传按钮
function UploadButton({ code, onUpload }: { code: string; onUpload: (code: string, file?: File | null) => void }) {
  const ref = useRef<HTMLInputElement | null>(null)
  const [label, setLabel] = useState('上传图片')
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) setLabel('上传中...')
          onUpload(code, f)
          // 重置文件选择以便重复选择同一个文件
          e.currentTarget.value = ''
          setTimeout(() => setLabel('上传图片'), 500)
        }}
      />
      <Button size="sm" variant="secondary" onClick={() => ref.current?.click()}>{label}</Button>
    </>
  )
}
