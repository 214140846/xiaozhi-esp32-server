/**
 * 错误信息显示组件
 * 用于统一展示登录过程中的错误信息
 */
import React from 'react';

export interface ErrorDisplayProps {
  error: string | null;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  className = '' 
}) => {
  if (!error) return null;

  console.log('[ErrorDisplay] 显示错误信息:', error);

  return (
    <div className={`bg-destructive/10 border border-destructive/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-destructive" />
        </div>
        <p className="text-sm text-destructive font-medium">{error}</p>
      </div>
    </div>
  );
};