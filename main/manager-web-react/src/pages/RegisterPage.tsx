/**
 * 注册页面组件
 * 用户注册页面，支持用户名注册和手机号注册
 */
import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { VersionFooter } from '../components/auth/VersionFooter';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { Building2, UserPlus, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegisterPageProps {
  onSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Management System</h1>
            <p className="text-xs text-muted-foreground">管理系统</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl flex items-center justify-between gap-16">
          {/* Left Side - Marketing Content */}
          <div className="hidden lg:flex flex-1 flex-col justify-center space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground leading-tight">
                加入我们
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  开始使用
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                创建您的账户，享受我们提供的优质管理服务
              </p>
            </div>
            
            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">快速注册</h3>
                  <p className="text-sm text-muted-foreground">简单几步即可完成账户创建</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">安全保护</h3>
                  <p className="text-sm text-muted-foreground">您的信息将受到严格保护</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full max-w-md">
            <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl shadow-2xl p-8">
              {/* Register Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-card-foreground mb-2">创建账户</h1>
                <p className="text-sm text-muted-foreground">
                  请填写以下信息完成注册
                </p>
              </div>

              {/* Register Form */}
              <RegisterForm 
                onSuccess={onSuccess}
                className="space-y-6"
              />

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  已有账户？{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    立即登录
                  </Link>
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  注册即表示您同意我们的{' '}
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
      <footer className="p-6">
        <VersionFooter />
      </footer>
    </div>
  );
};