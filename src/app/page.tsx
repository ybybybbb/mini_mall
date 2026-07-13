import { prisma } from "@/lib/prisma";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const searchEncoded = encodeURIComponent(search);
  const parsed = params.category ? parseInt(params.category) : undefined;
  const categoryId = parsed !== undefined && !isNaN(parsed) ? parsed : undefined;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const products = await prisma.product.findMany({
    where: {
      ...(search && { name: { contains: search } }),
      ...(categoryId && { categoryId }),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 搜索栏 */}
      <form className="flex gap-3 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="搜索商品..."
          className="flex-1 max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          搜索
        </button>
      </form>

      <div className="flex gap-6">
        {/* 分类筛选 */}
        <aside className="w-48 shrink-0">
          <h3 className="text-sm font-medium text-gray-500 mb-3">商品分类</h3>
          <ul className="space-y-1">
            <li>
              <a
                href="/"
                className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !categoryId
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                全部
              </a>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <a
                  href={`/?category=${cat.id}${search ? `&search=${searchEncoded}` : ""}`}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    categoryId === cat.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* 商品列表 */}
        <div className="flex-1">
          {products.length === 0 ? (
            <p className="text-gray-400 text-center py-20">没有找到商品</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category.name}</p>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      ¥{product.price.toFixed(2)}
                    </p>
                    {product.stock > 0 ? (
                      <p className="text-xs text-gray-400 mt-0.5">库存 {product.stock}</p>
                    ) : (
                      <p className="text-xs text-red-400 mt-0.5">已售罄</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
