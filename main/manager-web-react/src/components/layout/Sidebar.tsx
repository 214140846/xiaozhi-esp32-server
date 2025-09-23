import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Bot, Wrench, Package, SlidersHorizontal, BookText, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
// 移除品牌图片，遵循不出现特定品牌字样与图片的约束
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

export interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { label: "概览", to: "/home", icon: <Home className="w-4 h-4" /> },
  { label: "我的智能体", to: "/home", icon: <Bot className="w-4 h-4" /> },
  // { label: '设备工具', to: '/device-tools/activation', icon: <Wrench className="w-4 h-4" /> },
  { label: "OTA 固件", to: "/ota-management", icon: <Package className="w-4 h-4" /> },
  { label: "模型配置", to: "/model-management", icon: <PanelLeft className="w-4 h-4" /> },
  { label: "字段管理", to: "/provider-management", icon: <PanelLeft className="w-4 h-4" /> },
  { label: "参数管理", to: "/params", icon: <SlidersHorizontal className="w-4 h-4" /> },
  { label: "字典管理", to: "/dict-management", icon: <BookText className="w-4 h-4" /> },
];

export function Sidebar() {
  const location = useLocation();
  const { publicConfig } = useAuth();
  const homeConfig = (publicConfig?.homeConfig || {}) as Record<string, any>;
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
      <nav className="p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={cn(
                "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <span className={cn("text-gray-500 group-hover:text-current", active && "text-white")}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer spacer */}
      <div className="mt-auto p-3 text-xs text-gray-400">v1.0</div>
    </aside>
  );
}

export default Sidebar;
