import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [userCount, productCount, orderCount, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { finalTotal: true }, where: { status: { not: "cancelled" } } }),
  ]);

  const revenue = totalRevenue._sum.finalTotal || 0;

  const stats = [
    { label: "用户数", value: userCount },
    { label: "商品数", value: productCount },
    { label: "订单数", value: orderCount },
    { label: "营收", value: `¥${revenue.toFixed(2)}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">数据概览</h1>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
