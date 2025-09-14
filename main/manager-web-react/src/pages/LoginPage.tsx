/**
 * 登录页面主组件
 * 现代化设计的管理系统登录页面
 */
import { Building2, Shield, Zap } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { VersionFooter } from "../components/auth/VersionFooter";
import LiquidChrome from "../components/LiquidChrome";
import { ThemeToggle } from "../components/ui/theme-toggle";

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 text-white">
      <LiquidChrome className="absolute inset-0 z-0 pointer-events-none" interactive={true} />
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Management System</h1>
            <p className="text-xs text-white/80">管理系统</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl flex items-center justify-between gap-16">
          {/* Left Side - Marketing Content */}
          <div className="hidden lg:flex flex-1 flex-col justify-center space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                欢迎使用
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  管理系统
                </span>
              </h2>
              <p className="text-lg text-white/80 max-w-md">安全、高效、现代化的管理平台，为您的业务提供强大的支持</p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">安全可靠</h3>
                  <p className="text-sm text-white/70">多重安全验证保护您的数据</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">快速高效</h3>
                  <p className="text-sm text-white/70">响应迅速的现代化界面</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-card-foreground">
              {/* Login Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-card-foreground mb-2">登录账户</h1>
                <p className="text-sm text-muted-foreground">请输入您的凭据以访问系统</p>
              </div>

              {/* Login Form */}
              <LoginForm onSuccess={onSuccess} className="space-y-6" />

              {/* Navigation Links */}
              <div className="mt-6 space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                  还没有账户？{" "}
                  <Link to="/register" className="text-green-600 hover:text-green-500 font-medium transition-colors">
                    立即注册
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  忘记密码？{" "}
                  <Link
                    to="/retrieve-password"
                    className="text-orange-600 hover:text-orange-500 font-medium transition-colors"
                  >
                    找回密码
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-white/70">
        <VersionFooter />
      </footer>
    </div>
  );
};
