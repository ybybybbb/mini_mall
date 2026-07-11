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
  const { action } = await request.json(); // "pay" | "cancel" | "ship" | "complete"

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  let newStatus = order.status;

  if (action === "pay" && order.status === "pending") {
    newStatus = "paid";
    // 累加用户消费金额
    await prisma.user.update({
      where: { id: userId },
      data: { totalSpent: { increment: order.finalTotal } },
    });
  } else if (action === "cancel" && ["pending", "paid"].includes(order.status)) {
    newStatus = "cancelled";
    // 恢复库存
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  } else {
    return NextResponse.json({ error: "无效操作" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  return NextResponse.json({ message: "操作成功", status: newStatus });
}
