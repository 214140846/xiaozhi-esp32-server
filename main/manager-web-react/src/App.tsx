import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RetrievePasswordPage } from "./pages/RetrievePasswordPage";

import { DeviceManagement } from "./pages/DeviceManagement";
import { ModelConfigPage } from "./pages/ModelConfig";
import { ParamsManagementPage } from "./pages/ParamsManagement";
import AgentDetail from "./pages/AgentDetail";
import OtaManagementPage from "./pages/OtaManagement";
import DictManagementPage from "./pages/DictManagement";
import ProviderManagementPage from "./pages/ProviderManagement";
import { VoiceSlotManagement } from "./pages/VoiceSlotManagement";
import UsageStatistics from "./pages/UsageStatistics";

import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import { setNavigator } from "./lib/navigation";
import SiteMeta from "./components/SiteMeta";
import { queryClient } from "./lib/query-client";
import { useAuthRedirect } from "./hooks/useAuthRedirect";

// 主应用内容组件
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuthRedirect();
  const navigate = useNavigate();

  // 供非组件环境调用的全局导航器
  React.useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  const handleLoginSuccess = () => {
    console.log("[App] 登录成功回调，路由跳转到 /home");
    // 使用路由跳转，保持 SPA 体验
    navigate("/home", { replace: true });
  };

  const handleRegisterSuccess = () => {
    console.log("[App] 注册成功回调，路由跳转到登录页面");
    navigate("/login", { replace: true });
  };

  const handleRetrieveSuccess = () => {
    console.log("[App] 密码重置成功回调，路由跳转到登录页面");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  // 受保护的布局：已登录用户显示全局侧边栏 + 子路由
  const ProtectedLayout: React.FC = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage onSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<RegisterPage onSuccess={handleRegisterSuccess} />} />
      <Route path="/retrieve-password" element={<RetrievePasswordPage onSuccess={handleRetrieveSuccess} />} />

      {/* 所有需要侧边栏的页面放到受保护布局下 */}
      <Route element={<ProtectedLayout />}>
        <Route path="/home" element={<HomePage />} />
        {/* 设备管理（独立页面，保留） */}
        <Route path="/device-management" element={<DeviceManagement />} />
        {/* 音色管理 */}
        <Route path="/voice-slot-management" element={<VoiceSlotManagement />} />
        {/* 模型配置 */}
        <Route path="/model-management" element={<ModelConfigPage />} />
        {/* 字段管理（模型供应器） */}
        <Route path="/provider-management" element={<ProviderManagementPage />} />
        {/* 参数管理 */}
        <Route path="/params" element={<ParamsManagementPage />} />
        {/* OTA 固件管理 */}
        <Route path="/ota-management" element={<OtaManagementPage />} />
        {/* 字典管理 */}
        <Route path="/dict-management" element={<DictManagementPage />} />
        {/* 用量统计 */}
        <Route path="/usage-statistics" element={<UsageStatistics />} />
        {/* 智能体详情（Tab：会话/设备/声纹/MCP/音频） */}
        <Route path="/agent/:id" element={<AgentDetail />} />
        {/* 设备工具：注册/激活联调 */}
        {/* <Route path="/device-tools/activation" element={<DeviceActivationTool />} /> */}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// 主应用组件
function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <SiteMeta />
            <AppContent />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
