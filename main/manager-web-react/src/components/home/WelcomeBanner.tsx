import { Button } from '../ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ServerActionsButton } from '@/components/admin/ServerActionsButton'

export interface WelcomeBannerProps {
  /** 添加智能体回调 */
  onAddAgent: () => void;
  /** 统计数据 */
  agentCount?: number;
  deviceCount?: number;
  firmwareCount?: number;
  modelCount?: number;
}

/**
 * 欢迎横幅组件
 * 
 * 功能包括：
 * - 显示欢迎信息
 * - 添加智能体按钮
 * - 美观的渐变背景
 */
export function WelcomeBanner({ onAddAgent, agentCount = 0, deviceCount = 0, firmwareCount = 0, modelCount = 0 }: WelcomeBannerProps) {
  console.log('[WelcomeBanner] 渲染欢迎横幅');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative mb-6 sm:mb-8 min-h-[10rem] sm:min-h-[12rem] rounded-2xl overflow-hidden bg-gradient-to-r from-primary/15 to-accent/15 dark:from-primary/20 dark:to-accent/10"
    >
      {/* 背景装饰 */}
      <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-30'></div>
      
      {/* 主要内容 */}
      <div className="relative z-10 flex items-center">
        <div className="px-4 sm:px-10 lg:px-16 w-full py-4 sm:py-6">
          <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* 左侧文案区 */}
            <div className="text-foreground flex-1 min-w-0 max-w-2xl">
              {/* 问候语 */}
              <div className="space-y-2 mb-3 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight break-words">
                  你好，欢迎回来
                </h1>
                <h2 className="hidden md:block text-2xl lg:text-4xl font-bold leading-tight">
                  让我们开始
                  <span className="text-yellow-300 ml-2">美好的工作！</span>
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-1.5">
                  Hello, Let's have a wonderful day!
                </p>
              </div>

              {/* CTA 区域：移动端与桌面端分开样式 */}
              <div className="mt-3 sm:mt-0">
                {/* 移动端：单按钮全宽 */}
                <div className="flex sm:hidden w-full">
                  <Button
                    onClick={onAddAgent}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full w-full border-0 shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新建
                  </Button>
                </div>

                {/* 桌面端：主按钮 + 次按钮，更简洁 */}
                <div className="hidden sm:flex items-center gap-3">
                  <Button onClick={onAddAgent} className="px-6 py-3 rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    添加智能体
                  </Button>
                  <Button onClick={onAddAgent} variant="outline" className="rounded-full px-5 py-3">
                    立即开始
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {/* 管理员可见的服务端管理按钮 */}
                  <ServerActionsButton />
                </div>
              </div>

              {/* 统计概览：放在 Banner 上展示 */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: '智能体', value: agentCount },
                  { label: '设备', value: deviceCount },
                  { label: '固件', value: firmwareCount },
                  { label: '模型', value: modelCount },
                ].map((it) => (
                  <div key={it.label} className="rounded-lg border border-border bg-card/70 backdrop-blur-sm px-3 py-2 flex items-center justify-between min-w-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">{it.label}</span>
                    <span className="text-base sm:text-xl font-semibold text-foreground">{it.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧装饰图形（桌面端） */}
            <div className="hidden lg:flex flex-1 justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative w-64 h-40"
              >
                {/* 渐变圆圈 */}
                <div className="absolute right-2 top-1 w-28 h-28 bg-primary/20 rounded-full" />
                <div className="absolute right-10 bottom-0 w-16 h-16 bg-accent/30 rounded-full" />
                {/* 浮动卡片 */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 top-3 right-14 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg"
                >
                  <div className="h-4 w-24 bg-primary/30 rounded mb-2" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-40 bg-foreground/10 rounded" />
                    <div className="h-2.5 w-36 bg-foreground/10 rounded" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent"></div>
    </motion.div>
  );
}
