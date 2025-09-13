import { Button } from '../ui/button';
import { Plus, ArrowRight } from 'lucide-react';

export interface WelcomeBannerProps {
  /** 添加智能体回调 */
  onAddAgent: () => void;
}

/**
 * 欢迎横幅组件
 * 
 * 功能包括：
 * - 显示欢迎信息
 * - 添加智能体按钮
 * - 美观的渐变背景
 */
export function WelcomeBanner({ onAddAgent }: WelcomeBannerProps) {
  console.log('[WelcomeBanner] 渲染欢迎横幅');

  return (
    <div className="relative mb-8 h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
      {/* 背景装饰 */}
      <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-30'></div>
      
      {/* 主要内容 */}
      <div className="relative z-10 h-full flex items-center px-16">
        <div className="text-white">
          {/* 问候语 */}
          <div className="space-y-2 mb-6">
            <h1 className="text-4xl font-bold">
              你好，欢迎回来
            </h1>
            <h2 className="text-4xl font-bold">
              让我们开始
              <span className="text-yellow-300 ml-2">美好的工作！</span>
            </h2>
            <p className="text-blue-100 text-sm mt-3">
              Hello, Let's have a wonderful day!
            </p>
          </div>

          {/* 添加智能体按钮组 */}
          <div className="flex items-center space-x-0">
            {/* 主按钮 */}
            <Button
              onClick={onAddAgent}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-l-full rounded-r-none border-0 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加智能体
            </Button>
            
            {/* 装饰条 */}
            <div className="w-6 h-12 bg-blue-500 -ml-2 z-0"></div>
            
            {/* 箭头按钮 */}
            <Button
              onClick={onAddAgent}
              className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-full border-0 shadow-lg transition-all duration-200 transform hover:scale-110 -ml-3 z-10"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 右侧装饰图形 */}
        <div className="ml-auto hidden lg:block">
          <div className="relative">
            {/* 装饰圆圈 */}
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            {/* 浮动装饰 */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent"></div>
    </div>
  );
}
