import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 更新订单状态 / 支付 / 取消
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const orderId = parseInt((await params).id);
  const { action } = await request.json();

  // 验证订单归属
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  if (action === "pay") {
    try {
      // 事务内原子执行：状态变更 + 消费累加
      await prisma.$transaction(async (tx) => {
        const result = await tx.order.updateMany({
          where: { id: orderId, status: "pending" },
          data: { status: "paid" },
        });
        if (result.count === 0) {
          throw new Error("NOT_ALLOWED");
        }
        await tx.user.update({
          where: { id: userId },
          data: { totalSpent: { increment: order.finalTotal } },
        });
      });
      return NextResponse.json({ message: "支付成功", status: "paid" });
    } catch (e: any) {
      if (e.message === "NOT_ALLOWED") {
        return NextResponse.json({ error: "订单状态不允许支付" }, { status: 400 });
      }
      throw e;
    }
  }

  if (action === "cancel") {
    // 原子条件更新：仅 pending/paid → cancelled
    const result = await prisma.order.updateMany({
      where: { id: orderId, status: { in: ["pending", "paid"] } },
      data: { status: "cancelled" },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "订单状态不允许取消" }, { status: 400 });
    }
    // 更新成功后才恢复库存
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return NextResponse.json({ message: "已取消", status: "cancelled" });
  }

  return NextResponse.json({ error: "无效操作" }, { status: 400 });
}
