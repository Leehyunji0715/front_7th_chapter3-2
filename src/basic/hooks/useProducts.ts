// TODO: 상품 관리 Hook
// 힌트:
// 1. 상품 목록 상태 관리 (localStorage 연동 고려)
// 2. 상품 CRUD 작업
// 3. 재고 업데이트
// 4. 할인 규칙 추가/삭제
//
// 반환할 값:
// - products: 상품 배열
// - updateProduct: 상품 정보 수정
// - addProduct: 새 상품 추가
// - updateProductStock: 재고 수정
// - addProductDiscount: 할인 규칙 추가
// - removeProductDiscount: 할인 규칙 삭제

import { useCallback, useEffect, useState } from "react";
import { ProductWithUI } from "../models/product";

export function useProducts(
  initialProducts: ProductWithUI[]
  // callback: {
  //   add: (newProduct: ProductWithUI) => void;
  //   update: (updates: Partial<ProductWithUI>) => void;
  //   remove: (productId: string) => void;
  // }
) {
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const addProduct = useCallback((newProduct: Omit<ProductWithUI, "id">) => {
    const product: ProductWithUI = {
      ...newProduct,
      id: `p${Date.now()}`,
    };
    setProducts((prev) => [...prev, product]);
    // callback.add(product);
  }, []);

  const updateProduct = useCallback((productId: string, updates: Partial<ProductWithUI>) => {
    setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, ...updates } : product)));
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const updateProductStock = useCallback((id: string, stock: number) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, stock } : product)));
    // Object.entries(orderedProductCounts).forEach(([id, count]) => {
    //   setProducts((prev) =>
    //     prev.map((product) => (product.id === id ? { ...product, stock } : product))
    //   );
    // });
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // TODO: 구현
  return { products, addProduct, updateProduct, deleteProduct, updateProductStock };
}
