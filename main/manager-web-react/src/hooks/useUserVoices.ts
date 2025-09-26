import { useEffect, useState } from 'react'
import { deleteUserVoice, getUserVoiceQuota, getUserVoices, updateUserVoice, uploadUserVoice, getUserVoiceSettings, setUserVoiceSettings, addUserVoiceByUrl } from '../api/userVoice'

export function useUserVoices() {
  const [list, setList] = useState<any[]>([])
  const [quota, setQuota] = useState<{ default: number; extra: number; total: number; used: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<{ apiKey?: string } | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const [l, q, s] = await Promise.all([getUserVoices(), getUserVoiceQuota(), getUserVoiceSettings()])
      setList(l)
      setQuota(q)
      setSettings(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return {
    list,
    quota,
    settings,
    loading,
    refresh,
    upload: uploadUserVoice,
    addByUrl: addUserVoiceByUrl,
    update: updateUserVoice,
    remove: deleteUserVoice,
    setSettings: setUserVoiceSettings,
  }
}
