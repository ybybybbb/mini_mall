"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartClient({
  itemId,
  initialQuantity,
}: {
  itemId: number;
  initialQuantity: number;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);

  async function updateQuantity(newQty: number) {
    if (newQty < 1) {
      await deleteItem();
      return;
    }
    setLoading(true);
    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    setQuantity(newQty);
    setLoading(false);
    router.refresh();
  }

  async function deleteItem() {
    setLoading(true);
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => updateQuantity(quantity - 1)}
        disabled={loading}
        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
      >
        -
      </button>
      <span className="w-8 text-center text-sm">{quantity}</span>
      <button
        onClick={() => updateQuantity(quantity + 1)}
        disabled={loading}
        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
      >
        +
      </button>
      <button
        onClick={deleteItem}
        disabled={loading}
        className="ml-2 text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
      >
        删除
      </button>
    </>
  );
}
