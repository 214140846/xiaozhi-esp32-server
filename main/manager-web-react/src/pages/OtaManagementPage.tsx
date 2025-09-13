import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Trash2, 
  Download, 
  Edit,
  RefreshCw,
  HardDrive,
  Users,
  Activity
} from 'lucide-react';
import { OtaDialog } from '@/components/ota/OtaDialog';
import { useOtaList } from '@/hooks/useOtaList';
import { useOtaDialog } from '@/hooks/useOtaDialog';
import { useFirmwareTypes } from '@/hooks/useFirmwareTypes';
import type { OtaFirmware } from '@/types/ota';
import { formatFileSize, formatDate } from '@/lib/utils';

/**
 * OTA固件管理页面组件
 * 功能包括：
 * - 固件列表展示和搜索
 * - 固件的新增、编辑、删除操作
 * - 批量选择和批量删除
 * - 固件文件下载
 * - 分页控制
 */
export default function OtaManagementPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OtaFirmware[]>([]);

  // 使用自定义hooks
  const {
    firmwareList,
    total,
    currentPage,
    pageSize,
    isLoading,
    isDeleting,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleDownload,
    refetch,
  } = useOtaList();

  const {
    isVisible: dialogVisible,
    dialogTitle,
    formData,
    showAddDialog,
    showEditDialog,
    hideDialog,
    handleSubmit,
    handleFileUpload,
    handleFileRemove,
    updateField,
    uploadProgress,
    uploadStatus,
    isUploading,
    isSaving,
  } = useOtaDialog();

// 获取固件类型字典数据
  const { firmwareTypes } = useFirmwareTypes();

  console.log('OtaManagementPage: 渲染页面, 固件列表数量:', firmwareList.length);

  // 处理搜索
  const handleSearchSubmit = () => {
    console.log('OtaManagementPage: 执行搜索, 关键词:', searchKeyword);
    handleSearch(searchKeyword);
  };

  // 处理回车搜索
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // 全选/取消全选
  const isAllSelected = selectedIds.length === firmwareList.length && firmwareList.length > 0;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(firmwareList.map((f: any) => f.id!).filter(Boolean));
    }
  };

  const handleSelectItem = (id: string | number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // 编辑固件
  const handleEdit = (firmware: any) => {
    console.log('OtaManagementPage: 编辑固件:', firmware);
    showEditDialog(firmware);
  };

  // 删除确认
  const confirmDelete = (firmware?: OtaFirmware) => {
    if (firmware) {
      // 单个删除
      setDeleteTarget([firmware]);
    } else {
      // 批量删除
      const selected = firmwareList.filter((f: any) => selectedIds.includes(f.id!));
      setDeleteTarget(selected);
    }
    setShowDeleteDialog(true);
  };

  // 执行删除
  const executeDelete = () => {
    console.log('OtaManagementPage: 执行删除操作, 目标:', deleteTarget);
    handleDelete(deleteTarget);
    setShowDeleteDialog(false);
    setDeleteTarget([]);
    setSelectedIds([]); // 清空选择
  };

  // 获取固件类型名称
  const getFirmwareTypeName = (typeKey: string): string => {
    const type = firmwareTypes.find(t => t.key === typeKey);
    return type?.name || typeKey;
  };

  // 计算分页信息
  const pageCount = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">固件管理</h1>
            <p className="text-purple-300 mt-1">管理和维护设备固件版本</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="glass-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <HardDrive className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-300">总固件数</p>
                  <p className="text-2xl font-bold text-white">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-300">固件类型</p>
                  <p className="text-2xl font-bold text-white">{firmwareTypes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-300">当前页</p>
                  <p className="text-2xl font-bold text-white">{currentPage}/{pageCount || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 操作栏 */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">固件列表</CardTitle>
            <div className="flex items-center space-x-3">
              {/* 搜索框 */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="请输入固件名称查询"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-64 glass-input"
                />
                <Button
                  onClick={handleSearchSubmit}
                  className="cyber-button"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={showAddDialog}
                className="cyber-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                新增固件
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => confirmDelete()}
                disabled={selectedIds.length === 0 || isDeleting}
                className="glass-button hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除 {selectedIds.length > 0 && `(${selectedIds.length})`}
              </Button>
            </div>

            {/* 页面大小选择 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-purple-300">每页显示:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-24 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="rounded-md border border-purple-500/30">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-purple-500/10 border-purple-500/30">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="border-purple-400"
                    />
                  </TableHead>
                  <TableHead className="text-purple-300">固件名称</TableHead>
                  <TableHead className="text-purple-300">固件类型</TableHead>
                  <TableHead className="text-purple-300">版本号</TableHead>
                  <TableHead className="text-purple-300">文件大小</TableHead>
                  <TableHead className="text-purple-300">备注</TableHead>
                  <TableHead className="text-purple-300">创建时间</TableHead>
                  <TableHead className="text-purple-300">更新时间</TableHead>
                  <TableHead className="text-purple-300 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                        <span className="text-purple-300">加载中...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : firmwareList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-purple-300">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  firmwareList.map((firmware: any) => (
                    <TableRow
                      key={firmware.id}
                      className="hover:bg-purple-500/10 border-purple-500/20"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(firmware.id!)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(firmware.id!, checked as boolean)
                          }
                          className="border-purple-400"
                        />
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {firmware.firmwareName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-400 text-purple-300">
                          {getFirmwareTypeName(firmware.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-purple-300">
                        {firmware.version}
                      </TableCell>
                      <TableCell className="text-purple-300">
                        {formatFileSize(firmware.size)}
                      </TableCell>
                      <TableCell className="text-purple-300 max-w-32 truncate">
                        {firmware.remark}
                      </TableCell>
                      <TableCell className="text-purple-300">
                        {formatDate(firmware.createDate)}
                      </TableCell>
                      <TableCell className="text-purple-300">
                        {formatDate(firmware.updateDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(firmware)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(firmware)}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(firmware)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页控制 */}
          {total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-purple-300">
                显示第 {startIndex} - {endIndex} 项，共 {total} 项
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="glass-button"
                >
                  首页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="glass-button"
                >
                  上一页
                </Button>
                
                {/* 页码显示 */}
                {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum <= pageCount) {
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={pageNum === currentPage ? "cyber-button" : "glass-button"}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="glass-button"
                >
                  下一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageCount)}
                  disabled={currentPage === pageCount}
                  className="glass-button"
                >
                  末页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OTA对话框 */}
      <OtaDialog
        isVisible={dialogVisible}
        dialogTitle={dialogTitle}
        firmwareTypes={firmwareTypes}
        onClose={hideDialog}
        onSubmit={handleSubmit}
        formData={formData}
        updateField={updateField}
        handleFileUpload={handleFileUpload}
        handleFileRemove={handleFileRemove}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        isUploading={isUploading}
        isSaving={isSaving}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-container">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-purple-300">
              确定要删除选中的 {deleteTarget.length} 个固件吗？删除后无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}