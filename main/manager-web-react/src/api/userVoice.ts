import { apiClient } from '../lib/api'

export type UserVoice = {
  id: string
  name: string
  tosUrl: string
  apiKey?: string
}

export async function getUserVoices() {
  const res = await apiClient.get<{ code: number; data: UserVoice[] }>(`/userVoice/list`)
  return res.data.data || []
}

export async function getUserVoiceQuota() {
  const res = await apiClient.get<{ code: number; data: { default: number; extra: number; total: number; used: number } }>(`/userVoice/quota`)
  return res.data.data
}

export async function uploadUserVoice(file: File, name: string, apiKey?: string) {
  const form = new FormData()
  form.append('file', file)
  form.append('name', name)
  const res = await apiClient.post<{ code: number; data: UserVoice }>(`/userVoice/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function updateUserVoice(id: string, body: { name: string }) {
  const res = await apiClient.put(`/userVoice/${id}`, body)
  return res.data
}

export async function deleteUserVoice(id: string) {
  const res = await apiClient.delete(`/userVoice/${id}`)
  return res.data
}

export async function addUserVoiceByUrl(name: string, url: string) {
  const res = await apiClient.post(`/userVoice/addByUrl`, { name, url })
  return res.data
}

export async function getUserVoiceSettings() {
  const res = await apiClient.get<{ code: number; data: { apiKey?: string } }>(`/userVoice/settings`)
  return res.data.data
}

export async function setUserVoiceSettings(data: { apiKey?: string }) {
  const res = await apiClient.put(`/userVoice/settings`, data)
  return res.data
}
