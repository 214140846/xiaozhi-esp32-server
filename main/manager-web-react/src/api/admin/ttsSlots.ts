import { apiClient } from '@/lib/api'
import type { AxiosRequestConfig } from 'axios'

export interface TtsSlotAdminVO {
  userId?: number
  slotId: string
  ttsModelId?: string
  voiceId?: string
  name?: string
  previewUrl?: string
  quotaMode?: 'off' | 'count' | 'token' | 'char'
  ttsCallLimit?: number | null
  ttsTokenLimit?: number | null
  cloneLimit?: number | null
  cloneUsed?: number | null
  status?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ResultList<T> { code: number; msg?: string; data: T }

export async function adminListSlotsByUser(
  query?: { userId?: number | string; status?: string },
  config?: AxiosRequestConfig
): Promise<ResultList<TtsSlotAdminVO[]>> {
  const res = await apiClient.get<ResultList<TtsSlotAdminVO[]>>('/admin/tts/slots/by-user', { ...(config ?? {}), params: query })
  return res.data
}

export async function adminUpdateSlot(
  slotId: string,
  body: Partial<{ cloneLimit: number | null; quotaMode: string; ttsCallLimit: number | null; ttsTokenLimit: number | null; status: string }>,
  config?: AxiosRequestConfig
): Promise<ResultList<TtsSlotAdminVO>> {
  const res = await apiClient.put<ResultList<TtsSlotAdminVO>>(`/admin/tts/slots/${slotId}`, body, config)
  return res.data
}

export async function adminAllocateSlots(
  body: Partial<{ userId: number; count: number; cloneLimit: number | null; quotaMode: 'off'|'count'|'token'|'char'; ttsCallLimit: number | null; ttsTokenLimit: number | null; ttsModelId?: string }>,
  config?: AxiosRequestConfig
): Promise<ResultList<TtsSlotAdminVO[]>> {
  const res = await apiClient.post<ResultList<TtsSlotAdminVO[]>>(`/admin/tts/slots/allocate`, body, config)
  return res.data
}
