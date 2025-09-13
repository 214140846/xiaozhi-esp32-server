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
import { useDeviceManagement } from '../hooks/useDeviceManagement';
import { useFirmwareTypes } from '../hooks/useFirmwareTypes';
import { AddDeviceDialog } from '../components/device/AddDeviceDialog';
import { ManualAddDeviceDialog } from '../components/device/ManualAddDeviceDialog';
import { toast } from 'sonner';
import type { Device } from '../types/device';

/**
 * 设备管理页面组件
 */
export function DeviceManagement() {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agentId') || '';
  
  // 对话框状态
  const [addDeviceDialogVisible, setAddDeviceDialogVisible] = useState(false);
  const [manualAddDeviceDialogVisible, setManualAddDeviceDialogVisible] = useState(false);

  // 使用设备管理Hook
  const {
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
  const handleUnbind = async (deviceId: string) => {
    if (!confirm('确认要解绑该设备吗？')) return;

    try {
      await unbindDevice(deviceId);
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
      const deviceIds = selectedDevices.map(device => device.device_id);
      await batchUnbindDevices(deviceIds);
      toast.success(`成功解绑 ${selectedDevices.length} 台设备`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // 处理OTA开关变化
  const handleOtaSwitchChange = async (device: Device, checked: boolean) => {
    try {
      await updateDeviceInfo({ deviceId: device.device_id, params: { autoUpdate: checked ? 1 : 0 } });
      toast.success(checked ? '已设置成自动升级' : '已关闭自动升级');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 页面头部 */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">设备管理</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="请输入设备型号或Mac地址查询"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 w-80"
            />
          </div>
          <Button onClick={handleSearch} size="sm">
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
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 w-20">选择</th>
                        <th className="text-left p-3">设备型号</th>
                        <th className="text-left p-3">固件版本</th>
                        <th className="text-left p-3">Mac地址</th>
                        <th className="text-left p-3">绑定时间</th>
                        <th className="text-left p-3">最近对话</th>
                        <th className="text-left p-3">备注</th>
                        <th className="text-left p-3">OTA升级</th>
                        <th className="text-left p-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDevices.map((device) => (
                        <tr key={device.device_id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-3">
                            <Checkbox
                              checked={device.selected}
                              onCheckedChange={(checked) => 
                                updateDeviceSelection(device.device_id, !!checked)
                              }
                            />
                          </td>
                          <td className="p-3 text-sm">
                            {getFirmwareTypeName(device.model)}
                          </td>
                          <td className="p-3 text-sm">{device.firmwareVersion}</td>
                          <td className="p-3 text-sm font-mono">{device.macAddress}</td>
                          <td className="p-3 text-sm">{device.bindTime}</td>
                          <td className="p-3 text-sm">{device.lastConversation}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
                              <Edit3 className="h-3 w-3" />
                              <span className="text-sm">{device.remark || '—'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Switch
                              checked={device.otaSwitch}
                              onCheckedChange={(checked) => handleOtaSwitchChange(device, checked)}
                              disabled={isUpdating}
                            />
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnbind(device.device_id)}
                              disabled={isUnbinding}
                              className="text-destructive hover:text-destructive"
                            >
                              解绑
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {paginatedDevices.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-muted-foreground">
                      暂无设备数据
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />
          
          {/* 底部操作栏 */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-4">
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

              <div className="flex items-center gap-1">
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
                共{paginatedDevices.length}条记录
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