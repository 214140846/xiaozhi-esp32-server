/**
 * TTS音色管理对话框组件
 * 专门用于TTS模型的音色管理功能
 */

import { useState } from 'react'
import { X, Volume2, Play, Pause } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useModelVoices } from '@/hooks/useModelList'
import type { ModelConfig } from '@/types/model'

export interface TtsVoiceDialogProps {
  visible: boolean
  ttsModelId: number
  modelConfig: ModelConfig | null
  onClose: () => void
}

export function TtsVoiceDialog({
  visible,
  ttsModelId,
  modelConfig,
  onClose
}: TtsVoiceDialogProps) {
  const [voiceSearch, setVoiceSearch] = useState('')
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

  // 查询音色列表
  const { data: voicesResponse, isLoading } = useModelVoices(ttsModelId, voiceSearch)
  const voices = voicesResponse?.data || []

  // 处理音色试听
  const handlePlayVoice = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null)
      // 这里可以添加停止播放的逻辑
    } else {
      setPlayingVoice(voiceId)
      // 这里可以添加播放音色预览的逻辑
      setTimeout(() => {
        setPlayingVoice(null) // 模拟播放完成
      }, 3000)
    }
  }

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="glass-container max-w-4xl border-0 shadow-2xl">
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
            <Volume2 className="w-6 h-6" />
            Voice Management - {modelConfig?.modelName}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* 模型信息 */}
          <div className="glass-card p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-white/70">Model ID</Label>
                <p className="text-white font-mono">{modelConfig?.id}</p>
              </div>
              <div>
                <Label className="text-white/70">Provider</Label>
                <p className="text-white">{modelConfig?.configJson?.type || 'Unknown'}</p>
              </div>
              <div>
                <Label className="text-white/70">Status</Label>
                <Badge 
                  variant={modelConfig?.isEnabled === 1 ? "default" : "secondary"}
                  className={modelConfig?.isEnabled === 1 ? "bg-green-500" : "bg-gray-500"}
                >
                  {modelConfig?.isEnabled === 1 ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="voiceSearch" className="text-white/90">Search Voices</Label>
              <Input
                id="voiceSearch"
                value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                placeholder="Enter voice name to search"
                className="glass-input mt-1"
              />
            </div>
            <Button
              onClick={() => {/* 触发重新搜索 */}}
              className="cyber-button mt-6"
            >
              Search
            </Button>
          </div>

          {/* 音色列表 */}
          <div className="glass-card rounded-lg overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Available Voices</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-white/70">Loading voices...</span>
                </div>
              ) : voices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-white/70">
                  <Volume2 className="w-12 h-12 mb-2 opacity-50" />
                  <p>No voices found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/90">Voice ID</TableHead>
                      <TableHead className="text-white/90">Voice Name</TableHead>
                      <TableHead className="text-white/90">Language</TableHead>
                      <TableHead className="text-white/90">Gender</TableHead>
                      <TableHead className="text-white/90 text-center">Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voices.map((voice: any, index: number) => (
                      <TableRow 
                        key={voice.id || index} 
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <TableCell className="text-white/90 font-mono text-sm">
                          {voice.id || `voice-${index}`}
                        </TableCell>
                        <TableCell className="text-white/90 font-medium">
                          {voice.name || `Voice ${index + 1}`}
                        </TableCell>
                        <TableCell className="text-white/90">
                          <Badge variant="outline" className="border-white/30 text-white/70">
                            {voice.language || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/90">
                          <Badge 
                            variant="outline" 
                            className={`border-white/30 ${
                              voice.gender === 'female' ? 'text-pink-300' : 
                              voice.gender === 'male' ? 'text-blue-300' : 'text-white/70'
                            }`}
                          >
                            {voice.gender || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayVoice(voice.id || `voice-${index}`)}
                            className="glass-button hover:bg-purple-500/20"
                          >
                            {playingVoice === (voice.id || `voice-${index}`) ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="glass-button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}