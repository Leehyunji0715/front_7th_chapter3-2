// TODO: 쿠폰 관리 Hook
// 힌트:
// 1. 쿠폰 목록 상태 관리 (localStorage 연동 고려)
// 2. 쿠폰 추가/삭제
//
// 반환할 값:
// - coupons: 쿠폰 배열
// - addCoupon: 새 쿠폰 추가
// - removeCoupon: 쿠폰 삭제

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
