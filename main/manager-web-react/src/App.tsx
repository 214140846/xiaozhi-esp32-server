import React from 'react';
import './App.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RetrievePasswordPage } from './pages/RetrievePasswordPage';
import { HomePage } from './pages/HomePage';
import { ParamsManagementPage } from './pages/ParamsManagementPage';
import { DeviceManagement } from './pages/DeviceManagement';
import OtaManagementPage from './pages/OtaManagementPage';
import { DictManagementPage } from './pages/DictManagementPage';
import { useAuthRedirect } from './hooks/useAuthRedirect';
import { queryClient } from './lib/query-client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// 主应用内容组件
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuthRedirect();

  const handleLoginSuccess = () => {
    console.log('[App] 登录成功回调，跳转到 /home');
    // 与 Vue 行为一致：登录成功跳转到 /home
    try {
      window.location.href = '/home';
    } catch (e) {
      console.error('跳转失败', e);
    }
  };

  const handleRegisterSuccess = () => {
    console.log('[App] 注册成功回调，跳转到登录页面');
    // 注册成功后跳转到登录页面
    window.location.href = '/login';
  };

  const handleRetrieveSuccess = () => {
    console.log('[App] 密码重置成功回调，跳转到登录页面');
    // 密码重置成功后跳转到登录页面
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage onSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<RegisterPage onSuccess={handleRegisterSuccess} />} />
      <Route path="/retrieve-password" element={<RetrievePasswordPage onSuccess={handleRetrieveSuccess} />} />
      <Route path="/home" element={
        isAuthenticated ? (
          <HomePage />
        ) : (
          <Navigate to="/login" replace />
        )
      }/>
      <Route path="/params" element={
        isAuthenticated ? (
          <ParamsManagementPage />
        ) : (
          <Navigate to="/login" replace />
        )
      }/>
      <Route path="/device-management" element={
        isAuthenticated ? (
          <DeviceManagement />
        ) : (
          <Navigate to="/login" replace />
        )
      }/>
      <Route path="/ota-management" element={
        isAuthenticated ? (
          <OtaManagementPage />
        ) : (
          <Navigate to="/login" replace />
        )
      }/>
      <Route path="/dict-management" element={
        isAuthenticated ? (
          <DictManagementPage />
        ) : (
          <Navigate to="/login" replace />
        )
      }/>
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
            <AppContent />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
