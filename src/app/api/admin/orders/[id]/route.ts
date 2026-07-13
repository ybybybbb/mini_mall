import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 管理员更新订单状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const orderId = parseInt((await params).id);
  const { action } = await request.json();

  if (action === "pay") {
    // 事务内原子执行：状态变更 + 消费累加
    await prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, status: "pending" },
        data: { status: "paid" },
      });
      if (result.count === 0) {
        throw new Error("NOT_ALLOWED");
      }
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (order) {
        await tx.user.update({
          where: { id: order.userId },
          data: { totalSpent: { increment: order.finalTotal } },
        });
      }
    });
    return NextResponse.json({ message: "支付成功", status: "paid" });
  }

  if (action === "ship") {
    const result = await prisma.order.updateMany({
      where: { id: orderId, status: "paid" },
      data: { status: "shipped" },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "订单状态不允许发货" }, { status: 400 });
    }
    return NextResponse.json({ message: "已发货", status: "shipped" });
  }

  if (action === "complete") {
    const result = await prisma.order.updateMany({
      where: { id: orderId, status: "shipped" },
      data: { status: "completed" },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "订单状态不允许完成" }, { status: 400 });
    }
    return NextResponse.json({ message: "已完成", status: "completed" });
  }

  if (action === "cancel") {
    const result = await prisma.order.updateMany({
      where: { id: orderId, status: { in: ["pending", "paid"] } },
      data: { status: "cancelled" },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "订单状态不允许取消" }, { status: 400 });
    }
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
