/**
 * 满减计算
 * @param total 原始总价
 * @returns 满减后价格
 */
export function applyFullReduction(total: number): number {
  if (total < 0) return total; // 负数不处理
  if (total >= 1000) return total - 50;
  return total;
}
