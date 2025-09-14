import { useEffect } from 'react'
import { Controller, type Control, useWatch } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useModelList, useModelVoices } from '@/hooks/models/useModelList'

type Props = {
  control: Control<any>
}

export function ModelSelectCard({ control }: Props) {
  // 模型列表
  const { models: vadModels } = useModelList({ modelType: 'vad', page: 1, limit: 100 })
  const { models: asrModels } = useModelList({ modelType: 'asr', page: 1, limit: 100 })
  const { models: llmModels } = useModelList({ modelType: 'llm', page: 1, limit: 100 })
  const { models: vllmModels } = useModelList({ modelType: 'vllm', page: 1, limit: 100 })
  const { models: memModels } = useModelList({ modelType: 'memory', page: 1, limit: 100 })
  const { models: intentModels } = useModelList({ modelType: 'intent', page: 1, limit: 100 })
  const { models: ttsModels } = useModelList({ modelType: 'tts', page: 1, limit: 100 })

  const ttsModelId = useWatch({ control, name: 'ttsModelId' }) as string
  const voices = useModelVoices(ttsModelId)

  // 切换 TTS 模型时清空音色
  useEffect(() => {
    // react-hook-form: 通过 Controller 的 onChange 清空值
  }, [ttsModelId])

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
                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
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
            <Label>音色</Label>
            <Controller
              control={control}
              name="ttsVoiceId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!ttsModelId || voices.isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={!ttsModelId ? '请先选择 TTS 模型' : voices.isLoading ? '音色加载中...' : '选择音色'} />
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
