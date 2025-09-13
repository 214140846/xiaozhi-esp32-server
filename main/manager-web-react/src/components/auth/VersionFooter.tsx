/**
 * 版本信息底部组件
 */
import React from 'react';

interface VersionFooterProps {
  className?: string;
}

export const VersionFooter: React.FC<VersionFooterProps> = ({ 
  className = '' 
}) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`text-center text-sm text-muted-foreground ${className}`}>
      <div className="space-y-1">
        <p>© {currentYear} Management System</p>
        <p>Version v1.0.0</p>
      </div>
    </footer>
  );
};