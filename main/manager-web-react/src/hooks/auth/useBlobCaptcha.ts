import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export interface BlobCaptchaData {
  captchaId: string
  captchaUrl: string
}

export function useBlobCaptcha() {
  const { generateCaptcha } = useAuth()
  const objectUrlRef = useRef<string | null>(null)
  const [captchaData, setCaptchaData] = useState<BlobCaptchaData | null>(null)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refreshCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true)
      setError(null)
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      const { captchaId, captchaUrl } = await generateCaptcha()
      objectUrlRef.current = captchaUrl
      setCaptchaData({ captchaId, captchaUrl })
    } catch (e: any) {
      setError(e)
      setCaptchaData(null)
    } finally {
      setCaptchaLoading(false)
    }
  }, [generateCaptcha])

  useEffect(() => {
    // 首次进入自动刷新一次验证码
    refreshCaptcha()
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [refreshCaptcha])

  return {
    captchaData,
    captchaLoading,
    error,
    refreshCaptcha,
  }
}

