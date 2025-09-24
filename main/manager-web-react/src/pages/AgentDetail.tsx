import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentGetAgentByIdQuery } from '@/hooks/agent/generatedHooks'
import ConfigTab from '@/components/agent/ConfigTab'
import { DeviceManagement } from './DeviceManagement'
import { SessionsTab } from '@/components/agent/SessionsTab'
import { VoicePrintTab } from '@/components/agent/VoicePrintTab'
import { McpTab } from '@/components/agent/McpTab'
import { AudioTab } from '@/components/agent/AudioTab'
import { EmotionTab } from '@/components/agent/EmotionTab'

type TabKey = 'config' | 'sessions' | 'devices' | 'voice' | 'mcp' | 'audio' | 'emotions'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'config', label: '配置' },
  { key: 'sessions', label: '会话' },
  { key: 'devices', label: '设备' },
  { key: 'voice', label: '声纹' },
  { key: 'mcp', label: 'MCP' },
  { key: 'audio', label: '音频' },
  { key: 'emotions', label: '表情包' },
]

export default function AgentDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const [sp, setSp] = useSearchParams()
  const initialTab = (sp.get('tab') as TabKey) || 'sessions'
  const [active, setActive] = useState<TabKey>(initialTab)

  const { data, isLoading } = useAgentGetAgentByIdQuery({ id })
  const agentName = useMemo(() => data?.data?.agentName ?? '', [data])

  const onSwitch = (k: TabKey) => {
    setActive(k)
    setSp((prev) => {
      const n = new URLSearchParams(prev)
      n.set('tab', k)
      return n
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏：移动端自适应换行 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-semibold text-foreground">详情</h1>
          <Separator orientation="vertical" className="hidden sm:block h-5" />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {active !== 'config' && <span>ID: {id}</span>}
            {agentName && <span>名称: {agentName}</span>}
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <Input placeholder="在页内搜索..." className="w-full sm:w-64" />
        </div>
      </div>

      {/* 标签切换：移动端下拉 + 横向滚动按钮组 */}
      <div className="px-4 sm:px-6 pt-3 sticky top-0 bg-background z-10">
        {/* 移动端：下拉选择 */}
        <div className="sm:hidden mb-2">
          <Select value={active} onValueChange={(val) => onSwitch(val as TabKey)}>
            <SelectTrigger aria-label="选择页面标签">
              <SelectValue placeholder="选择标签" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map((t) => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* 桌面端：横向滚动的按钮组 */}
        <div className="hidden sm:block">
          <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {tabs.map((t) => (
                <Button
                  key={t.key}
                  variant={active === t.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSwitch(t.key)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <AnimatePresence mode="wait">
            {active === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <ConfigTab agentId={id} />
              </motion.div>
            )}
            {active === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <SessionsTab agentId={id} />
              </motion.div>
            )}

            {active === 'devices' && (
              <motion.div
                key="devices"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-2"
              >
                <DeviceManagement agentIdProp={id} />
              </motion.div>
            )}

            {active === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <VoicePrintTab agentId={id} />
              </motion.div>
            )}

            {active === 'mcp' && (
              <motion.div
                key="mcp"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <McpTab agentId={id} />
              </motion.div>
            )}

            {active === 'audio' && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <AudioTab agentId={id} />
              </motion.div>
            )}
            {active === 'emotions' && (
              <motion.div
                key="emotions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <EmotionTab agentId={id} />
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  )
}
