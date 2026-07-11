"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  productId,
  stock,
  isLoggedIn,
}: {
  productId: number;
  stock: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function addToCart() {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/products/${productId}`);
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage("已加入购物车");
      setTimeout(() => setMessage(""), 2000);
      router.refresh();
    } else {
      setMessage(data.error || "操作失败");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={addToCart}
        disabled={loading || stock === 0}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {stock === 0 ? "已售罄" : loading ? "添加中..." : "加入购物车"}
      </button>
      {message && (
        <span className={`text-sm ${message.includes("失败") ? "text-red-500" : "text-green-600"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
