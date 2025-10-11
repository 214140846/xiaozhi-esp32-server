/*
 * @Author: yuyuhailian 1411102347@qq.com
 * @Date: 2025-09-29 16:04:21
 * @LastEditors: yuyuhailian 1411102347@qq.com
 * @LastEditTime: 2025-09-29 16:05:05
 * @FilePath: \manager-web-react\src\components\layout\navigation.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from "react";
import { Home, Package, SlidersHorizontal, BookText, PanelLeft, Volume2, BarChart3, Users } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { label: "概览", to: "/home", icon: <Home className="w-4 h-4" /> },
  // { label: '设备工具', to: '/device-tools/activation', icon: <Wrench className="w-4 h-4" /> },
  { label: "音色管理", to: "/voice-slot-management", icon: <Volume2 className="w-4 h-4" /> },
  { label: "音色分配", to: "/admin/voice-allocation", icon: <Users className="w-4 h-4" /> },
  { label: "用量统计", to: "/usage-statistics", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "OTA 固件", to: "/ota-management", icon: <Package className="w-4 h-4" /> },
  { label: "模型配置", to: "/model-management", icon: <PanelLeft className="w-4 h-4" /> },
  { label: "字段管理", to: "/provider-management", icon: <PanelLeft className="w-4 h-4" /> },
  { label: "参数管理", to: "/params", icon: <SlidersHorizontal className="w-4 h-4" /> },
  { label: "字典管理", to: "/dict-management", icon: <BookText className="w-4 h-4" /> },
];


