import React from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { navItems } from './navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { publicConfig, state } = useAuth()
  // 根据当前登录用户判断是否管理员（随状态变化而刷新）
  const isAdmin = React.useMemo(() => {
    const u: any = state?.user || {}
    if (u?.roleType === 'superAdmin' || u?.superAdmin === 1) return true
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('userInfo') : null
      if (raw) {
        const cached = JSON.parse(raw as any)
        if (cached?.roleType === 'superAdmin' || cached?.superAdmin === 1) return true
      }
    } catch {}
    return false
  }, [state?.user])
  const homeConfig = (publicConfig?.homeConfig || {}) as Record<string, unknown>
  const platformSubTitle = (homeConfig.platformSubTitle || '管理平台') as string

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-sidebar"
          className="md:hidden fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* 侧边抽屉 */}
          <motion.aside
            className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-800 flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="font-semibold">{platformSubTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={onClose} aria-label="关闭菜单" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <nav className="p-2 space-y-0.5 overflow-y-auto">
              {navItems
                .filter((item)=>{
                  if (isAdmin) return true
                  // 非管理员仅可见：概览、音色管理、用量统计
                  return item.to === '/home' || item.to === '/voice-slot-management' || item.to === '/usage-statistics'
                })
                .map((item) => (
                <NavLink
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors overflow-hidden',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                  end={item.to === '/home'}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 rounded-md bg-primary"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        />
                      )}
                      <span className={cn('relative z-10 text-muted-foreground group-hover:text-foreground', isActive && 'text-primary-foreground')}>{item.icon}</span>
                      <span className="relative z-10 truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileSidebar
