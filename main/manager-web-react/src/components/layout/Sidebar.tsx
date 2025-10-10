import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
// 移除品牌图片，遵循不出现特定品牌字样与图片的约束
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { navItems } from "./navigation";

// 导航配置移至独立文件，避免与组件同文件导出导致 Fast Refresh 限制

export function Sidebar() {
  const { publicConfig } = useAuth();
  // 读取用户信息判断是否管理员
  let isAdmin = false;
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('userInfo') : null;
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.roleType === 'superAdmin' || u?.superAdmin === 1) isAdmin = true;
    }
  } catch {}
  const homeConfig = (publicConfig?.homeConfig || {}) as Record<string, unknown>;
  const platformSubTitle = (homeConfig.platformSubTitle || "管理平台") as string;

  return (
    <aside className="hidden md:flex md:flex-col w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 supports-[backdrop-filter]:dark:bg-gray-900/50">
      {/* Brand */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <span className="font-semibold">{platformSubTitle}</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-0.5 overflow-y-auto">
        {navItems
          .filter((item) => {
            // 仅管理员可见 /admin 路由
            if (item.to.startsWith('/admin') && !isAdmin) return false;
            return true;
          })
          .map((item) => (
          <NavLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors overflow-hidden",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )
            }
            end={item.to === "/home"}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-md bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className={cn("relative z-10 text-muted-foreground group-hover:text-foreground", isActive && "text-primary-foreground")}>{item.icon}</span>
                <span className="relative z-10 truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer spacer */}
      <div className="mt-auto p-3 text-xs text-gray-400">v1.0</div>
    </aside>
  );
}

export default Sidebar;
