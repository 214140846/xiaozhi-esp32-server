import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface NewVoiceDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading?: boolean;
  canPublic?: boolean;
  onSubmit: (payload: { name?: string; fileUrls: string[]; isPublic?: boolean }) => void;
}

export function NewVoiceDialog({ open, onOpenChange, loading, onSubmit, canPublic }: NewVoiceDialogProps) {
  const [name, setName] = React.useState("");
  const [urlsText, setUrlsText] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);

  const handleCreate = () => {
    if (!name.trim()) {
      alert("请填写音色名称");
      return;
    }
    const lines = (urlsText || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length < 1) {
      alert("请至少填写一个文件URL");
      return;
    }
    onSubmit({ name: name.trim(), fileUrls: lines, isPublic });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建音色</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="voice-name">音色名称（必填）</Label>
            <Input id="voice-name" placeholder="请输入音色名称" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="voice-urls">文件URL（每行一个）</Label>
            <Textarea id="voice-urls" rows={5} placeholder="https://...\nhttps://..." value={urlsText} onChange={(e) => setUrlsText(e.target.value)} />
          </div>
          <div className="space-y-1 opacity-60">
            <Label>上传文件（占位）</Label>
            <input type="file" multiple accept="audio/*" disabled className="text-sm" />
            <div className="text-xs text-muted-foreground">当前版本请先上传到可访问地址后粘贴URL</div>
          </div>
          {canPublic ? (
            <div className="flex items-start justify-between pt-2 p-3 bg-muted/30 rounded-md">
              <div className="space-y-1 mr-3">
                <Label className="text-sm font-medium">公开到共享库</Label>
                <p className="text-xs text-muted-foreground">
                  开启后，该音色将对所有用户可见
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!loading}>取消</Button>
          <Button onClick={handleCreate} disabled={!!loading}>{loading ? "创建中..." : "创建"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewVoiceDialog;
