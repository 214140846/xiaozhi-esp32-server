import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { queryClient } from '@/lib/query-client';

export interface VoiceSlotSettingsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slotId: string | null;
  defaultName?: string;
  isSuperAdmin?: boolean;
  onSaved?: () => void;
}

export function VoiceSlotSettingsDialog({ open, onOpenChange, slotId, defaultName, isSuperAdmin, onSaved }: VoiceSlotSettingsDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [mirrorLoading, setMirrorLoading] = React.useState(false);
  const [name, setName] = React.useState(defaultName || '');
  const [isPublic, setIsPublic] = React.useState(false);
  const [boundModel, setBoundModel] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    if (!slotId) return;
    try {
      setLoading(true);
      const m = await apiClient.get(`/admin/tts/slots/${slotId}/mirror`);
      if (m?.data?.code === 0) {
        setIsPublic(!!m.data?.data?.public);
        const nm = m.data?.data?.name;
        if (nm && !name) setName(nm);
      }
      const d = await apiClient.get(`/tts/slots/${slotId}`);
      if (d?.data?.code === 0) setBoundModel(d.data?.data?.ttsModelId || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slotId]);

  React.useEffect(() => {
    if (open) fetchStatus();
  }, [open, fetchStatus]);

  const togglePublic = async (next: boolean) => {
    if (!slotId) return;
    try {
      setMirrorLoading(true);
      if (next) {
        await apiClient.put(`/admin/tts/slots/${slotId}/mirror`, { name: name || defaultName || '' });
      } else {
        await apiClient.delete(`/admin/tts/slots/${slotId}/mirror`);
      }
      setIsPublic(next);
      onSaved?.();
      // 使“模型音色下拉”失效刷新
      try {
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'ModelsVoices.GetVoiceList' && (!boundModel || (q.queryKey[1] as any)?.modelId === boundModel),
        });
      } catch {}
    } catch (e) {
      console.error(e);
      alert('更新公开状态失败');
    } finally {
      setMirrorLoading(false);
    }
  };

  const saveName = async () => {
    if (!slotId) return;
    try {
      setMirrorLoading(true);
      const ms = await apiClient.get(`/admin/tts/slots/${slotId}/mirror`);
      const isPub = !!ms?.data?.data?.public;
      if (!isPub) {
        alert('当前音色未公开，请先开启“公开到共享库”');
        return;
      }
      await apiClient.put(`/admin/tts/slots/${slotId}/mirror`, { name: name || defaultName || '' });
      onSaved?.();
      try {
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'ModelsVoices.GetVoiceList' && (!boundModel || (q.queryKey[1] as any)?.modelId === boundModel),
        });
      } catch {}
    } catch (e) {
      console.error(e);
      alert('保存名称失败');
    } finally {
      setMirrorLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="vname">展示名称</Label>
            <Input id="vname" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="text-sm text-muted-foreground">模型绑定：{boundModel ? '已绑定' : '未绑定（创建将自动补绑默认TTS）'}</div>
          {isSuperAdmin ? (
            <div className="flex items-center justify-between">
              <Label className="mr-3">公开到共享库</Label>
              <Switch checked={isPublic} onCheckedChange={togglePublic} disabled={mirrorLoading || loading} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">仅管理员可设置公开到共享库</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
          <Button onClick={saveName} disabled={mirrorLoading || loading}>保存名称</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VoiceSlotSettingsDialog;
