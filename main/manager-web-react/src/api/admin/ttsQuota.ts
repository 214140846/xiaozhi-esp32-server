import { apiClient } from '@/lib/api'
import type { AxiosRequestConfig } from 'axios'

export interface TtsQuotaVO {
  slots?: number | null
  slotsRemain?: number | null
  slotsLimit?: number | null
  slotsUsed?: number | null
  slotsRemaining?: number | null
  charLimit?: number | null
  callLimit?: number | null
  charUsed?: number | null
  callUsed?: number | null
}

export interface Result<T> { code: number; msg?: string; data: T }

export async function adminGetQuota(userId: number | string, config?: AxiosRequestConfig): Promise<Result<TtsQuotaVO>> {
  const res = await apiClient.get<Result<TtsQuotaVO>>(`/tts/quota/${userId}`, config)
  return res.data
}

export async function adminUpdateQuota(
  userId: number | string,
  body: Partial<{ userId: number; charLimit: number | null; callLimit: number | null; slots: number | null }>,
  config?: AxiosRequestConfig,
): Promise<Result<void>> {
  const payload = { ...body, userId }
  const res = await apiClient.put<Result<void>>(`/tts/quota/${userId}`, payload, config)
  return res.data
}
