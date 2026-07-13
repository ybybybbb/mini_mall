import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 加入购物车
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const { productId, quantity } = await request.json();

  if (!productId || typeof productId !== "number" || productId <= 0) {
    return NextResponse.json({ error: "无效的商品" }, { status: 400 });
  }
  if (!quantity || typeof quantity !== "number" || quantity <= 0) {
    return NextResponse.json({ error: "数量必须大于0" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.stock < quantity) {
    return NextResponse.json({ error: "库存不足" }, { status: 400 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  }

  return NextResponse.json({ message: "已加入购物车" });
}

// 获取购物车
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(items);
}
