"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Mini Mall
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            商品
          </Link>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/cart" className="text-gray-600 hover:text-gray-900">
                购物车
              </Link>
              <Link href="/orders" className="text-gray-600 hover:text-gray-900">
                我的订单
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
                  后台管理
                </Link>
              )}
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-500 hover:text-gray-700"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                登录
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
