import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!product) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function updateProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const categoryId = parseInt(formData.get("categoryId") as string);
    let image = (formData.get("image") as string) || null;

    if (!name.trim()) throw new Error("商品名不能为空");
    if (isNaN(price) || price <= 0) throw new Error("价格必须为正数");
    if (isNaN(stock) || stock < 0) throw new Error("库存不能为负数");
    if (isNaN(categoryId)) throw new Error("请选择分类");

    // 如果没有提供图片URL，自动生成卡通插图
    if (!image) {
      const { getProductImageUrl } = await import("@/lib/product-image");
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      image = getProductImageUrl(name, category!.name);
    }

    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { name, description, price, stock, categoryId, image },
    });

    redirect("/admin/products");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑商品</h1>
      <form action={updateProduct} className="max-w-lg space-y-4 bg-white p-6 rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium mb-1">商品名</label>
          <input name="name" defaultValue={product.name} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">描述</label>
          <textarea name="description" defaultValue={product.description} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">价格</label>
            <input name="price" type="number" step="0.01" defaultValue={product.price} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">库存</label>
            <input name="stock" type="number" defaultValue={product.stock} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <select name="categoryId" defaultValue={product.categoryId} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">图片URL（可选，留空则自动生成卡通插图）</label>
          <input name="image" defaultValue={product.image || ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          保存修改
        </button>
      </form>
    </div>
  );
}
