import { useEffect, useState } from 'react'
import { Controller, type Control, useWatch } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MyVoiceManager from '@/components/voice/MyVoiceManager'
import GlobalVoiceKeyButton from '@/components/voice/GlobalVoiceKeyButton'

import { useModelList, useModelVoices } from '@/hooks/models/useModelList'

type Props = {
  control: Control<any>
  setValue: (name: any, value: any, options?: any) => void
}

export function ModelSelectCard({ control, setValue }: Props) {
  // 模型列表
  const { models: vadModels } = useModelList({ modelType: 'vad', page: 1, limit: 100 })
  const { models: asrModels } = useModelList({ modelType: 'asr', page: 1, limit: 100 })
  const { models: llmModels } = useModelList({ modelType: 'llm', page: 1, limit: 100 })
  const { models: vllmModels } = useModelList({ modelType: 'vllm', page: 1, limit: 100 })
  const { models: memModels } = useModelList({ modelType: 'memory', page: 1, limit: 100 })
  const { models: intentModels } = useModelList({ modelType: 'intent', page: 1, limit: 100 })
  const { models: ttsModels } = useModelList({ modelType: 'tts', page: 1, limit: 100 })

  const ttsModelId = useWatch({ control, name: 'ttsModelId' }) as string
  const ttsVoiceId = useWatch({ control, name: 'ttsVoiceId' }) as string
  const voices = useModelVoices(ttsModelId)
  const [open, setOpen] = useState(false)
  const [voiceSource, setVoiceSource] = useState<'system' | 'mine'>('system')

  // 切换 TTS 模型时清空音色
  // 根据已保存的 ttsVoiceId 决定音色来源（随表单值变化而更新）
  useEffect(() => {
    const isMine = !!ttsVoiceId && String(ttsVoiceId).startsWith('USER_VOICE_')
    if (isMine) {
      if (voiceSource !== 'mine') setVoiceSource('mine')
      if (ttsModelId !== 'TTS_CustomTTS') {
        setValue('ttsModelId', 'TTS_CustomTTS', { shouldDirty: false })
      }
    } else {
      if (voiceSource !== 'system') setVoiceSource('system')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsVoiceId])

  useEffect(() => {
    // 切到“我的音色”时，确保使用自定义TTS且等待用户选择具体音色
    if (voiceSource === 'mine' && ttsModelId !== 'TTS_CustomTTS') {
      setValue('ttsModelId', 'TTS_CustomTTS', { shouldDirty: true })
      // 不清空已有选择，若用户已保存过则保持
    }
  }, [voiceSource, ttsModelId, setValue])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>模型选择</CardTitle>
        <CardDescription>按功能选择识别/生成模型</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <div className="space-y-2">
            <Label>VAD</Label>
            <Controller
              control={control}
              name="vadModelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="选择 VAD 模型" /></SelectTrigger>
                  <SelectContent>
                    {vadModels.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>ASR</Label>
            <Controller
              control={control}
              name="asrModelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="选择 ASR 模型" /></SelectTrigger>
                  <SelectContent>
                    {asrModels.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>LLM</Label>
            <Controller
              control={control}
              name="llmModelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="选择 LLM 模型" /></SelectTrigger>
                  <SelectContent>
                    {llmModels.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>VLLM</Label>
            <Controller
              control={control}
              name="vllmModelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="选择 VLLM 模型" /></SelectTrigger>
                  <SelectContent>
                    {vllmModels.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>记忆模型</Label>
            <Controller
              control={control}
              name="memModelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="选择 Memory 模型" /></SelectTrigger>
                  <SelectContent>
                    {memModels.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>意图识别</Label>
            <Controller
              control={control}
              name="intentModelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="选择 Intent 模型" /></SelectTrigger>
                  <SelectContent>
                    {intentModels.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>TTS</Label>
            <Controller
              control={control}
              name="ttsModelId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v)} disabled={voiceSource === 'mine'}>
                  <SelectTrigger><SelectValue placeholder="选择 TTS 模型" /></SelectTrigger>
                  <SelectContent>
                    {ttsModels.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.modelName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Label>音色来源</Label>
              <div className="flex gap-2">
                <Button type="button" variant={voiceSource === 'system' ? 'default' : 'outline'} size="sm" onClick={() => setVoiceSource('system')}>系统音色</Button>
                <Button type="button" variant={voiceSource === 'mine' ? 'default' : 'outline'} size="sm" onClick={() => setVoiceSource('mine')}>我的音色</Button>
                <GlobalVoiceKeyButton />
                {voiceSource === 'mine' && (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">管理我的音色</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>绑定音色（默认5个槽位）</DialogTitle>
                      </DialogHeader>
                      <MyVoiceManager onClose={() => setOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            <Controller
              control={control}
              name="ttsVoiceId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!ttsModelId || voices.isLoading || (voiceSource === 'mine' && ttsModelId !== 'TTS_CustomTTS')}>
                  <SelectTrigger>
                    <SelectValue placeholder={voiceSource === 'mine' ? '选择我的音色（自动使用自定义TTS）' : (!ttsModelId ? '请先选择 TTS 模型' : voices.isLoading ? '音色加载中...' : '选择音色')} />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.isLoading && (
                      <div className="px-2 py-1 text-sm text-muted-foreground">加载中...</div>
                    )}
                    {!voices.isLoading && (voices.data?.data || []).length === 0 && ttsModelId && (
                      <div className="px-2 py-1 text-sm text-muted-foreground">暂无可选音色</div>
                    )}
                    {!voices.isLoading && (voices.data?.data || []).map((v: any) => {
                      const label = v?.name ?? v?.voiceName ?? v?.modelName ?? v?.id
                      return (
                        <SelectItem key={String(v.id)} value={String(v.id)}>
                          {String(label)}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ModelSelectCard
