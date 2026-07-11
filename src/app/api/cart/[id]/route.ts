import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 更新购物车数量
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const cartItemId = parseInt((await params).id);
  const { quantity } = await request.json();

  const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!cartItem || cartItem.userId !== userId) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return NextResponse.json({ message: "已更新" });
}

// 删除购物车项
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const cartItemId = parseInt((await params).id);

  const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!cartItem || cartItem.userId !== userId) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return NextResponse.json({ message: "已删除" });
}
