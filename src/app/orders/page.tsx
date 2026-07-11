import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/membership";
import OrderActions from "./OrderActions";

const STATUS_MAP: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

export default async function OrdersPage() {
  const session = await auth();
  const userId = parseInt((session?.user as any)?.id || "0");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const membership = user ? getMembership(user.totalSpent) : null;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的订单</h1>
        {membership && (
          <span className={`text-sm px-3 py-1 rounded-full ${
            membership.level > 0
              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
              : "bg-gray-100 text-gray-500"
          }`}>
            {membership.name}
            {membership.level > 0 && ` · ${((1 - membership.discount) * 10).toFixed(1)}折`}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无订单</p>
          <a href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            去逛逛
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-400">
                    订单 #{order.id} · {new Date(order.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  order.status === "cancelled"
                    ? "bg-gray-100 text-gray-500"
                    : order.status === "paid" || order.status === "shipped" || order.status === "completed"
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}>
                  {STATUS_MAP[order.status] || order.status}
                </span>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.product.image && (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="flex-1 truncate">{item.product.name}</span>
                    <span className="text-gray-400">x{item.quantity}</span>
                    <span className="text-gray-600">¥{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="text-sm">
                  {order.discount > 0 && (
                    <span className="text-gray-400 line-through mr-2">¥{order.total.toFixed(2)}</span>
                  )}
                  <span className="font-bold text-red-600">¥{order.finalTotal.toFixed(2)}</span>
                  {order.discount > 0 && (
                    <span className="text-green-600 text-xs ml-1">
                      ({(order.discount * 100).toFixed(0)}% off)
                    </span>
                  )}
                </div>
                <OrderActions orderId={order.id} status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
