"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderActions({ orderId, status }: { orderId: number; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(action: string) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({ error: "操作失败" }));
    if (!res.ok) {
      setError(data.error || "操作失败");
    }
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      {status === "pending" && (
        <>
          <button
            onClick={() => handleAction("pay")}
            disabled={loading}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            支付
          </button>
          <button
            onClick={() => handleAction("cancel")}
            disabled={loading}
            className="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
        </>
      )}
      {status === "paid" && (
        <button
          onClick={() => handleAction("cancel")}
          disabled={loading}
          className="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          取消
        </button>
      )}
    </div>
  );
}
