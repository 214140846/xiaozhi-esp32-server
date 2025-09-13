
export interface SkeletonCardProps {}

/**
 * 骨架屏卡片组件
 * 
 * 功能包括：
 * - 模拟智能体卡片的布局
 * - 流光动画效果
 * - 适配暗色主题
 */
export function SkeletonCard({}: SkeletonCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* 顶部状态条 */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700"></div>
      
      <div className="p-6">
        {/* 头部：头像和基本信息 */}
        <div className="flex items-start space-x-4 mb-4">
          {/* 头像骨架 */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>

          {/* 信息骨架 */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
          </div>

          {/* 菜单按钮骨架 */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* 状态信息骨架 */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-8"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-16"></div>
        </div>

        {/* 操作按钮骨架 */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>

      {/* 流光动画效果 */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
  );
}