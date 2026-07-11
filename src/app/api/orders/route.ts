import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/membership";

// 创建订单
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  // 获取购物车
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "购物车为空" }, { status: 400 });
  }

  // 检查库存
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `"${item.product.name}"库存不足，仅剩 ${item.product.stock} 件` },
        { status: 400 }
      );
    }
  }

  // 计算价格（含会员折扣）
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const membership = getMembership(user.totalSpent);
  const discount = membership.discount;
  const finalTotal = total * (1 - discount);

  // 创建订单
  const order = await prisma.order.create({
    data: {
      userId,
      total,
      discount,
      finalTotal,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: { items: true },
  });

  // 扣减库存
  for (const item of cartItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // 清空购物车
  await prisma.cartItem.deleteMany({ where: { userId } });

  return NextResponse.json({ orderId: order.id, total, discount, finalTotal });
}

// 获取用户订单
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
