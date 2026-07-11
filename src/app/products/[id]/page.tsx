import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  });

  if (!product) notFound();

  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-6 flex gap-8">
        {/* 商品图片 */}
        <div className="w-96 h-96 bg-gray-100 rounded-xl overflow-hidden shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">暂无图片</div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="flex-1 flex flex-col">
          <p className="text-sm text-blue-600">{product.category.name}</p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          <p className="text-3xl font-bold text-red-600 mt-4">¥{product.price.toFixed(2)}</p>

          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>库存：{product.stock > 0 ? <span className="text-green-600">{product.stock} 件</span> : <span className="text-red-400">已售罄</span>}</p>
            <p>上架时间：{new Date(product.createdAt).toLocaleDateString("zh-CN")}</p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-sm mb-2">商品描述</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-auto pt-6">
            <AddToCartButton productId={product.id} stock={product.stock} isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  );
}
