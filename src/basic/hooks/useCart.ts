// TODO: 장바구니 관리 Hook
// 힌트:
// 1. 장바구니 상태 관리 (localStorage 연동)
// 2. 상품 추가/삭제/수량 변경
// 3. 쿠폰 적용
// 4. 총액 계산
// 5. 재고 확인
//
// 사용할 모델 함수:
// - cartModel.addItemToCart
// - cartModel.removeItemFromCart
// - cartModel.updateCartItemQuantity
// - cartModel.calculateCartTotal
// - cartModel.getRemainingStock
//
// 반환할 값:
// 1 - cart: 장바구니 아이템 배열
// 1 - selectedCoupon: 선택된 쿠폰
// 1 - addToCart: 상품 추가 함수
// 1 - removeFromCart: 상품 제거 함수
// 1 - updateQuantity: 수량 변경 함수
// 1 - applyCoupon: 쿠폰 적용 함수
// 1 - calculateTotal: 총액 계산 함수
// 1 - getRemainingStock: 재고 확인 함수
// 1 - clearCart: 장바구니 비우기 함수

import { useCallback, useState } from "react";
import { CartItem } from "../models/cart";
import { Coupon } from "../models/coupon";
import { Product, ProductWithUI } from "../models/product";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";

export function useCart(callback?: (type: "error" | "success" | "warning", message: string) => void) {
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [cart, setCart] = useLocalStorage<CartItem[]>("cart", []);

  const calculateCartTotal = (): {
    totalBeforeDiscount: number;
    totalAfterDiscount: number;
  } => {
    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;

    cart.forEach((item) => {
      const itemPrice = item.product.price * item.quantity;
      totalBeforeDiscount += itemPrice;
      totalAfterDiscount += calculateItemTotal(item);
    });

    if (selectedCoupon) {
      if (selectedCoupon.discountType === "amount") {
        totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
      } else {
        totalAfterDiscount = Math.round(totalAfterDiscount * (1 - selectedCoupon.discountValue / 100));
      }
    }

    return {
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      totalAfterDiscount: Math.round(totalAfterDiscount),
    };
  };

  const calculateItemTotal = (item: CartItem): number => {
    const { price } = item.product;
    const { quantity } = item;
    const discount = getMaxApplicableDiscount(item);

    return Math.round(price * quantity * (1 - discount));
  };

  const getMaxApplicableDiscount = (item: CartItem): number => {
    const { discounts } = item.product;
    const { quantity } = item;

    const baseDiscount = discounts.reduce((maxDiscount, discount) => {
      return quantity >= discount.quantity && discount.rate > maxDiscount ? discount.rate : maxDiscount;
    }, 0);

    const hasBulkPurchase = cart.some((cartItem) => cartItem.quantity >= 10);
    if (hasBulkPurchase) {
      return Math.min(baseDiscount + 0.05, 0.5); // 대량 구매 시 추가 5% 할인
    }

    return baseDiscount;
  };

  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = calculateCartTotal().totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === "percentage") {
        callback?.("error", "percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.");
        return;
      }

      setSelectedCoupon(coupon);
      callback?.("success", "쿠폰이 적용되었습니다.");
    },
    [calculateCartTotal]
  );

  const getRemainingStock = (product: Product): number => {
    const cartItem = cart.find((item) => item.product.id === product.id);
    const remaining = product.stock - (cartItem?.quantity || 0);

    return remaining;
  };

  const addToCart = useCallback(
    (product: ProductWithUI) => {
      const remainingStock = getRemainingStock(product);
      if (remainingStock <= 0) {
        callback?.("error", "재고가 부족합니다!");
        return;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;

          if (newQuantity > product.stock) {
            callback?.("error", `재고는 ${product.stock}개까지만 있습니다.`);
            return prevCart;
          }

          return prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity: newQuantity } : item));
        }

        return [...prevCart, { product, quantity: 1 }];
      });

      callback?.("success", "장바구니에 담았습니다");
    },
    [cart, getRemainingStock]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (product: ProductWithUI, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(product.id);
        return;
      }

      const maxStock = product.stock;
      if (newQuantity > maxStock) {
        callback?.("error", `재고는 ${maxStock}개까지만 있습니다.`);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity: newQuantity } : item))
      );
    },
    [removeFromCart, getRemainingStock]
  );

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart,
    selectedCoupon,
    addToCart,
    removeFromCart,
    applyCoupon,
    calculateCartTotal,
    getRemainingStock,
    updateQuantity,
    clearCart,
  };
}
