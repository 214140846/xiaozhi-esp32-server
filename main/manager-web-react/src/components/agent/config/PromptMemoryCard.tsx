import { Controller, type Control } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  control: Control<any>
}

export function PromptMemoryCard({ control }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>提示与记忆</CardTitle>
        <CardDescription>用于约束风格、补充背景与总结记忆</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <div className="space-y-2">
          <Label htmlFor="systemPrompt">系统提示词</Label>
          <Controller control={control} name="systemPrompt" render={({ field }) => <Textarea id="systemPrompt" rows={6} placeholder="配置该角色的提示词" {...field} />} />
          </div>

          <div className="space-y-2">
          <Label htmlFor="summaryMemory">总结记忆</Label>
          <Controller control={control} name="summaryMemory" render={({ field }) => <Textarea id="summaryMemory" rows={4} placeholder="可选" {...field} />} />
          <p className="text-xs text-muted-foreground">用于摘要关键信息，提升持续对话一致性</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PromptMemoryCard
