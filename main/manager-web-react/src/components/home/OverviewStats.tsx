
export interface OverviewStatsProps {
  agentCount: number;
  deviceCount: number;
  firmwareCount: number;
  modelCount: number;
}

/**
 * 概览统计卡片组件
 * - 展示：智能体数、设备数、固件数、模型数
 */
export function OverviewStats({ agentCount, deviceCount, firmwareCount, modelCount }: OverviewStatsProps) {
  const items = [
    { label: '智能体', value: agentCount },
    { label: '设备', value: deviceCount },
    { label: '固件', value: firmwareCount },
    { label: '模型', value: modelCount },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/5 opacity-40" />
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
            <div className="text-3xl font-bold text-foreground">{item.value}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
