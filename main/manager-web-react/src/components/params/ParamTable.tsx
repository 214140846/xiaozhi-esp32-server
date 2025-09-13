/**
 * 参数表格组件
 * 展示参数列表，支持选择、编辑、删除等操作
 */
import { useState } from 'react';
import { Button } from '../ui/button';
import type { ParamItem } from '../../types/params';
import { SENSITIVE_KEYS } from '../../types/params';

export interface ParamTableProps {
  params: ParamItem[];
  selectedRows: number[];
  loading: boolean;
  onRowSelection: (selectedRowKeys: number[]) => void;
  onEdit: (param: ParamItem) => void;
  onDelete: (id: number) => void;
}

export function ParamTable({
  params,
  selectedRows,
  loading,
  onRowSelection,
  onEdit,
  onDelete
}: ParamTableProps) {
  const [visibleSensitive, setVisibleSensitive] = useState<Record<number, boolean>>({});

  // 检查是否为敏感参数
  const isSensitiveParam = (paramCode: string): boolean => {
    return SENSITIVE_KEYS.some(key => 
      paramCode.toLowerCase().includes(key.toLowerCase())
    );
  };

  // 掩码显示敏感值
  const maskSensitiveValue = (value: string): string => {
    if (!value) return '';
    if (value.length <= 8) return '****';
    return value.substring(0, 4) + '****' + value.substring(value.length - 4);
  };

  // 切换敏感值显示
  const toggleSensitiveValue = (id: number) => {
    setVisibleSensitive(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 处理单行选择
  const handleRowSelect = (id: number, checked: boolean) => {
    if (checked) {
      onRowSelection([...selectedRows, id]);
    } else {
      onRowSelection(selectedRows.filter(rowId => rowId !== id));
    }
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onRowSelection(params.map(param => param.id));
    } else {
      onRowSelection([]);
    }
  };

  const isAllSelected = params.length > 0 && selectedRows.length === params.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < params.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-300">加载中...</span>
        </div>
      </div>
    );
  }

  if (params.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">📝</div>
          <p>暂无参数数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 w-16">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                参数编码
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                参数值
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                备注
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 w-32">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
{params.map((param) => {
              const isSelected = selectedRows.includes(param.id);
              const isSensitive = isSensitiveParam(param.paramCode);
              const shouldMask = isSensitive && !visibleSensitive[param.id];
              
              return (
                <tr
                  key={param.id}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {/* 选择列 */}
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleRowSelect(param.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  
                  {/* 参数编码 */}
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-mono text-sm">
                    {param.paramCode}
                  </td>
                  
                  {/* 参数值 */}
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`font-mono text-sm ${
                          shouldMask ? 'text-gray-500' : ''
                        }`}
                        title={shouldMask ? '敏感信息已隐藏' : param.paramValue}
                      >
                        {shouldMask ? maskSensitiveValue(param.paramValue) : param.paramValue}
                      </span>
                      
                      {isSensitive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSensitiveValue(param.id)}
                          className="h-6 px-2 text-xs"
                        >
                          {visibleSensitive[param.id] ? '隐藏' : '查看'}
                        </Button>
                      )}
                    </div>
                  </td>
                  
                  {/* 备注 */}
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    <span 
                      className="block truncate max-w-xs" 
                      title={param.remark}
                    >
                      {param.remark || '-'}
                    </span>
                  </td>
                  
                  {/* 操作 */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(param)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(param.id)}
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}