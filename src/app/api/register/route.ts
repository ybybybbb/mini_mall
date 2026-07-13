import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(1, "昵称不能为空").max(50, "昵称最多50个字符"),
  email: z.string().email("邮箱格式不正确").max(100, "邮箱过长"),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .max(100, "密码过长")
    .regex(/[a-z]/, "密码需包含小写字母")
    .regex(/[A-Z]/, "密码需包含大写字母")
    .regex(/[0-9]/, "密码需包含数字"),
});

export async function POST(request: NextRequest) {
  // 速率限制：每个 IP 每分钟最多 5 次注册
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const rl = rateLimit(`register:${ip}`, 5, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "注册成功" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
