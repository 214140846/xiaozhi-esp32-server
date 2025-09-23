import React from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import UserMenu from './UserMenu'
import { useAuth } from '@/contexts/AuthContext'

interface TopBarProps {
  onOpenSidebar: () => void
  title?: string
  right?: React.ReactNode
}

// 全局移动端顶部栏：仅在小屏显示，提供主题切换与侧边栏开关
export function TopBar({ onOpenSidebar, title, right }: TopBarProps) {
  const { publicConfig } = useAuth()
  const homeConfig = (publicConfig?.homeConfig || {}) as Record<string, any>
  const platformSubTitle = (homeConfig.platformSubTitle || '管理平台') as string
  const showTitle = title ?? platformSubTitle
  return (
    <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <div className="px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="outline" size="icon" onClick={onOpenSidebar} aria-label="打开菜单">
            <Menu className="h-4 w-4" />
          </Button>
          <span className="font-semibold truncate">{showTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {right ?? <UserMenu compact />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default TopBar
