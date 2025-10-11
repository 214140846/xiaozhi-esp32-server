export function formatNumber(n: number | undefined | null): string {
  const v = typeof n === 'number' ? n : 0;
  return new Intl.NumberFormat('zh-CN').format(v);
}

