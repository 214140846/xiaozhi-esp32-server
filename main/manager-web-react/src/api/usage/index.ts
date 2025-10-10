/**
 * TTS用量相关API接口
 */
import { apiClient } from '../../lib/api';
import type { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> { code: number; msg?: string; data: T }

export interface TtsUsageStatistics {
  totalChars: number;
  totalCalls: number;
  totalDuration: number;
  cloneChars: number;
  cloneCalls: number;
  ttsChars: number;
  ttsCalls: number;
  recordCount: number;
  totalCost?: number;
  cloneCost?: number;
  ttsCost?: number;
}

export interface UserUsageStatistics {
  userId: number;
  totalChars: number;
  totalCalls: number;
  cloneChars: number;
  cloneCalls: number;
  ttsChars: number;
  ttsCalls: number;
  recordCount: number;
}

export interface TtsUsageEntity {
  id: number;
  userId: number;
  agentId?: string;
  endpoint: 'clone' | 'tts';
  costChars: number;
  costCalls: number;
  durationMs: number;
  slotId?: string;
  createdAt: string;
  cost?: number;
}

export interface ResultTtsUsageStatistics extends ApiResponse<TtsUsageStatistics> {}
export interface ResultUserUsageStatisticsList extends ApiResponse<UserUsageStatistics[]> {}
export interface ResultTtsUsageEntityList extends ApiResponse<TtsUsageEntity[]> {}

export async function getMyUsageStatistics(
  query?: { period?: string; start?: string; end?: string },
  config?: AxiosRequestConfig
): Promise<ResultTtsUsageStatistics> {
  const url = '/tts/usage/mine/statistics';
  const res = await apiClient.get<ResultTtsUsageStatistics>(url, { ...(config ?? {}), params: query });
  return res.data;
}

export async function getAdminUsageStatistics(
  query?: { userId?: number; period?: string; start?: string; end?: string },
  config?: AxiosRequestConfig
): Promise<ResultTtsUsageStatistics> {
  const url = '/tts/usage/admin/statistics';
  const res = await apiClient.get<ResultTtsUsageStatistics>(url, { ...(config ?? {}), params: query });
  return res.data;
}

export async function getStatisticsByUser(
  query?: { period?: string; start?: string; end?: string },
  config?: AxiosRequestConfig
): Promise<ResultUserUsageStatisticsList> {
  const url = '/tts/usage/admin/statisticsByUser';
  const res = await apiClient.get<ResultUserUsageStatisticsList>(url, { ...(config ?? {}), params: query });
  return res.data;
}

export async function getMyUsageDetails(
  query?: { endpoint?: string; start?: string; end?: string; limit?: number },
  config?: AxiosRequestConfig
): Promise<ResultTtsUsageEntityList> {
  const url = '/tts/usage/mine';
  const res = await apiClient.get<ResultTtsUsageEntityList>(url, { ...(config ?? {}), params: query });
  return res.data;
}

export async function getAdminUsageDetails(
  query?: { userId?: number; endpoint?: string; start?: string; end?: string; limit?: number },
  config?: AxiosRequestConfig
): Promise<ResultTtsUsageEntityList> {
  const url = '/tts/usage/admin/list';
  const res = await apiClient.get<ResultTtsUsageEntityList>(url, { ...(config ?? {}), params: query });
  return res.data;
}

export async function exportMyUsage(
  query?: { endpoint?: string; start?: string; end?: string },
  config?: AxiosRequestConfig
): Promise<void> {
  const url = '/tts/usage/mine/export';
  const res = await apiClient.get(url, { ...(config ?? {}), params: query, responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '我的用量明细.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export async function exportAdminUsage(
  query?: { userId?: number; endpoint?: string; start?: string; end?: string },
  config?: AxiosRequestConfig
): Promise<void> {
  const url = '/tts/usage/admin/export';
  const res = await apiClient.get(url, { ...(config ?? {}), params: query, responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '用量明细.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

