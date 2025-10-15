import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Plus, Play, Pause, Mic, Settings, RefreshCw, Volume2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/lib/api';
import NewVoiceDialog from '@/components/voice/NewVoiceDialog';
import RerecordVoiceDialog from '@/components/voice/RerecordVoiceDialog';
import { useAuth } from '@/contexts/AuthContext';
import VoiceSlotSettingsDialog from '@/components/voice/VoiceSlotSettingsDialog';
import { queryClient } from '@/lib/query-client';

interface VoiceSlot {
  id: string;
  name: string;
  description?: string;
  usedQuota: number;
  totalQuota: number; // 0或缺省代表不限
  isPlaying: boolean;
  createdAt: string;
  status: 'active' | 'processing' | 'error';
}

type TtsSlotVO = {
  slotId: string;
  name?: string;
  voiceId?: string;
  cloneLimit?: number | null;
  cloneUsed?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

export function VoiceSlotManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceSlots, setVoiceSlots] = useState<VoiceSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rerecordOpen, setRerecordOpen] = useState(false);
  const [rerecordLoading, setRerecordLoading] = useState(false);
  const [rerecordSlotId, setRerecordSlotId] = useState<string | null>(null);
  const [slotLimit, setSlotLimit] = useState<number | null>(null);
  const [slotUsed, setSlotUsed] = useState<number>(0);
  const { state: authState } = useAuth();
  const isSuperAdmin = React.useMemo(() => {
    // 1) 来自 AuthContext 的用户信息（登录后优先）
    const u: any = authState?.user || null;
    const hitCtx = !!u && (
      u?.roleType === 'superAdmin' ||
      u?.superAdmin === 1 || u?.superAdmin === '1' || u?.superAdmin === true || u?.superAdmin === 'true'
    );
    if (hitCtx) return true;

    // 2) 兜底：localStorage.userInfo（刷新后仍可识别）
    try {
      const ui = typeof window !== 'undefined' ? window.localStorage.getItem('userInfo') : null;
      if (ui) {
        const parsed = JSON.parse(ui);
        if (
          parsed?.roleType === 'superAdmin' ||
          parsed?.superAdmin === 1 || parsed?.superAdmin === '1' || parsed?.superAdmin === true || parsed?.superAdmin === 'true'
        ) return true;
      }
    } catch {}
    return false;
  }, [authState?.user]);
  // 兜底：页面内主动探测管理员（直接请求 /user/info）
  const [adminProbe, setAdminProbe] = useState<boolean>(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isSuperAdmin) { if (mounted) setAdminProbe(true); return; }
      try {
        const res = await apiClient.get('/user/info');
        const u = res?.data?.data;
        const sv: any = u?.superAdmin;
        const ok = sv === 1 || sv === true || sv === '1' || sv === 'true';
        if (ok && mounted) {
          setAdminProbe(true);
          try { window.localStorage.setItem('userInfo', JSON.stringify(u)); } catch {}
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [isSuperAdmin]);
  const admin = isSuperAdmin || adminProbe;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSlotId, setSettingsSlotId] = useState<string | null>(null);
  const [settingsSlotName, setSettingsSlotName] = useState<string | undefined>('');

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tts/slots/mine');
      const { code, data } = res.data || {};
      if (code !== 0) throw new Error((res.data && res.data.msg) || '获取音色失败');
      const items: VoiceSlot[] = (Array.isArray(data) ? data : []).map((v: TtsSlotVO) => ({
        id: v.slotId,
        name: v.name || `Slot ${v.slotId}`,
        description: v.voiceId || '',
        usedQuota: Number(v.cloneUsed || 0),
        totalQuota: Number(v.cloneLimit || 0),
        isPlaying: false,
        createdAt: (v.createdAt && String(v.createdAt).slice(0, 10)) || '',
        status: (v.status === 'disabled' ? 'error' : 'active') as VoiceSlot['status'],
      }));
      setVoiceSlots(items);
      // 拉取当前用户的音色配额概览
      try {
        const q = await apiClient.get('/tts/slots/quota');
        if (q?.data?.code === 0) {
          setSlotLimit(Number(q.data?.data?.slotsLimit ?? 0));
          setSlotUsed(Number(q.data?.data?.slotsUsed ?? 0));
        }
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 过滤音色
  const filteredVoiceSlots = voiceSlots.filter(voice =>
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 计算配额使用百分比
  const getQuotaPercentage = (used: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Math.round((used / total) * 100);
  };

  // 获取状态颜色
  const getStatusColor = (status: VoiceSlot['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 获取状态文本
  const getStatusText = (status: VoiceSlot['status']) => {
    switch (status) {
      case 'active':
        return '正常';
      case 'processing':
        return '处理中';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  // 试听音色
  const handlePlayVoice = (voiceId: string) => {
    if (isPlaying === voiceId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(voiceId);
    }
  };

  // 克隆音色
  const handleCloneVoice = (voiceId: string) => {
    console.log('克隆音色:', voiceId);
  };

  const handleDeleteVoice = async (slotId: string) => {
    if (!admin) {
      alert('仅管理员可删除音色');
      return;
    }
    if (!confirm('确定要删除该音色及其镜像与历史吗？')) return;
    try {
      await apiClient.delete(`/admin/tts/slots/${slotId}`);
      fetchSlots();
      // 删除后让模型音色下拉刷新（无法得知具体模型，粗暴失效全量）
      try {
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'ModelsVoices.GetVoiceList',
        });
      } catch {}
    } catch (e) {
      console.error(e);
      alert('删除失败');
    }
  };

  // 重录音色
  const handleRerecordVoice = (slotId: string) => {
    setRerecordSlotId(slotId);
    setRerecordOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题和操作区域 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">音色管理</h1>
          <p className="text-muted-foreground">管理和配置您的TTS音色</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            已用音色额度: <span className="font-medium text-foreground">{slotUsed}/{admin ? '∞' : (slotLimit != null && slotLimit > 0 ? slotLimit : '-')}</span>
          </div>
          <Button className="shrink-0" onClick={() => setCreateOpen(true)} disabled={!admin && slotLimit != null && slotLimit > 0 && slotUsed >= slotLimit}>
            <Plus className="w-4 h-4 mr-2" />
            新建音色
          </Button>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索音色名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchSlots} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 侧栏提示 */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-medium">使用提示</p>
            <p className="text-sm text-muted-foreground">
              您可以通过克隆现有音色或重新录音来创建新的音色。每个音色都有使用配额限制，请合理分配使用。
            </p>
            {admin && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium">管理员功能：</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>可以删除任意音色</li>
                  <li>创建音色时可选择公开到共享库</li>
                  <li>可以调整音色参数设置</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 音色卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredVoiceSlots.map((voice) => (
            <motion.div
              key={voice.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{voice.name}</CardTitle>
                      {voice.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {voice.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(voice.status)} mt-2`} />
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  {/* 配额显示 */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">重录配额</span>
                      <span className="font-medium">{voice.usedQuota}/{voice.totalQuota > 0 ? voice.totalQuota : '不限'}</span>
                    </div>
                    <Progress
                      value={getQuotaPercentage(voice.usedQuota, voice.totalQuota)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>已用: {voice.usedQuota}</span>
                      <span>剩余: {voice.totalQuota > 0 ? Math.max(voice.totalQuota - voice.usedQuota, 0) : '-'}</span>
                    </div>
                  </div>

                  {/* 状态显示 */}
                  <div className="mb-4">
                    <Badge variant={voice.status === 'active' ? 'default' : 'secondary'}>
                      {getStatusText(voice.status)}
                    </Badge>
                  </div>

                  {/* 操作按钮 */}
                  <div className="mt-auto space-y-2">
                    <TooltipProvider>
                      <div className="grid grid-cols-2 gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePlayVoice(voice.id)}
                              className="w-full"
                            >
                              {isPlaying === voice.id ? (
                                <Pause className="w-3 h-3 mr-1" />
                              ) : (
                                <Play className="w-3 h-3 mr-1" />
                              )}
                              {isPlaying === voice.id ? '停止' : '试听'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>试听音色效果</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRerecordVoice(voice.id)}
                              disabled={!admin && voice.totalQuota > 0 && voice.usedQuota >= voice.totalQuota}
                              className="w-full"
                            >
                              <Mic className="w-3 h-3 mr-1" />
                              重录
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>重新录制音色</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => { setSettingsSlotId(voice.id); setSettingsSlotName(voice.name); setSettingsOpen(true); }}
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              设置
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>音色参数设置</TooltipContent>
                        </Tooltip>
                      </div>
                      {/* 删除按钮 - 仅管理员可见 */}
                      {admin && (
                        <div className="grid grid-cols-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteVoice(voice.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> 删除
                          </Button>
                        </div>
                      )}
                    </TooltipProvider>
                  </div>

                  {/* 创建时间 */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      创建时间: {voice.createdAt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 空状态 */}
      {filteredVoiceSlots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Volume2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? '未找到匹配的音色' : '暂无音色'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? '请尝试其他搜索关键词' : '点击上方按钮创建您的第一个音色'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建音色
            </Button>
          )}
        </div>
      )}

      <NewVoiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        loading={creating}
        canPublic={admin}
        onSubmit={async (payload) => {
          try {
            setCreating(true);
            const res = await apiClient.post('/ttsVoice/clone', payload);
            const { code, msg } = res.data || {};
            if (code !== 0) throw new Error(msg || '创建失败');
            // 不论是否管理员，都尝试获取 slot 关联的 TTS 模型并失效对应音色下拉缓存
            try {
              const slotId: string | undefined = res.data?.data?.slotId;
              const voiceId: string | undefined = res.data?.data?.voiceId;
              const previewUrl: string | undefined = res.data?.data?.previewUrl;

              if (slotId) {
                const d = await apiClient.get(`/tts/slots/${slotId}`);
                if (d?.data?.code === 0) {
                  const ttsModelId: string | undefined = d.data?.data?.ttsModelId;

                  // 管理员且选择公开时，同步镜像到共享音色库
                  if (payload.isPublic && isSuperAdmin && voiceId && ttsModelId) {
                    try {
                      await apiClient.post('/ttsVoice', {
                        languages: 'zh',
                        name: payload.name || `Slot ${slotId}`,
                        remark: '',
                        referenceAudio: '',
                        referenceText: '',
                        sort: 0,
                        ttsModelId,
                        ttsVoice: voiceId,
                        voiceDemo: previewUrl || '',
                      });
                    } catch (e) {
                      console.error('公开到共享库失败:', e);
                    }
                  }

                  // 失效“模型音色”下拉缓存，确保智能体配置页能拿到最新音色
                  if (ttsModelId) {
                    try {
                      await queryClient.invalidateQueries({
                        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'ModelsVoices.GetVoiceList' && (q.queryKey[1] as any)?.modelId === ttsModelId,
                      });
                    } catch {}
                  }
                }
              }
            } catch {}
            setCreateOpen(false);
            fetchSlots();
          } catch (e) {
            console.error(e);
            alert((e as Error).message || '创建失败');
          } finally {
            setCreating(false);
          }
        }}
      />

      <VoiceSlotSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        slotId={settingsSlotId}
        defaultName={settingsSlotName}
        isSuperAdmin={admin}
        onSaved={fetchSlots}
      />

      <RerecordVoiceDialog
        open={rerecordOpen}
        onOpenChange={(v) => { setRerecordOpen(v); if (!v) setRerecordSlotId(null); }}
        loading={rerecordLoading}
        onSubmit={async ({ fileUrls }) => {
          if (!rerecordSlotId) { setRerecordOpen(false); return; }
          try {
            setRerecordLoading(true);
            const res = await apiClient.post('/ttsVoice/clone', { slotId: rerecordSlotId, fileUrls });
            const { code, msg } = res.data || {};
            if (code !== 0) throw new Error(msg || '重录失败');
            // 失效模型音色下拉缓存（按slot取ttsModelId）
            try {
              const d = await apiClient.get(`/tts/slots/${rerecordSlotId}`);
              if (d?.data?.code === 0) {
                const ttsModelId: string | undefined = d.data?.data?.ttsModelId;
                if (ttsModelId) {
                  try {
                    await queryClient.invalidateQueries({
                      predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'ModelsVoices.GetVoiceList' && (q.queryKey[1] as any)?.modelId === ttsModelId,
                    });
                  } catch {}
                }
              }
            } catch {}
            setRerecordOpen(false);
            fetchSlots();
          } catch (e) {
            console.error(e);
            alert((e as Error).message || '重录失败');
          } finally {
            setRerecordLoading(false);
          }
        }}
      />
    </div>
  );
}

export default VoiceSlotManagement;
