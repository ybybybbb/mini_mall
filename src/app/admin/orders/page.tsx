import { prisma } from "@/lib/prisma";
import AdminOrderActions from "./AdminOrderActions";

const STATUS_MAP: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3">订单号</th>
              <th className="text-left px-4 py-3">用户</th>
              <th className="text-left px-4 py-3">商品</th>
              <th className="text-right px-4 py-3">金额</th>
              <th className="text-center px-4 py-3">状态</th>
              <th className="text-right px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-gray-50">
                <td className="px-4 py-3 text-gray-400">#{order.id}</td>
                <td className="px-4 py-3">{order.user.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  {order.items.map((i) => i.product.name).join("、")}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  ¥{order.finalTotal.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "cancelled"
                      ? "bg-gray-100 text-gray-500"
                      : order.status === "paid" || order.status === "shipped" || order.status === "completed"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {STATUS_MAP[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminOrderActions orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
