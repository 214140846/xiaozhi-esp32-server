import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface RerecordVoiceDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading?: boolean;
  onSubmit: (payload: { fileUrls: string[] }) => void;
}

export function RerecordVoiceDialog({ open, onOpenChange, loading, onSubmit }: RerecordVoiceDialogProps) {
  const [urlsText, setUrlsText] = React.useState("");

  const handleRerecord = () => {
    const lines = (urlsText || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length < 1) {
      alert("请至少填写一个文件URL");
      return;
    }
    onSubmit({ fileUrls: lines });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重录音色</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="voice-urls">新参考音频URL（每行一个）</Label>
            <Textarea id="voice-urls" rows={5} placeholder="https://...\nhttps://..." value={urlsText} onChange={(e) => setUrlsText(e.target.value)} />
          </div>
          <div className="space-y-1 opacity-60">
            <Label>上传文件（占位）</Label>
            <input type="file" multiple accept="audio/*" disabled className="text-sm" />
            <div className="text-xs text-muted-foreground">当前版本请先上传到可访问地址后粘贴URL</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!loading}>取消</Button>
          <Button onClick={handleRerecord} disabled={!!loading}>{loading ? "重录中..." : "确定重录"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RerecordVoiceDialog;
