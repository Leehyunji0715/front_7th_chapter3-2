import { useState, useEffect } from "react";
import { Coupon } from "../types";
import { initialCoupons, initialProducts } from "./constants";
import { AdminPage } from "./pages/AdminPage";
import { CartPage } from "./pages/CartPage";
import { useCoupons } from "./hooks/useCoupons";
import { Notification } from "./components/Notification";
import { useNotification } from "./hooks/useNotification";
import { useProducts } from "./hooks/useProducts";
import { useCart } from "./hooks/useCart";
import { CartIcon } from "./components/icons";
import { useDebounce } from "./utils/hooks/useDebounce";

const App = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts(initialProducts);
  const { cart, ...cartMethods } = useCart((type, message) => addNotification(message, type));
  const { coupons, addCoupon, removeCoupon } = useCoupons(initialCoupons);
  const [totalItemCount, setTotalItemCount] = useState(0);

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  return (
    <div className="min-h-screen bg-gray-50">
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notif) => (
            <Notification key={notif.id} notification={notif} onClose={removeNotification} />
          ))}
        </div>
      )}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center flex-1">
              <h1 className="text-xl font-semibold text-gray-800">SHOP</h1>
              {/* 검색창 - 안티패턴: 검색 로직이 컴포넌트에 직접 포함 */}
              {!isAdmin && (
                <div className="ml-8 flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="상품 검색..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  isAdmin ? "bg-gray-800 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {isAdmin ? "쇼핑몰로 돌아가기" : "관리자 페이지로"}
              </button>
              {!isAdmin && (
                <div className="relative">
                  <CartIcon />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItemCount}
                    </span>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPage
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
            coupons={coupons}
            addCoupon={addCoupon}
            deleteCoupon={removeCoupon}
            selectedCoupon={selectedCoupon}
            setSelectedCoupon={setSelectedCoupon}
            addNotification={addNotification}
          />
        ) : (
          <CartPage
            products={products}
            coupons={coupons}
            setSelectedCoupon={setSelectedCoupon}
            debouncedSearchTerm={debouncedSearchTerm}
            addNotification={addNotification}
            cart={cart}
            {...cartMethods}
          />
        )}
      </main>
    </div>
  );
};

export default App;
