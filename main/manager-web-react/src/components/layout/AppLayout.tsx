import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { TopBar } from './TopBar'
import UserMenu from './UserMenu'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* 桌面侧边栏 */}
      <Sidebar />

      {/* 主区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 移动端顶部栏（全局通用） */}
        <TopBar onOpenSidebar={() => setMobileOpen(true)} right={<UserMenu compact />} />
        {children}
      </div>

      {/* 移动端侧边栏（全局通用） */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  )
}

export default AppLayout
