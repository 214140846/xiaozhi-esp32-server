/**
 * 字典管理页面
 * 提供字典类型和字典数据的完整管理功能
 */
import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { HeaderBar } from '../components/home/HeaderBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { DictTypeDialog } from '../components/dict/DictTypeDialog';
import { DictDataDialog } from '../components/dict/DictDataDialog';
import { useDictTypes, useDictTypeActions } from '../hooks/useDictTypes';
import { useDictData, useDictDataActions } from '../hooks/useDictData';
// import { useSearch } from '../hooks/useSearch';
import { usePagination } from '../hooks/usePagination';
import type { DictType, DictData, DictTypeForm, DictDataForm } from '../types/dict';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export const DictManagementPage: React.FC = () => {
  // ==================== 状态管理 ====================
  const [selectedDictType, setSelectedDictType] = useState<DictType | null>(null);
  const [selectedDictTypes, setSelectedDictTypes] = useState<DictType[]>([]);
  const [selectedDictData, setSelectedDictData] = useState<DictData[]>([]);
  
  // 对话框状态
  const [dictTypeDialogOpen, setDictTypeDialogOpen] = useState(false);
  const [dictDataDialogOpen, setDictDataDialogOpen] = useState(false);
  const [editingDictType, setEditingDictType] = useState<DictTypeForm | null>(null);
  const [editingDictData, setEditingDictData] = useState<DictDataForm | null>(null);

  // 搜索和分页（本地实现搜索输入与防抖）
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);
  const { 
    currentPage, 
    pageSize, 
    setPageSize,
    goToPage,
    goFirst
  } = usePagination();

  // ==================== API调用 ====================
  // 字典类型相关
  const { data: dictTypeData, isLoading: dictTypeLoading } = useDictTypes({
    page: 1,
    limit: 100,
    dictName: debouncedSearchTerm,
  });

  const { addDictType, updateDictType, deleteDictType } = useDictTypeActions();

  // 字典数据相关
  const { data: dictDataResponse, isLoading: dictDataLoading } = useDictData({
    dictTypeId: selectedDictType?.id || 0,
    page: currentPage,
    limit: pageSize,
    dictLabel: debouncedSearchTerm,
  });

  const { addDictData, updateDictData, deleteDictData } = useDictDataActions();

  // ==================== 计算属性 ====================
  const dictTypeList = dictTypeData?.list || [];
  const dictDataList = useMemo(() => {
    return (dictDataResponse?.list || []).map(item => ({
      ...item,
      selected: selectedDictData.some(selected => selected.id === item.id)
    }));
  }, [dictDataResponse?.list, selectedDictData]);

  const totalDictData = dictDataResponse?.total || 0;
  const totalPages = Math.ceil(totalDictData / pageSize);

  // ==================== 字典类型操作 ====================
  const handleDictTypeClick = useCallback((dictType: DictType) => {
    setSelectedDictType(dictType);
    setSelectedDictData([]);
    goFirst();
  }, [goFirst]);

  const handleDictTypeSelectionChange = useCallback((dictType: DictType, checked: boolean) => {
    setSelectedDictTypes(prev => {
      if (checked) {
        return [...prev, dictType];
      } else {
        return prev.filter(item => item.id !== dictType.id);
      }
    });
  }, []);

  const handleAddDictType = useCallback(() => {
    setEditingDictType(null);
    setDictTypeDialogOpen(true);
  }, []);

  const handleEditDictType = useCallback((dictType: DictType) => {
    setEditingDictType({
      id: dictType.id,
      dictName: dictType.dictName,
      dictType: dictType.dictType,
    });
    setDictTypeDialogOpen(true);
  }, []);

  const handleSaveDictType = useCallback(async (data: DictTypeForm) => {
    try {
      if (data.id) {
        await updateDictType.mutateAsync(data);
        toast.success('字典类型更新成功');
      } else {
        await addDictType.mutateAsync(data);
        toast.success('字典类型新增成功');
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
      throw error; // 重新抛出错误，阻止对话框关闭
    }
  }, [addDictType, updateDictType]);

  const handleBatchDeleteDictType = useCallback(async () => {
    if (selectedDictTypes.length === 0) {
      toast.warning('请选择要删除的字典类型');
      return;
    }

    if (confirm(`确定要删除选中的 ${selectedDictTypes.length} 个字典类型吗？`)) {
      try {
        const ids = selectedDictTypes.map(item => item.id);
        await deleteDictType.mutateAsync(ids);
        toast.success('删除成功');
        setSelectedDictTypes([]);
      } catch (error: any) {
        toast.error(error.message || '删除失败');
      }
    }
  }, [selectedDictTypes, deleteDictType]);

  // ==================== 字典数据操作 ====================
  const handleDictDataSelectionChange = useCallback((dictData: DictData, checked: boolean) => {
    setSelectedDictData(prev => {
      if (checked) {
        return [...prev, dictData];
      } else {
        return prev.filter(item => item.id !== dictData.id);
      }
    });
  }, []);

  const handleSelectAllDictData = useCallback(() => {
    const isAllSelected = selectedDictData.length === dictDataList.length && dictDataList.length > 0;
    if (isAllSelected) {
      setSelectedDictData([]);
    } else {
      setSelectedDictData([...dictDataList]);
    }
  }, [dictDataList, selectedDictData.length]);

  const handleAddDictData = useCallback(() => {
    if (!selectedDictType) {
      toast.warning('请先选择字典类型');
      return;
    }
    setEditingDictData(null);
    setDictDataDialogOpen(true);
  }, [selectedDictType]);

  const handleEditDictData = useCallback((dictData: DictData) => {
    setEditingDictData({
      id: dictData.id,
      dictTypeId: dictData.dictTypeId,
      dictLabel: dictData.dictLabel,
      dictValue: dictData.dictValue,
      sort: dictData.sort,
    });
    setDictDataDialogOpen(true);
  }, []);

  const handleDeleteDictData = useCallback(async (dictData: DictData) => {
    if (confirm('确定要删除该字典数据吗？')) {
      try {
        await deleteDictData.mutateAsync([dictData.id]);
        toast.success('删除成功');
      } catch (error: any) {
        toast.error(error.message || '删除失败');
      }
    }
  }, [deleteDictData]);

  const handleSaveDictData = useCallback(async (data: DictDataForm) => {
    try {
      if (data.id) {
        await updateDictData.mutateAsync(data);
        toast.success('字典数据更新成功');
      } else {
        await addDictData.mutateAsync(data);
        toast.success('字典数据新增成功');
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
      throw error; // 重新抛出错误，阻止对话框关闭
    }
  }, [addDictData, updateDictData]);

  const handleBatchDeleteDictData = useCallback(async () => {
    if (selectedDictData.length === 0) {
      toast.warning('请选择要删除的字典数据');
      return;
    }

    if (confirm(`确定要删除选中的 ${selectedDictData.length} 个字典数据吗？`)) {
      try {
        const ids = selectedDictData.map(item => item.id);
        await deleteDictData.mutateAsync(ids);
        toast.success('删除成功');
        setSelectedDictData([]);
      } catch (error: any) {
        toast.error(error.message || '删除失败');
      }
    }
  }, [selectedDictData, deleteDictData]);

  // ==================== 搜索处理 ====================
  const handleSearch = useCallback(() => {
    goFirst();
    if (selectedDictType) {
      // 重新加载字典数据
    }
  }, [goFirst, selectedDictType]);

  // ==================== 分页操作 ====================
  const handlePageChange = useCallback((page: number) => {
    goToPage(page);
  }, [goToPage]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    goFirst();
  }, [setPageSize, goFirst]);

  // ==================== 页面渲染 ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HeaderBar 
        onSearch={(q) => setSearchTerm(q)}
        onSearchReset={() => setSearchTerm('')}
        searchQuery={searchTerm}
      />
      
      {/* 操作栏 */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            字典管理
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="请输入字典标签查询"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={handleSearch} variant="default">
              搜索
            </Button>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* 左侧字典类型面板 */}
          <div className="col-span-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">字典类型</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleAddDictType}
                      disabled={addDictType.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      新增
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={handleBatchDeleteDictType}
                      disabled={selectedDictTypes.length === 0 || deleteDictType.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      批量删除
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="overflow-auto h-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">选择</TableHead>
                        <TableHead>字典类型名称</TableHead>
                        <TableHead className="w-20">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dictTypeLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8">
                            加载中...
                          </TableCell>
                        </TableRow>
                      ) : dictTypeList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        dictTypeList.map((dictType) => (
                          <TableRow 
                            key={dictType.id}
                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                              selectedDictType?.id === dictType.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={() => handleDictTypeClick(dictType)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedDictTypes.some(item => item.id === dictType.id)}
                                onCheckedChange={(checked) => 
                                  handleDictTypeSelectionChange(dictType, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {dictType.dictName}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditDictType(dictType)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧字典数据面板 */}
          <div className="col-span-8">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">字典数据</CardTitle>
                    {selectedDictType && (
                      <Badge variant="secondary">
                        {selectedDictType.dictName}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {!selectedDictType ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    请选择字典类型查看数据
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    {/* 字典数据表格 */}
                    <div className="flex-1 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">选择</TableHead>
                            <TableHead>字典标签</TableHead>
                            <TableHead>字典值</TableHead>
                            <TableHead className="w-20">排序</TableHead>
                            <TableHead className="w-24">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dictDataLoading ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8">
                                加载中...
                              </TableCell>
                            </TableRow>
                          ) : dictDataList.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                暂无数据
                              </TableCell>
                            </TableRow>
                          ) : (
                            dictDataList.map((dictData) => (
                              <TableRow 
                                key={dictData.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={dictData.selected}
                                    onCheckedChange={(checked) => 
                                      handleDictDataSelectionChange(dictData, checked as boolean)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {dictData.dictLabel}
                                </TableCell>
                                <TableCell>{dictData.dictValue}</TableCell>
                                <TableCell>{dictData.sort}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditDictData(dictData)}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteDictData(dictData)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* 底部操作栏 */}
                    <div className="border-t p-4">
                      <div className="flex justify-between items-center">
                        {/* 左侧批量操作 */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSelectAllDictData}
                          >
                            {selectedDictData.length === dictDataList.length && dictDataList.length > 0 ? '取消全选' : '全选'}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleAddDictData}
                            disabled={!selectedDictType || addDictData.isPending}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            新增
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={handleBatchDeleteDictData}
                            disabled={selectedDictData.length === 0 || deleteDictData.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            批量删除
                          </Button>
                        </div>

                        {/* 右侧分页 */}
                        <div className="flex items-center gap-2">
                          <select 
                            value={pageSize} 
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value={10}>10条/页</option>
                            <option value={20}>20条/页</option>
                            <option value={50}>50条/页</option>
                            <option value={100}>100条/页</option>
                          </select>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {currentPage} / {totalPages || 1}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage >= totalPages}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                          
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            共 {totalDictData} 条记录
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 字典类型编辑对话框 */}
      <DictTypeDialog
        open={dictTypeDialogOpen}
        onClose={() => setDictTypeDialogOpen(false)}
        onSave={handleSaveDictType}
        title={editingDictType ? '编辑字典类型' : '新增字典类型'}
        initialData={editingDictType || undefined}
        isLoading={addDictType.isPending || updateDictType.isPending}
      />

      {/* 字典数据编辑对话框 */}
      <DictDataDialog
        open={dictDataDialogOpen}
        onClose={() => setDictDataDialogOpen(false)}
        onSave={handleSaveDictData}
        title={editingDictData ? '编辑字典数据' : '新增字典数据'}
        initialData={editingDictData || undefined}
        dictTypeId={selectedDictType?.id || 0}
        isLoading={addDictData.isPending || updateDictData.isPending}
      />
    </div>
  );
};