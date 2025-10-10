import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Calendar, Download, Users, BarChart3, Activity } from "lucide-react";
import {
  useMyUsageStatisticsQuery,
  useAdminUsageStatisticsQuery,
  useStatisticsByUserQuery,
  useMyUsageDetailsQuery,
  useAdminUsageDetailsQuery,
  useExportMyUsageMutation,
  useExportAdminUsageMutation,
} from "../hooks/usage";
import { useUserDetailQuery } from "../hooks/user";
import { formatNumber } from "../utils/format";
import type { TtsUsageEntity, UserUsageStatistics } from "../api/usage";

export interface UsageStatisticsProps {}

export function UsageStatistics({}: UsageStatisticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [endpoint, setEndpoint] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<"day" | "id">("day");
  const [idKey, setIdKey] = useState<"userId" | "agentId" | "slotId">("agentId");
  const [idFilter, setIdFilter] = useState("");

  // 是否管理员：优先使用 user/info 的 roleType；兜底 localStorage.superAdmin
  const { data: userRes } = useUserDetailQuery();
  const isAdmin = useMemo(() => {
    const rt = userRes?.data?.roleType;
    if (rt === "superAdmin") return true;
    try {
      const u = localStorage.getItem("userInfo");
      if (!u) return false;
      const j = JSON.parse(u);
      return [1, "1", true, "true"].includes(j?.superAdmin) || [1, "1"].includes(j?.roleId) || j?.role === "admin";
    } catch { return false; }
  }, [userRes]);

  // 统一计算起止日期：后端可能更偏好显式 start/end
  const { qStart, qEnd } = useMemo(() => {
    const today = new Date();
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
    if (period === 'custom' && startDate && endDate) return { qStart: startDate, qEnd: endDate };
    if (period === 'today') {
      const s = toDateStr(today);
      return { qStart: s, qEnd: s };
    }
    const end = toDateStr(today);
    const d = new Date(today);
    if (period === 'week') d.setDate(d.getDate() - 6);
    else /* month */ d.setDate(d.getDate() - 29);
    const start = toDateStr(d);
    return { qStart: start, qEnd: end };
  }, [period, startDate, endDate]);

  // 统计查询
  const { data: myStatsRes, isLoading: myStatsLoading } = useMyUsageStatisticsQuery(
    { period, start: qStart, end: qEnd },
    { enabled: true }
  );
  const { data: adminStatsRes, isLoading: adminStatsLoading } = useAdminUsageStatisticsQuery(
    { userId: selectedUserId, period, start: qStart, end: qEnd },
    { enabled: isAdmin }
  );
  const myStats = myStatsRes?.data;
  const adminStats = adminStatsRes?.data;

  // 明细查询
  const { data: myDetailsRes, isLoading: myDetailsLoading } = useMyUsageDetailsQuery(
    { endpoint: endpoint === "all" ? undefined : endpoint, start: qStart, end: qEnd, limit: 100 },
    { enabled: activeTab === "details" || activeTab === "overview" }
  );
  const { data: adminDetailsRes, isLoading: adminDetailsLoading } = useAdminUsageDetailsQuery(
    { userId: selectedUserId, endpoint: endpoint === "all" ? undefined : endpoint, start: qStart, end: qEnd, limit: 100 },
    { enabled: isAdmin && (activeTab === "details" || activeTab === "overview" || activeTab === "users") }
  );
  const myDetails = myDetailsRes?.data || [];
  const adminDetails = adminDetailsRes?.data || [];

  // 用户聚合
  const { data: userStatsRes, isLoading: userStatsLoading } = useStatisticsByUserQuery(
    { period, start: qStart, end: qEnd },
    { enabled: isAdmin && activeTab === "users" }
  );
  const userStats: UserUsageStatistics[] = userStatsRes?.data || [];

  const userStatsFallback: UserUsageStatistics[] = useMemo(() => {
    if (!isAdmin || !adminDetails || adminDetails.length === 0) return [];
    const map = new Map<number, UserUsageStatistics>();
    for (const d of adminDetails as TtsUsageEntity[]) {
      const uid = d.userId;
      if (uid == null) continue;
      const cur = map.get(uid) || { userId: uid, totalChars: 0, totalCalls: 0, cloneChars: 0, cloneCalls: 0, ttsChars: 0, ttsCalls: 0, recordCount: 0 };
      cur.totalChars += d.costChars || 0;
      cur.totalCalls += d.costCalls || 0;
      cur.recordCount += 1;
      if (d.endpoint === 'tts') { cur.ttsChars += d.costChars || 0; cur.ttsCalls += d.costCalls || 0; }
      else { cur.cloneChars += d.costChars || 0; cur.cloneCalls += d.costCalls || 0; }
      map.set(uid, cur);
    }
    return Array.from(map.values()).sort((a,b)=>a.userId-b.userId);
  }, [isAdmin, adminDetails]);

  const userStatsToShow = (userStats && userStats.length>0) ? userStats : userStatsFallback;

  // 导出
  const exportMyUsageMutation = useExportMyUsageMutation();
  const exportAdminUsageMutation = useExportAdminUsageMutation();

  const currentStats = isAdmin ? adminStats : myStats;
  const currentDetails: TtsUsageEntity[] = (isAdmin ? adminDetails : myDetails) as TtsUsageEntity[];
  const currentLoading = isAdmin ? adminStatsLoading : myStatsLoading;
  const detailsLoading = isAdmin ? adminDetailsLoading : myDetailsLoading;

  const derived = useMemo(() => {
    let ttsDuration = 0, cloneDuration = 0, ttsCost = 0, cloneCost = 0;
    for (const d of currentDetails) {
      if (d.endpoint === "tts") { ttsDuration += d.durationMs || 0; ttsCost += d.cost || 0; }
      else { cloneDuration += d.durationMs || 0; cloneCost += d.cost || 0; }
    }
    return { ttsDurationMs: ttsDuration, cloneDurationMs: cloneDuration, ttsCost, cloneCost, totalCost: ttsCost + cloneCost };
  }, [currentDetails]);

  // 当统计接口缺失或返回空时，使用明细聚合兜底
  const fallbackStats = useMemo(() => {
    if (!currentDetails || currentDetails.length === 0) return undefined;
    let totalChars = 0, totalCalls = 0, totalDuration = 0, recordCount = currentDetails.length;
    let ttsChars = 0, ttsCalls = 0, cloneChars = 0, cloneCalls = 0;
    for (const d of currentDetails) {
      totalChars += d.costChars || 0; totalCalls += d.costCalls || 0; totalDuration += d.durationMs || 0;
      if (d.endpoint === 'tts') { ttsChars += d.costChars || 0; ttsCalls += d.costCalls || 0; }
      else { cloneChars += d.costChars || 0; cloneCalls += d.costCalls || 0; }
    }
    return { totalChars, totalCalls, totalDuration, ttsChars, ttsCalls, cloneChars, cloneCalls, recordCount };
  }, [currentDetails]);

  const statsToShow = useMemo(() => {
    // 如果接口有数据则用接口，否则用聚合兜底
    if (currentStats && typeof currentStats.totalCalls === 'number') return currentStats as any;
    return fallbackStats as any;
  }, [currentStats, fallbackStats]);

  const trendRows = useMemo(() => {
    if (groupBy === "day") {
      const map = new Map<string, any>();
      currentDetails.forEach(d => {
        const key = new Date(d.createdAt).toISOString().slice(0, 10);
        const r = map.get(key) || { key, ttsCalls: 0, cloneCalls: 0, ttsChars: 0, cloneChars: 0, durationMs: 0, cost: 0 };
        if (d.endpoint === "tts") { r.ttsCalls += d.costCalls || 0; r.ttsChars += d.costChars || 0; } else { r.cloneCalls += d.costCalls || 0; r.cloneChars += d.costChars || 0; }
        r.durationMs += d.durationMs || 0; r.cost += d.cost || 0; map.set(key, r);
      });
      return Array.from(map.values()).sort((a,b)=>a.key<b.key?-1:1);
    }
    const map = new Map<string, any>();
    currentDetails.forEach(d => {
      const raw: any = (d as any)[idKey] ?? "-";
      const key = String(raw);
      const r = map.get(key) || { key, ttsCalls: 0, cloneCalls: 0, ttsChars: 0, cloneChars: 0, durationMs: 0, cost: 0 };
      if (d.endpoint === "tts") { r.ttsCalls += d.costCalls || 0; r.ttsChars += d.costChars || 0; } else { r.cloneCalls += d.costCalls || 0; r.cloneChars += d.costChars || 0; }
      r.durationMs += d.durationMs || 0; r.cost += d.cost || 0; map.set(key, r);
    });
    const f = idFilter.trim();
    let arr = Array.from(map.values());
    if (f) arr = arr.filter(r => String(r.key).includes(f));
    return arr.sort((a,b)=>String(a.key).localeCompare(String(b.key)));
  }, [currentDetails, groupBy, idKey, idFilter]);

  const handleExport = () => {
    const exportParams = {
      endpoint: endpoint === "all" ? undefined : endpoint,
      start: startDate,
      end: endDate,
      ...(isAdmin && selectedUserId ? { userId: selectedUserId } : {}),
    };
    if (isAdmin) exportAdminUsageMutation.mutate(exportParams);
    else exportMyUsageMutation.mutate(exportParams);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">用量统计</h1>
          <p className="text-muted-foreground">{isAdmin ? "查看和管理所有用户的用量统计" : "查看您的TTS用量统计"}</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2"><Download className="h-4 w-4" />导出明细</Button>
      </div>

      {/* 筛选条件 */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />筛选条件</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>时间范围</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue placeholder="选择时间范围" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="week">最近7天</SelectItem>
                  <SelectItem value="month">最近30天</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div className="space-y-2"><Label>开始日期</Label><Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>结束日期</Label><Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} /></div>
              </>
            )}
            {isAdmin && (<div className="space-y-2"><Label>用户筛选</Label><Input type="number" placeholder="输入用户ID(留空=全部)" value={selectedUserId || ""} onChange={e=>setSelectedUserId(e.target.value?parseInt(e.target.value):undefined)} /></div>)}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />用量概览</TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2"><Activity className="h-4 w-4" />用量明细</TabsTrigger>
          {isAdmin && <TabsTrigger value="users" className="flex items-center gap-2"><Users className="h-4 w-4" />用户统计</TabsTrigger>}
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">总字符</CardTitle></CardHeader><CardContent>
              <div className="text-2xl font-bold">{formatNumber((statsToShow as any)?.totalChars || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">总调用：{formatNumber((statsToShow as any)?.totalCalls || 0)}</p>
              <p className="text-xs text-muted-foreground">总时长(ms)：{formatNumber((statsToShow as any)?.totalDuration || 0)}</p>
              <p className="text-xs text-muted-foreground">总成本：{formatNumber(derived.totalCost || 0)}</p>
            </CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">TTS</CardTitle></CardHeader><CardContent>
              <div className="text-2xl font-bold">{formatNumber((statsToShow as any)?.ttsChars || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">调用：{formatNumber((statsToShow as any)?.ttsCalls || 0)}</p>
              <p className="text-xs text-muted-foreground">时长(ms)：{formatNumber(derived.ttsDurationMs || 0)}</p>
              <p className="text-xs text-muted-foreground">成本：{formatNumber(derived.ttsCost || 0)}</p>
            </CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">克隆</CardTitle></CardHeader><CardContent>
              <div className="text-2xl font-bold">{formatNumber((statsToShow as any)?.cloneChars || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">调用：{formatNumber((statsToShow as any)?.cloneCalls || 0)}</p>
              <p className="text-xs text-muted-foreground">时长(ms)：{formatNumber(derived.cloneDurationMs || 0)}</p>
              <p className="text-xs text-muted-foreground">成本：{formatNumber(derived.cloneCost || 0)}</p>
            </CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">记录数</CardTitle></CardHeader><CardContent>
              <div className="text-2xl font-bold">{formatNumber((statsToShow as any)?.recordCount || 0)}</div>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle>趋势展示（可切换分组）</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={groupBy} onValueChange={v=>setGroupBy(v as any)}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="分组" /></SelectTrigger>
                    <SelectContent><SelectItem value="day">按日</SelectItem><SelectItem value="id">按ID</SelectItem></SelectContent>
                  </Select>
                  {groupBy === "id" && (
                    <>
                      <Select value={idKey} onValueChange={v=>setIdKey(v as any)}>
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="ID类型" /></SelectTrigger>
                        <SelectContent>
                          {isAdmin && <SelectItem value="userId">用户ID</SelectItem>}
                          <SelectItem value="agentId">Agent ID</SelectItem>
                          <SelectItem value="slotId">音色位ID</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="筛选ID" className="w-[160px]" value={idFilter} onChange={e=>setIdFilter(e.target.value)} />
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left text-sm text-muted-foreground">{groupBy === "day" ? "日期" : (idKey === "userId" ? "用户ID" : idKey === "agentId" ? "Agent ID" : "音色位ID")}</th>
                      <th className="h-10 px-4 text-left text-sm text-muted-foreground">TTS 次数</th>
                      <th className="h-10 px-4 text-left text-sm text-muted-foreground">克隆 次数</th>
                      <th className="h-10 px-4 text-left text-sm text-muted-foreground">TTS 字符</th>
                      <th className="h-10 px-4 text-left text-sm text-muted-foreground">克隆 字符</th>
                      <th className="h-10 px-4 text-left text-sm text-muted-foreground">总时长(ms)</th>
                      <th className="h-10 px-4 text-left text-sm text-muted-foreground">成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentLoading || detailsLoading) ? Array.from({length:5}).map((_,i)=> (
                      <tr key={i} className="border-b">{Array.from({length:7}).map((__,j)=>(<td key={j} className="p-3"><div className="h-4 bg-muted rounded w-20 animate-pulse"/></td>))}</tr>
                    )) : trendRows.length === 0 ? (
                      <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">暂无数据</td></tr>
                    ) : trendRows.map((r:any)=> (
                      <tr key={r.key} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{r.key}</td>
                        <td className="p-3">{formatNumber(r.ttsCalls)}</td>
                        <td className="p-3">{formatNumber(r.cloneCalls)}</td>
                        <td className="p-3">{formatNumber(r.ttsChars)}</td>
                        <td className="p-3">{formatNumber(r.cloneChars)}</td>
                        <td className="p-3">{formatNumber(r.durationMs)}</td>
                        <td className="p-3">{formatNumber(r.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用量明细 */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用量明细</CardTitle>
              <CardDescription>详细记录，最多100条</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={endpoint} onValueChange={setEndpoint}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="筛选端点类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="tts">文本转语音</SelectItem>
                    <SelectItem value="clone">声音克隆</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">创建时间</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">端点类型</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">字符数</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">调用次数</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">时长(毫秒)</th>
                        {isAdmin && <th className="h-12 px-4 text-left text-sm text-muted-foreground">用户ID</th>}
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">Agent ID</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">音色位ID</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">成本</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentLoading || detailsLoading) ? Array.from({length:5}).map((_,i)=> (
                        <tr key={i} className="border-b">{Array.from({length:isAdmin?9:8}).map((__,j)=>(<td key={j} className="p-4"><div className="h-4 bg-muted rounded w-20 animate-pulse"/></td>))}</tr>
                      )) : currentDetails.length === 0 ? (
                        <tr><td colSpan={isAdmin?9:8} className="p-8 text-center text-muted-foreground">暂无数据</td></tr>
                      ) : currentDetails.map((d)=> (
                        <tr key={d.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">{new Date(d.createdAt).toLocaleString()}</td>
                          <td className="p-4">{d.endpoint}</td>
                          <td className="p-4">{formatNumber(d.costChars)}</td>
                          <td className="p-4">{formatNumber(d.costCalls)}</td>
                          <td className="p-4">{formatNumber(d.durationMs)}</td>
                          {isAdmin && <td className="p-4">{d.userId}</td>}
                          <td className="p-4">{d.agentId || "-"}</td>
                          <td className="p-4">{d.slotId || "-"}</td>
                          <td className="p-4">{formatNumber((d as any).cost || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户统计 (仅管理员可见) */}
        {isAdmin && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用户用量统计</CardTitle>
                <CardDescription>按用户分组的用量统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">用户ID</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">总字符</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">总次数</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">TTS 字符</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">TTS 次数</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">克隆 字符</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">克隆 次数</th>
                        <th className="h-12 px-4 text-left text-sm text-muted-foreground">记录数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userStatsLoading ? Array.from({length:5}).map((_,i)=> (
                        <tr key={i} className="border-b">{Array.from({length:8}).map((__,j)=>(<td key={j} className="p-4"><div className="h-4 bg-muted rounded w-16 animate-pulse"/></td>))}</tr>
                      )) : userStatsToShow.length === 0 ? (
                        <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">暂无用户数据</td></tr>
                      ) : userStatsToShow.map((u)=> (
                        <tr key={u.userId} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{u.userId}</td>
                          <td className="p-4">{formatNumber(u.totalChars)}</td>
                          <td className="p-4">{formatNumber(u.totalCalls)}</td>
                          <td className="p-4">{formatNumber(u.ttsChars)}</td>
                          <td className="p-4">{formatNumber(u.ttsCalls)}</td>
                          <td className="p-4">{formatNumber(u.cloneChars)}</td>
                          <td className="p-4">{formatNumber(u.cloneCalls)}</td>
                          <td className="p-4">{formatNumber(u.recordCount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default UsageStatistics;
