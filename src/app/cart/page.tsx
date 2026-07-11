import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/membership";
import CartClient from "./CartClient";
import CheckoutButton from "./CheckoutButton";

export default async function CartPage() {
  const session = await auth();
  const userId = parseInt((session?.user as any)?.id || "0");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: { id: "desc" },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const membership = user ? getMembership(user.totalSpent) : null;

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = membership ? membership.discount : 0;
  const finalTotal = total * (1 - discount);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">购物车是空的</p>
          <a href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            去逛逛
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ¥{item.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CartClient itemId={item.id} initialQuantity={item.quantity} />
                </div>
                <p className="font-bold text-red-600 w-24 text-right">
                  ¥{(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 space-y-3">
            {membership && membership.level > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {membership.name}（{((1 - membership.discount) * 10).toFixed(1)}折）
                </span>
                <span className="text-green-600">-¥{(total * discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-lg">
                实付：<span className="text-2xl font-bold text-red-600">¥{finalTotal.toFixed(2)}</span>
              </p>
              <CheckoutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
