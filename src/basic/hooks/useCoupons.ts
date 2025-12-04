import { useCallback } from "react";
import { Coupon } from "../models/coupon";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";

export function useCoupons(initialCoupons: Coupon[]) {
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>("coupons", initialCoupons);

  const addCoupon = useCallback(
    (newCoupon: Coupon) => {
      setCoupons((prev) => [...prev, newCoupon]);
    },
    [coupons]
  );

  const removeCoupon = useCallback((couponCode: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
  }, []);

  return { coupons, addCoupon, removeCoupon };
}
