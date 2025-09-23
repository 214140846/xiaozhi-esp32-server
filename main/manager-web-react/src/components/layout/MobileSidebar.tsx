import React from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { navItems } from './Sidebar'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const location = useLocation()
  const { publicConfig } = useAuth()
  const homeConfig = (publicConfig?.homeConfig || {}) as Record<string, any>
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

            <nav className="p-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = location.pathname === item.to
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    <span className={cn('text-gray-500 group-hover:text-current', active && 'text-white')}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileSidebar
