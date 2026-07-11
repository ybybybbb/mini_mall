export interface MembershipInfo {
  level: number;   // 0=普通, 1=心悦1, 2=心悦2, 3=心悦3
  name: string;
  discount: number; // 折扣率, 0 / 0.02 / 0.05 / 0.1
}

const MEMBERSHIP_TIERS: { minSpent: number; level: number; name: string; discount: number }[] = [
  { minSpent: 800000, level: 3, name: "心悦3", discount: 0.10 },
  { minSpent: 80000, level: 2, name: "心悦2", discount: 0.05 },
  { minSpent: 8000, level: 1, name: "心悦1", discount: 0.02 },
];

export function getMembership(totalSpent: number): MembershipInfo {
  for (const tier of MEMBERSHIP_TIERS) {
    if (totalSpent >= tier.minSpent) {
      return {
        level: tier.level,
        name: tier.name,
        discount: tier.discount,
      };
    }
  }

  return {
    level: 0,
    name: "普通会员",
    discount: 0,
  };
}

export function getNextTier(totalSpent: number): { name: string; needMore: number } | null {
  const current = getMembership(totalSpent);
  const tiersDesc = [...MEMBERSHIP_TIERS].sort((a, b) => a.minSpent - b.minSpent);

  for (const tier of tiersDesc) {
    if (totalSpent < tier.minSpent) {
      return {
        name: tier.name,
        needMore: tier.minSpent - totalSpent,
      };
    }
  }

  return null; // 已满级
}
