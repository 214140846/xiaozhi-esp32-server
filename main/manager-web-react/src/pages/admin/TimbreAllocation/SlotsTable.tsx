import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save, Edit3, X } from "lucide-react";

export type BillingMode = "off" | "count" | "token" | "char";

export type RowData = {
  id: number;
  userId: string;
  userName: string;
  agentId?: string;
  ttsModelId?: string;
  slotId?: string;
  voiceId?: string;
  timbreName?: string;
  billingMode: BillingMode;
  limit?: number | null; // 计费限额（按模式）
  cloneLimit?: number | null; // 克隆上限（0/空不限）
  remark?: string;
}

interface SlotsTableProps {
  rows: RowData[]
  editingId: number | null
  onStartEdit: (id: number) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onUpdateRow: (id: number, patch: Partial<RowData>) => void
}

export default function SlotsTable({ rows, editingId, onStartEdit, onCancelEdit, onSaveEdit, onUpdateRow }: SlotsTableProps) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">用户</TableHead>
            <TableHead className="min-w-[320px]">当前音色与模型</TableHead>
            <TableHead className="w-[140px]">克隆上限</TableHead>
            <TableHead className="w-[180px]">扣费模式</TableHead>
            <TableHead className="w-[220px]">限额</TableHead>
            <TableHead className="min-w-[160px]">备注</TableHead>
            <TableHead className="w-[180px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const isEdit = r.id === editingId;
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="leading-tight">
                      <div className="font-medium">{r.userName}</div>
                      <div className="text-xs text-muted-foreground">UID: {r.userId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{r.timbreName || '未命名音色'}</div>
                    <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                      <Badge variant="secondary">slot: {r.slotId || '-'}</Badge>
                      {r.voiceId && <Badge variant="outline">voiceId: {r.voiceId}</Badge>}
                      {r.ttsModelId && <Badge variant="outline">model: {r.ttsModelId}</Badge>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {isEdit ? (
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-24 text-right"
                      placeholder="0不限"
                      value={r.cloneLimit ?? ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '')
                        onUpdateRow(r.id, { cloneLimit: v === '' ? null : Number(v) })
                      }}
                    />
                  ) : (
                    <span className="text-sm">{r.cloneLimit ?? '-'}</span>
                  )}
                </TableCell>
                <TableCell>
                  {isEdit ? (
                    <Select value={r.billingMode} onValueChange={(v) => onUpdateRow(r.id, { billingMode: v as BillingMode })}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">off</SelectItem>
                        <SelectItem value="count">count</SelectItem>
                        <SelectItem value="token">token</SelectItem>
                        <SelectItem value="char">char</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{r.billingMode}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isEdit ? (
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-32 text-right"
                      placeholder={r.billingMode === "count" ? "调用上限" : r.billingMode === "token" || r.billingMode === 'char' ? "Token/字符上限" : "不限"}
                      value={r.limit ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '')
                        onUpdateRow(r.id, { limit: v === '' ? null : Number(v) })
                      }}
                      disabled={r.billingMode === "off"}
                    />
                  ) : (
                    <span>{r.billingMode === "off" ? "-" : r.limit ?? "-"}</span>
                  )}
                </TableCell>
                <TableCell>
                  {isEdit ? (
                    <Input value={r.remark || ""} onChange={(e) => onUpdateRow(r.id, { remark: e.target.value })} placeholder="备注" />
                  ) : (
                    <span className="text-muted-foreground">{r.remark || "-"}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEdit ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={onCancelEdit}>
                        <X className="w-4 h-4 mr-1" />取消
                      </Button>
                      <Button size="sm" onClick={onSaveEdit}>
                        <Save className="w-4 h-4 mr-1" />保存
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => onStartEdit(r.id)}>
                      <Edit3 className="w-4 h-4 mr-1" />编辑
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
}
