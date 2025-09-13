/**
 * 模型类型导航组件
 * 复刻Vue版左侧导航菜单
 */

import { cn } from '@/lib/utils'
import type { ModelType } from '@/types/model'

export interface ModelNavigationProps {
  activeTab: ModelType
  onMenuSelect: (modelType: ModelType) => void
}

// 导航菜单项配置
const menuItems = [
  { key: 'vad' as ModelType, label: 'Voice Activity Detection' },
  { key: 'asr' as ModelType, label: 'Speech Recognition' },
  { key: 'llm' as ModelType, label: 'Large Language Model' },
  { key: 'vllm' as ModelType, label: 'Vision Language Model' },
  { key: 'intent' as ModelType, label: 'Intent Recognition' },
  { key: 'tts' as ModelType, label: 'Text to Speech' },
  { key: 'memory' as ModelType, label: 'Memory' }
]

export function ModelNavigation({ activeTab, onMenuSelect }: ModelNavigationProps) {
  return (
    <div className="min-w-[240px] flex-shrink-0 bg-gradient-to-b from-purple-600/20 to-blue-600/20 backdrop-blur-sm">
      {/* 导航背景装饰 */}
      <div className="absolute inset-0 bg-[url('/model-bg.png')] bg-cover bg-center opacity-10" />
      
      <nav className="relative p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.key
          
          return (
            <button
              key={item.key}
              onClick={() => onMenuSelect(item.key)}
              className={cn(
                "w-full text-right px-4 py-3 rounded-l-lg transition-all duration-300",
                "flex items-center justify-end relative",
                "hover:transform hover:scale-105",
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25"
                  : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
              )}
            >
              {/* 激活状态的指示器 */}
              {isActive && (
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm" />
              )}
              
              <span className="text-sm font-medium pr-2">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}