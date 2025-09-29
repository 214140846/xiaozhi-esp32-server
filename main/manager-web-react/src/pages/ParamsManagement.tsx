import React from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

import { usePagination } from "@/hooks/usePagination";
import { SENSITIVE_KEYS } from "@/types/params";
import { ParamEditDialog } from "@/components/params/ParamEditDialog";
import {
  useAdminParamsPagePageQuery,
  useAdminParamsDeleteDelete1Mutation,
} from "@/hooks/admin";

// 参数编辑弹窗已抽离至独立文件 components/params/ParamEditDialog.tsx

export function ParamsManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  // 受控输入与中文输入法组合态处理
  const [localQ, setLocalQ] = React.useState(q);
  const isComposingRef = React.useRef(false);
  const debounceTimerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    setLocalQ(q);
  }, [q]);

  const {
    currentPage,
    pageSize,
    setPageSize,
    pageSizeOptions,
    setTotal,
    goFirst,
    goPrev,
    goNext,
    goToPage,
    visiblePages,
  } = usePagination(10);

  const { data, isLoading, refetch } = useAdminParamsPagePageQuery(
    {},
    { page: currentPage, limit: pageSize, paramCode: q }
  );

  React.useEffect(() => {
    if (data?.data?.total != null) setTotal(data.data.total);
  }, [data, setTotal]);

  const list = data?.data?.list || [];

  // 选择与显隐状态
  const [selected, setSelected] = React.useState<number[]>([]);
  const [revealMap, setRevealMap] = React.useState<Record<number, boolean>>({});
  const isAllChecked = list.length > 0 && list.every((i) => selected.includes(i.id as number));

  const toggleReveal = (id: number) => setRevealMap((m) => ({ ...m, [id]: !m[id] }));
  const isSensitive = (code?: string) => {
    if (!code) return false;
    const low = code.toLowerCase();
    return SENSITIVE_KEYS.some((k) => low.includes(k));
  };
  const mask = (v?: string) => (v && v.length > 0 ? "•".repeat(Math.min(v.length, 8)) : "");

  const commitQuery = React.useCallback(
    (next: string) => {
      setSearchParams((prev) => {
        const n = new URLSearchParams(prev);
        if (next) n.set("q", next);
        else n.delete("q");
        return n;
      });
    },
    [setSearchParams]
  );

  const handleSearch = () => {
    commitQuery(localQ);
    refetch();
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleToggleAll = (checked: boolean) => {
    if (checked) setSelected(Array.from(new Set([...selected, ...list.map((i) => i.id as number)])));
    else setSelected((prev) => prev.filter((id) => !(list as any).some((i: any) => i.id === id)));
  };
  const handleToggleOne = (id: number, checked: boolean) => {
    setSelected((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)));
  };

  const [editOpen, setEditOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);

  const { mutateAsync: removeParams, isPending: deleting } = useAdminParamsDeleteDelete1Mutation();

  const doDelete = async (ids: number[]) => {
    if (ids.length === 0) return;
    if (!confirm(`确定删除选中的 ${ids.length} 项？`)) return;
    try {
      await removeParams({ data: ids.map(String) });
      toast.success("删除成功");
      setSelected((prev) => prev.filter((x) => !ids.includes(x)));
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "删除失败");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border flex flex-col gap-3">
        {/* 顶部：标题 + 新建 */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">参数管理</h1>
          <Button
            onClick={() => {
              setEditId(null);
              setEditOpen(true);
            }}
          >
            新建参数
          </Button>
        </div>

        <Alert>
          <Info className="mt-0.5" />
          <AlertTitle>使用说明</AlertTitle>
          <AlertDescription>
            <p>用于保存系统级 Key/配置等参数，供服务端或前端读取使用。</p>
            <p>新建参数需填写“参数编码”和“参数值”；表格支持搜索、批量删除、编辑与删除。</p>
            <p>对常见敏感编码会自动隐藏，可点击“查看”临时显示；建议编码采用点分命名，如 openai.api_key。</p>
          </AlertDescription>
        </Alert>

        {/* 工具区：搜索 + 批量删除 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-stretch gap-2 flex-1">
            <Input
              placeholder="按编码/备注搜索"
              value={localQ}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={(e) => {
                isComposingRef.current = false;
                const value = (e.target as HTMLInputElement).value;
                setLocalQ(value);
                commitQuery(value);
              }}
              onChange={(e) => {
                const value = e.target.value;
                setLocalQ(value);
                if (isComposingRef.current) return;
                if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = window.setTimeout(() => {
                  commitQuery(value);
                }, 300);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button variant="outline" onClick={handleSearch}>
              搜索
            </Button>
          </div>
          <Button variant="destructive" disabled={selected.length === 0 || deleting} onClick={() => doDelete(selected)}>
            批量删除
          </Button>
        </div>

        <Separator />

        {/* 表格 */}
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={isAllChecked}
                    onCheckedChange={(c) => handleToggleAll(Boolean(c))}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>参数编码</TableHead>
                <TableHead>参数值</TableHead>
                <TableHead>备注</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-44">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {list.map((item) => {
                  const id = item.id as number;
                  const show = revealMap[id];
                  const sens = isSensitive(item.paramCode || "");
                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="border-b border-border"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(id)}
                          onCheckedChange={(c) => handleToggleOne(id, Boolean(c))}
                          aria-label={`选择 ${id}`}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{id}</TableCell>
                      <TableCell className="font-medium">{item.paramCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[260px]">
                            {sens && !show ? mask(item.paramValue || "") : item.paramValue || ""}
                          </span>
                          {sens && (
                            <Button size="sm" variant="outline" onClick={() => toggleReveal(id)}>
                              {show ? "隐藏" : "查看"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.remark || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.createDate?.replace("T", " ").slice(0, 19) || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditId(id);
                              setEditOpen(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button size="sm" variant="destructive" disabled={deleting} onClick={() => doDelete([id])}>
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}

                {list.length === 0 && !isLoading && (
                  <tr>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </tr>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每页</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v) as any)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Button variant="outline" size="sm" onClick={goFirst}>
              首页
            </Button>
            <Button variant="outline" size="sm" onClick={goPrev}>
              上一页
            </Button>
            {visiblePages.map((p) => (
              <Button key={p} variant="outline" size="sm" onClick={() => goToPage(p)} className="w-8">
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={goNext}>
              下一页
            </Button>
          </div>
        </div>

        {/* 新建/编辑对话框 */}
        <ParamEditDialog open={editOpen} onOpenChange={setEditOpen} editId={editId} onSuccess={() => refetch()} />
      </div>
    </div>
  );
}

export default ParamsManagementPage;
