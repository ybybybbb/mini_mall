"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NEXT_STATUS: Record<string, { action: string; label: string }> = {
  pending: { action: "pay", label: "确认支付" },
  paid: { action: "ship", label: "发货" },
  shipped: { action: "complete", label: "完成" },
};

export default function AdminOrderActions({ orderId, status }: { orderId: number; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(action: string) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "操作失败" }));
      setError(data.error || "操作失败");
    }
    setLoading(false);
    if (res.ok) router.refresh();
  }

  const next = NEXT_STATUS[status];

  return (
    <div className="flex items-center gap-2 justify-end">
      {error && <span className="text-xs text-red-500">{error}</span>}
      {next && (
        <button
          onClick={() => handleAction(next.action)}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {next.label}
        </button>
      )}
      {(status === "pending" || status === "paid") && (
        <button
          onClick={() => handleAction("cancel")}
          disabled={loading}
          className="px-3 py-1 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          取消
        </button>
      )}
    </div>
  );
}
