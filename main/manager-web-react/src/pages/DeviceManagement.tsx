import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, UserPlus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useDeviceManagement, type UIDevice } from '../hooks/device/useDeviceManagement';
import { useFirmwareTypes } from '../hooks/ota/useFirmwareTypes';
import { AddDeviceDialog } from '../components/device/AddDeviceDialog';
import { ManualAddDeviceDialog } from '../components/device/ManualAddDeviceDialog';
import { toast } from 'sonner';
// 使用本项目 hooks 导出的 UI 设备类型

/**
 * 设备管理页面组件
 */
export function DeviceManagement({ agentIdProp }: { agentIdProp?: string }) {
  const [searchParams] = useSearchParams();
  const agentId = agentIdProp ?? (searchParams.get('agentId') || '');
  
  // 对话框状态
  const [addDeviceDialogVisible, setAddDeviceDialogVisible] = useState(false);
  const [manualAddDeviceDialogVisible, setManualAddDeviceDialogVisible] = useState(false);

  // 使用设备管理Hook
  const {
    table,
    paginatedDevices,
    isLoading,
    searchKeyword,
    setSearchKeyword,
    handleSearch,
    currentPage,
    pageSize,
    pageCount,
    visiblePages,
    PAGE_SIZE_OPTIONS,
    handlePageSizeChange,
    goFirst,
    goPrev,
    goNext,
    goToPage,
    isCurrentPageAllSelected,
    handleSelectAll,
    updateDeviceSelection,
    refetch,
    unbindDevice,
    batchUnbindDevices,
    updateDeviceInfo,
    isUnbinding,
    isBatchUnbinding,
    isUpdating
  } = useDeviceManagement(agentId);

  // 获取固件类型数据
  const { getFirmwareTypeName } = useFirmwareTypes();

  // 页面加载时获取设备列表
  useEffect(() => {
    if (agentId) {
      console.log('🔄 Loading devices for agent:', agentId);
      refetch();
    }
  }, [agentId, refetch]);

  // 处理单个设备解绑
  const handleUnbind = async (deviceId: string | number) => {
    if (!confirm('确认要解绑该设备吗？')) return;

    try {
      await unbindDevice(String(deviceId));
      toast.success('设备已成功解绑');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // 处理批量解绑
  const handleBatchUnbind = async () => {
    const selectedDevices = paginatedDevices.filter(device => device.selected);
    
    if (selectedDevices.length === 0) {
      toast.error('请至少选择一台设备进行解绑');
      return;
    }

    if (!confirm(`确认要解绑选中的 ${selectedDevices.length} 台设备吗？`)) return;

    try {
      const deviceIds = selectedDevices.map(device => String(device.id!));
      await batchUnbindDevices(deviceIds);
      toast.success(`成功解绑 ${selectedDevices.length} 台设备`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // 处理OTA开关变化
  const handleOtaSwitchChange = async (device: UIDevice, checked: boolean) => {
    try {
      await updateDeviceInfo({ deviceId: String(device.id!), params: { autoUpdate: checked ? 1 : 0 } });
      toast.success(checked ? '已设置成自动升级' : '已关闭自动升级');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 页面头部：移动端适配 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">设备管理</h1>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="请输入设备型号或Mac地址查询"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          <Button onClick={handleSearch} size="sm" className="shrink-0">
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-card border border-border rounded-lg shadow-sm h-full flex flex-col">
          
          {/* 表格区域 */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    拼命加载中...
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[820px]">
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-14">
                          <Checkbox
                            checked={isCurrentPageAllSelected}
                            onCheckedChange={() => handleSelectAll()}
                            aria-label="Select all on page"
                          />
                        </TableHead>
                        <TableHead className="whitespace-nowrap">设备型号</TableHead>
                        <TableHead className="hidden md:table-cell">固件版本</TableHead>
                        <TableHead className="whitespace-nowrap">Mac地址</TableHead>
                        <TableHead className="hidden lg:table-cell">绑定时间</TableHead>
                        <TableHead className="hidden lg:table-cell">最近对话</TableHead>
                        <TableHead className="hidden md:table-cell">备注</TableHead>
                        <TableHead className="whitespace-nowrap">OTA升级</TableHead>
                        <TableHead className="whitespace-nowrap">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => {
                        const device = row.original as UIDevice;
                        return (
                          <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                            <TableCell>
                              <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(checked) => updateDeviceSelection(String(device.id!), !!checked)}
                                aria-label="Select row"
                              />
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {getFirmwareTypeName(device.board || '')}
                            </TableCell>
                            <TableCell className="text-sm hidden md:table-cell">{device.appVersion || '—'}</TableCell>
                            <TableCell className="text-sm font-mono whitespace-nowrap">{device.macAddress || '—'}</TableCell>
                            <TableCell className="text-sm hidden lg:table-cell whitespace-nowrap">{device.createDate || '—'}</TableCell>
                            <TableCell className="text-sm hidden lg:table-cell">—</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                                <Edit3 className="h-3 w-3" />
                                <span className="text-sm">{device.alias || '—'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={(device.autoUpdate ?? 0) === 1}
                                onCheckedChange={(checked) => handleOtaSwitchChange(device, checked)}
                                disabled={isUpdating}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnbind(String(device.id!))}
                                disabled={isUnbinding}
                                className="text-destructive hover:text-destructive"
                              >
                                解绑
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {table.getRowModel().rows.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-muted-foreground">
                      暂无设备数据
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />
          
          {/* 底部操作栏：移动端适配 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={paginatedDevices.length === 0}
              >
                {isCurrentPageAllSelected ? '取消全选' : '全选'}
              </Button>
              
              <Button
                size="sm"
                onClick={() => setAddDeviceDialogVisible(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                验证码绑定
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualAddDeviceDialogVisible(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                手动添加
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchUnbind}
                disabled={isBatchUnbinding || paginatedDevices.filter(d => d.selected).length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isBatchUnbinding ? '解绑中...' : '解绑'}
              </Button>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value) as any)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}条/页
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <Button variant="outline" size="sm" onClick={goFirst} disabled={currentPage === 1}>
                  首页
                </Button>
                <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage === 1}>
                  上一页
                </Button>
                
                {visiblePages.map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="w-8"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button variant="outline" size="sm" onClick={goNext} disabled={currentPage === pageCount}>
                  下一页
                </Button>
              </div>

              <span className="text-sm text-muted-foreground">
                共{table.getPrePaginationRowModel().rows.length}条记录
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 对话框组件 */}
      <AddDeviceDialog
        open={addDeviceDialogVisible}
        onOpenChange={setAddDeviceDialogVisible}
        agentId={agentId}
        onSuccess={() => {
          refetch();
          setAddDeviceDialogVisible(false);
        }}
      />

      <ManualAddDeviceDialog
        open={manualAddDeviceDialogVisible}
        onOpenChange={setManualAddDeviceDialogVisible}
        agentId={agentId}
        onSuccess={() => {
          refetch();
          setManualAddDeviceDialogVisible(false);
        }}
      />
    </div>
  );
}
