/**
 * 版本信息底部组件（支持后台自定义首页文案）
 */
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface VersionFooterProps {
  className?: string;
}

export const VersionFooter: React.FC<VersionFooterProps> = ({ className = '' }) => {
  const { publicConfig } = useAuth();
  const homeConfig = (publicConfig?.homeConfig || {}) as Record<string, any>;
  const platformName = (homeConfig.platformName || publicConfig?.name || '正解 AIoT') as string;
  const platformSubTitle = (homeConfig.platformSubTitle || '管理平台') as string;
  const footerText = (homeConfig.footerText || '') as string;
  const beianIcpNum = (publicConfig as any)?.beianIcpNum as string | undefined;
  const beianGaNum = (publicConfig as any)?.beianGaNum as string | undefined;

  return (
    <footer className={`text-center text-sm text-muted-foreground ${className}`}>
      <div className="space-y-1">
        {footerText ? (
          <p>{footerText}</p>
        ) : (
          <>
            <p>{platformName}</p>
            <p>{platformSubTitle}</p>
          </>
        )}
        {beianIcpNum && (
          <p>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:underline">
              {beianIcpNum}
            </a>
          </p>
        )}
        {beianGaNum && (
          <p>
            <a href="https://www.beian.gov.cn/" target="_blank" rel="noreferrer" className="hover:underline">
              {beianGaNum}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
};
