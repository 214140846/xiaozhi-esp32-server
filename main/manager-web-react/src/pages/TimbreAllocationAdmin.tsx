import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, ShieldAlert } from "lucide-react";
import { useUserDetailQuery } from '@/hooks/user';
import { useQuery } from '@tanstack/react-query';
import { adminUsersPageUser } from '@/api/admin/generated';
import { useToast } from '@/components/ui/use-toast';
import { adminGetQuota, adminUpdateQuota, type TtsQuotaVO } from '@/api/admin/ttsQuota';
import UserSlotsDialog from './admin/TimbreAllocation/UserSlotsDialog';

export default function TimbreAllocationAdmin() {
  const { data: userRes } = useUserDetailQuery();
  const isAdmin = useMemo(() => {
    const d: any = userRes?.data || {};
    if (d.roleType === 'superAdmin') return true;
    if (d.superAdmin === 1) return true;
    try {
      const cache = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (cache?.roleType === 'superAdmin') return true;
      if (cache?.superAdmin === 1) return true;
    } catch {}
    return false;
  }, [userRes]);
  const { toast } = useToast();

  // 非管理员直接提示
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" />权限不足</CardTitle>
            <CardDescription>仅管理员可访问本页</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // 用户列表（主表）
  const [keyword, setKeyword] = useState("");
  const { data: users = [] } = useQuery({
    queryKey: ['Admin.UsersList', 1, 200],
    queryFn: () => adminUsersPageUser({}, { page: 1, limit: 200 }),
    select: (res: any) => {
      const data = res?.data;
      const raw = Array.isArray(data) ? data : (data?.list || data?.records || data?.rows || data?.items || []);
      return (raw || []).map((u: any) => ({ id: String(u.id ?? u.userId ?? u.userid ?? u.uid ?? ''), name: u.username ?? u.nickname ?? u.mobile ?? String(u.id ?? u.userid ?? '') }))
        .filter((u: any) => u.id != null);
    }
  })

  // 配额缓存 map：userId -> quota
  type QuotaLite = Pick<TtsQuotaVO, 'slots' | 'slotsLimit' | 'slotsUsed' | 'slotsRemain' | 'slotsRemaining'>
  const [quotaMap, setQuotaMap] = useState<Record<string, QuotaLite & { loading?: boolean }>>({})
  const ensureQuota = async (userId: string) => {
    setQuotaMap((m) => ({ ...m, [userId]: { ...(m[userId] || {}), loading: true } as any }))
    try {
      const res = await adminGetQuota(userId)
      const q = res?.data || {}
      setQuotaMap((m) => ({ ...m, [userId]: { ...q, loading: false } as any }))
    } catch (e) {
      setQuotaMap((m) => ({ ...m, [userId]: { ...(m[userId] || {}), loading: false } as any }))
    }
  }
  // 仅在用户ID集合变化时预取配额，避免重复触发
  const prevUsersSig = React.useRef<string>('')
  useEffect(() => {
    const sig = JSON.stringify(users.map((u: any) => String(u.id)))
    if (sig === prevUsersSig.current) return
    prevUsersSig.current = sig
    users.slice(0, 20).forEach((u: any) => { const id = String(u.id); if (!quotaMap[id]) ensureQuota(id) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users])

  // 详情：用户的音色位列表（弹窗控制）
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    const kw = keyword.trim()
    if (!kw) return users
    return users.filter((u: any) => u.name.includes(kw) || String(u.id).includes(kw))
  }, [users, keyword])

  // 行内输入引用：点击“保存”时读取当前输入值
  const slotsInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

  const onSaveSlotsLimit = async (userId: string, value: string) => {
    const n = Math.max(0, Math.floor(Number(value) || 0))
    try {
      await adminUpdateQuota(userId, { slots: n })
      toast({ title: '已保存', description: `用户${userId} 音色上限=${n}` })
      await ensureQuota(userId)
    } catch (e: any) {
      toast({ title: '保存失败', description: e?.message || '' })
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />音色分配（管理员）</CardTitle>
            <CardDescription>用户表可设置音色上限；点“详情”显示该用户的音色位并编辑克隆上限与扣费方式。</CardDescription>
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索用户/ID" className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">用户ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead className="w-[220px]">音色使用/上限</TableHead>
                  <TableHead className="w-[260px]">设置音色上限</TableHead>
                  <TableHead className="w-[140px]"/>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u: any) => {
                  const q = quotaMap[u.id]
                  const used = q?.slotsUsed ?? 0
                  const limit = (q?.slotsLimit ?? q?.slots) as any
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>
                        {q?.loading ? '加载中...' : (
                          typeof limit === 'number' ? (
                            <span>{used}/{limit}（剩余{Math.max((limit as number) - (used as number), 0)}）</span>
                          ) : (
                            <span className="text-muted-foreground">未配置</span>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            className="w-28 text-right"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            defaultValue={typeof limit === 'number' ? String(limit) : ''}
                            placeholder="0或以上"
                            onFocus={() => { if (!q) ensureQuota(u.id) }}
                            onBlur={(e) => { const v=e.target.value.replace(/[^0-9]/g,''); if (v !== '' && v !== String(limit ?? '')) onSaveSlotsLimit(u.id, v) }}
                            ref={(el) => { slotsInputRefs.current[String(u.id)] = el }}
                          />
                          <Button size="sm" variant="outline" onClick={() => { const v=(slotsInputRefs.current[String(u.id)]?.value ?? '').replace(/[^0-9]/g,''); onSaveSlotsLimit(String(u.id), v) }}>保存</Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => { setDetailUserId(String(u.id)); setDetailOpen(true) }}>详情</Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <UserSlotsDialog
            open={detailOpen}
            onOpenChange={(v) => { setDetailOpen(v); if (!v) setDetailUserId(null) }}
            userId={detailUserId}
          />

          <div className="mt-3 text-sm text-muted-foreground">仅管理员可访问本页；限额为自然数，支持清零与上限；保存后立刻生效，并对新建客户端同样生效。</div>
        </CardContent>
      </Card>
    </div>
  );
}
