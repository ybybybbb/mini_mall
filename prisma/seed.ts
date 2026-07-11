import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 创建管理员
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      email: "admin@minimall.com",
      password: adminPassword,
      name: "管理员",
      role: "admin",
    },
  });
  console.log("Admin user:", admin.email);

  // 创建测试用户
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@minimall.com" },
    update: {},
    create: {
      email: "user@minimall.com",
      password: userPassword,
      name: "测试用户",
      role: "user",
      totalSpent: 0,
    },
  });
  console.log("Test user:", user.email);

  // 创建分类
  const categories = [
    { name: "手机数码" },
    { name: "电脑办公" },
    { name: "家用电器" },
    { name: "服装鞋帽" },
    { name: "食品生鲜" },
    { name: "图书音像" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("Categories created:", categories.length);

  const allCategories = await prisma.category.findMany();

  // 创建商品
  const products = [
    { name: "iPhone 16 Pro Max", description: "Apple 最新旗舰手机，A18 Pro 芯片", price: 9999, stock: 100, categoryId: allCategories[0].id, image: "https://picsum.photos/seed/iphone16/400/400" },
    { name: "华为 Mate 70 Pro", description: "华为旗舰，麒麟芯片，卫星通信", price: 6999, stock: 80, categoryId: allCategories[0].id, image: "https://picsum.photos/seed/mate70/400/400" },
    { name: "MacBook Pro 16寸", description: "M4 Pro 芯片，32GB 内存，1TB 存储", price: 19999, stock: 50, categoryId: allCategories[1].id, image: "https://picsum.photos/seed/macbook/400/400" },
    { name: "ThinkPad X1 Carbon", description: "商务轻薄本，i7-155H，16GB，512GB", price: 8999, stock: 60, categoryId: allCategories[1].id, image: "https://picsum.photos/seed/thinkpad/400/400" },
    { name: "戴森 V16 无线吸尘器", description: "激光探测，强劲吸力，60分钟续航", price: 4999, stock: 120, categoryId: allCategories[2].id, image: "https://picsum.photos/seed/dyson/400/400" },
    { name: "小米电视 S Pro 85寸", description: "Mini LED，144Hz 高刷，4K 超清", price: 7999, stock: 40, categoryId: allCategories[2].id, image: "https://picsum.photos/seed/mitv/400/400" },
    { name: "Nike Air Max 270", description: "经典气垫跑鞋，舒适缓震", price: 899, stock: 200, categoryId: allCategories[3].id, image: "https://picsum.photos/seed/nike/400/400" },
    { name: "优衣库轻薄羽绒服", description: "轻量保暖，可收纳设计", price: 499, stock: 150, categoryId: allCategories[3].id, image: "https://picsum.photos/seed/uniqlo/400/400" },
    { name: "智利车厘子 5斤装", description: "JJ级大果，空运直达，新鲜直达", price: 299, stock: 500, categoryId: allCategories[4].id, image: "https://picsum.photos/seed/cherry/400/400" },
    { name: "三只松鼠坚果礼盒", description: "每日坚果，混合装 30 包", price: 139, stock: 300, categoryId: allCategories[4].id, image: "https://picsum.photos/seed/nuts/400/400" },
    { name: "深入理解计算机系统", description: "CSAPP 经典教材，程序员必读", price: 99, stock: 80, categoryId: allCategories[5].id, image: "https://picsum.photos/seed/csapp/400/400" },
    { name: "三体全集", description: "刘慈欣科幻巨著，全三册套装", price: 79, stock: 200, categoryId: allCategories[5].id, image: "https://picsum.photos/seed/santi/400/400" },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log("Products created:", products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
