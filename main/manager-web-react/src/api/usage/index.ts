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

function csvEscape(val: any): string {
  const s = val == null ? '' : String(val);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function downloadCsv(filename: string, csv: string) {
  // 加入 UTF-8 BOM 便于 Excel 识别
  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function buildCsv(rows: TtsUsageEntity[], isAdmin: boolean): string {
  const headers = [
    '创建时间', '端点类型', '字符数', '调用次数', '时长(毫秒)'
  ].concat(isAdmin ? ['用户ID'] : []).concat(['Agent ID','音色位ID','成本']);
  const lines = [headers.join(',')];
  for (const r of rows) {
    const cols = [
      new Date(r.createdAt).toLocaleString('zh-CN'),
      r.endpoint,
      r.costChars,
      r.costCalls,
      r.durationMs,
    ];
    if (isAdmin) cols.push((r.userId ?? '') as any);
    cols.push(r.agentId ?? '');
    cols.push(r.slotId ?? '');
    cols.push((r as any).cost ?? 0);
    lines.push(cols.map(csvEscape).join(','));
  }
  return lines.join('\n');
}

export async function exportMyUsage(
  query?: { endpoint?: string; start?: string; end?: string },
  _config?: AxiosRequestConfig
): Promise<void> {
  // 后端无导出端点，使用明细在前端生成 CSV
  const res = await getMyUsageDetails({ ...query, limit: 1000 });
  const rows = res?.data || [];
  const csv = buildCsv(rows as any, false);
  downloadCsv('我的用量明细.csv', csv);
}

export async function exportAdminUsage(
  query?: { userId?: number; endpoint?: string; start?: string; end?: string },
  _config?: AxiosRequestConfig
): Promise<void> {
  // 前端生成 CSV，包含用户ID列
  const res = await getAdminUsageDetails({ ...query, limit: 2000 });
  const rows = res?.data || [];
  const csv = buildCsv(rows as any, true);
  downloadCsv('用量明细.csv', csv);
}
