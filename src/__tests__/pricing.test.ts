import { applyFullReduction } from "@/lib/pricing";

describe("满减逻辑", () => {
  test("满 1000 减 50", () => {
    expect(applyFullReduction(1000)).toBe(950);
  });

  test("差 1 分也不触发", () => {
    expect(applyFullReduction(999.99)).toBe(999.99);
  });

  test("刚好 0 元不报错", () => {
    expect(applyFullReduction(0)).toBe(0);
  });

  test("负数不崩溃", () => {
    expect(applyFullReduction(-10)).toBe(-10);
  });
});
