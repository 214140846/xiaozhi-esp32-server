
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
    <div className="relative bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-pulse h-full flex flex-col">

      <div className="p-6 flex-1 flex flex-col">
        {/* 头部：基本信息（移除头像骨架） */}
        <div className="flex items-start justify-between mb-4">
          {/* 信息骨架 */}
          <div className="flex-1 space-y-2 pr-4">
            <div className="h-5 bg-muted rounded-md w-3/4"></div>
            <div className="h-3 bg-muted rounded-md w-full"></div>
            <div className="h-3 bg-muted rounded-md w-5/6"></div>
          </div>

          {/* 右上角动作位骨架 */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-muted rounded"></div>
          </div>
        </div>

        {/* 状态信息骨架 */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-muted rounded-full"></div>
            <div className="h-3 bg-muted rounded-md w-8"></div>
          </div>
          <div className="h-3 bg-muted rounded-md w-16"></div>
        </div>

        {/* 操作按钮骨架 */}
        <div className="mt-auto flex items-center space-x-2">
          <div className="flex-1 h-8 bg-muted rounded-md"></div>
          <div className="flex-1 h-8 bg-muted rounded-md"></div>
          <div className="w-8 h-8 bg-muted rounded-md"></div>
        </div>
      </div>

      {/* 流光动画效果 */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-shimmer"></div>
    </div>
  );
}
