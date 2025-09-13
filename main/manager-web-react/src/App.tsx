import React from 'react';
import './App.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { useAuthRedirect } from './hooks/useAuthRedirect';
import { queryClient } from './lib/query-client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
      <Route path="/" element={<LoginPage onSuccess={handleLoginSuccess} />} />
      <Route path="/home" element={
        isAuthenticated ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-green-600">登录成功！</h1>
              <p className="text-muted-foreground">欢迎使用管理系统</p>
              <p className="text-sm text-muted-foreground">这里将来会是主应用界面</p>
            </div>
          </div>
        ) : (
          <Navigate to="/" replace />
        )
      }/>
      <Route path="/register" element={<div className="min-h-screen flex items-center justify-center">注册页面（占位）</div>} />
      <Route path="/retrieve-password" element={<div className="min-h-screen flex items-center justify-center">找回密码页面（占位）</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
