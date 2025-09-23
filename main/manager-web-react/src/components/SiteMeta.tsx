import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * 动态站点元信息：标题与favicon
 */
export function SiteMeta() {
  const { publicConfig } = useAuth()
  const homeConfig = (publicConfig?.homeConfig || {}) as Record<string, any>

  React.useEffect(() => {
    const siteTitle = (homeConfig.siteTitle || homeConfig.platformName || (publicConfig as any)?.name || '管理平台') as string
    if (siteTitle) {
      document.title = siteTitle
    }

    const iconUrl = (homeConfig.favicon || homeConfig.logo || '') as string
    if (iconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = iconUrl
    }
  }, [homeConfig, publicConfig])

  return null
}

export default SiteMeta

