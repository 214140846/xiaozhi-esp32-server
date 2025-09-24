import { apiClient } from '../lib/api'
import type { AgentEmotionAsset } from '@/types/emotion'

export async function listAgentEmotions(agentId: string): Promise<AgentEmotionAsset[]> {
  const url = `/emotion/list/agent/${agentId}`
  const res = await apiClient.get<{ code: number; data: AgentEmotionAsset[] }>(url)
  return res.data?.data ?? []
}

export async function uploadAgentEmotion(agentId: string, code: string, file: File, emoji?: string): Promise<AgentEmotionAsset> {
  const url = `/emotion/${encodeURIComponent(agentId)}/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('code', code)
  if (emoji) form.append('emoji', emoji)
  const res = await apiClient.post<{ code: number; data: AgentEmotionAsset }>(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if ((res.data as any)?.code !== 0) throw new Error('上传失败')
  return res.data.data
}
