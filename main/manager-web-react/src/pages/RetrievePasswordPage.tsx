/**
 * 找回密码页面组件
 * 通过手机号验证重置密码
 */
import React from 'react';
import { RetrievePasswordForm } from '../components/auth/RetrievePasswordForm';
import { VersionFooter } from '../components/auth/VersionFooter';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { Building2, KeyRound, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import LiquidChrome from '../components/LiquidChrome';

interface RetrievePasswordPageProps {
  onSuccess?: () => void;
}

export const RetrievePasswordPage: React.FC<RetrievePasswordPageProps> = ({ onSuccess }) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 text-white">
      <LiquidChrome className="absolute inset-0 z-0 pointer-events-none" interactive={false} />
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
                忘记密码？
                <br />
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  快速找回
                </span>
              </h2>
              <p className="text-lg text-white/80 max-w-md">
                通过手机号验证，安全快速地重置您的密码
              </p>
            </div>
            
            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">快速重置</h3>
                  <p className="text-sm text-white/70">几分钟内即可完成密码重置</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">安全验证</h3>
                  <p className="text-sm text-white/70">多重验证确保账户安全</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Retrieve Password Form */}
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-card-foreground">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-card-foreground mb-2">重置密码</h1>
                <p className="text-sm text-muted-foreground">
                  请输入您的手机号并验证身份
                </p>
              </div>

              {/* Retrieve Password Form */}
              <RetrievePasswordForm 
                onSuccess={onSuccess}
                className="space-y-6"
              />

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  想起密码了？{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    返回登录
                  </Link>
                </p>
              </div>

              {/* Register Link */}
              <div className="mt-3 text-center">
                <p className="text-sm text-muted-foreground">
                  还没有账户？{' '}
                  <Link 
                    to="/register" 
                    className="text-green-600 hover:text-green-500 font-medium transition-colors"
                  >
                    立即注册
                  </Link>
                </p>
              </div>

              {/* Terms */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  继续即表示您同意我们的{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    用户协议
                  </a>
                  {' '}和{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    隐私政策
                  </a>
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
