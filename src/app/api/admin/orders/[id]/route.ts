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

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  let newStatus = order.status;

  if (action === "pay" && order.status === "pending") {
    newStatus = "paid";
    await prisma.user.update({
      where: { id: order.userId },
      data: { totalSpent: { increment: order.finalTotal } },
    });
  } else if (action === "ship" && order.status === "paid") {
    newStatus = "shipped";
  } else if (action === "complete" && order.status === "shipped") {
    newStatus = "completed";
  } else if (action === "cancel" && ["pending", "paid"].includes(order.status)) {
    newStatus = "cancelled";
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
