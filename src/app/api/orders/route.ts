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

  // 使用事务：库存检查 + 扣减 + 创建订单 + 清空购物车 原子执行
  try {
    const result = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new OrderError("购物车为空", 400);
      }

      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new OrderError(
            `"${item.product.name}"库存不足，仅剩 ${item.product.stock} 件`,
            400
          );
        }
      }

      const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const membership = getMembership(user.totalSpent);
      const discount = membership.discount;
      const finalTotal = total * (1 - discount);

      const order = await tx.order.create({
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

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return { orderId: order.id, total, discount, finalTotal };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "下单失败" }, { status: 500 });
  }
}

class OrderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
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
