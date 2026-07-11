import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-48 bg-white border-r border-gray-100 p-4 shrink-0">
        <h2 className="font-bold text-sm mb-4">后台管理</h2>
        <nav className="space-y-1">
          <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            数据概览
          </Link>
          <Link href="/admin/products" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            商品管理
          </Link>
          <Link href="/admin/orders" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            订单管理
          </Link>
          <Link href="/admin/categories" className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            分类管理
          </Link>
        </nav>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
