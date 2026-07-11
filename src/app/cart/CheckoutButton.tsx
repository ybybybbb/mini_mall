"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "下单失败");
      setLoading(false);
      return;
    }

    router.push(`/orders?orderId=${data.orderId}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-sm text-red-500">{error}</span>}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? "提交中..." : "提交订单"}
      </button>
    </div>
  );
}
