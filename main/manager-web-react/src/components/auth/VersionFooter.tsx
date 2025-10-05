/*
 * @Author: yuyuhailian 1411102347@qq.com
 * @Date: 2025-09-28 23:38:19
 * @LastEditors: yuyuhailian 1411102347@qq.com
 * @LastEditTime: 2025-09-29 11:05:22
 * @FilePath: \manager-web-react\src\components\auth\VersionFooter.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 版本信息底部组件（支持后台自定义首页文案）
 */
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface VersionFooterProps {
  className?: string;
}

interface HomeConfig {
  platformName?: string | null;
  platformSubTitle?: string | null;
  footerText?: string | null;
}

type PublicConfigLite = {
  beianIcpNum?: string | null;
  beianGaNum?: string | null;
  homeConfig?: HomeConfig | null;
  name?: string | null;
} | null;

function sanitizeOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  const lower = text.toLowerCase();
  if (lower === 'null' || lower === 'undefined' || lower === 'nan') return undefined;
  return text;
}

export const VersionFooter: React.FC<VersionFooterProps> = ({ className = '' }) => {
  const { publicConfig } = useAuth();
  const cfg = (publicConfig ?? null) as PublicConfigLite;
  const homeConfig: HomeConfig = (cfg?.homeConfig ?? {}) as HomeConfig;
  const platformName = sanitizeOptionalString(homeConfig.platformName) || sanitizeOptionalString(cfg?.name) || '正解 AIoT';
  const platformSubTitle = sanitizeOptionalString(homeConfig.platformSubTitle) || '管理平台';
  const rawFooterText = homeConfig.footerText ?? '';
  const rawBeianIcpNum = cfg?.beianIcpNum ?? undefined;
  const rawBeianGaNum = cfg?.beianGaNum ?? undefined;

  const footerText = sanitizeOptionalString(rawFooterText);
  const beianIcpNum = sanitizeOptionalString(rawBeianIcpNum);
  const beianGaNum = sanitizeOptionalString(rawBeianGaNum);

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
