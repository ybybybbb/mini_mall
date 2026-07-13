import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function createCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name.trim()) return;
    await prisma.category.create({ data: { name: name.trim() } });
    revalidatePath("/admin/categories");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = parseInt(formData.get("id") as string);
    try {
      await prisma.category.delete({ where: { id } });
    } catch (error) {
      return; // 忽略外键约束（分类下有商品时不可删除）
    }
    revalidatePath("/admin/categories");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">分类管理</h1>

      <form action={createCategory} className="flex gap-3 mb-6 max-w-md">
        <input
          name="name"
          placeholder="新分类名称"
          required
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          添加
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden max-w-md">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
            <span className="text-sm">{cat.name}</span>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={cat.id} />
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-600"
              >
                删除
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
