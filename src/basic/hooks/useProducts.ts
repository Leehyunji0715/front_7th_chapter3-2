import { useCallback } from "react";
import { ProductWithUI } from "../models/product";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";

export function useProducts(initialProducts: ProductWithUI[]) {
  const [products, setProducts] = useLocalStorage<ProductWithUI[]>("products", initialProducts);
  const addProduct = useCallback((newProduct: Omit<ProductWithUI, "id">) => {
    const product: ProductWithUI = {
      ...newProduct,
      id: `p${Date.now()}`,
    };
    setProducts((prev) => [...prev, product]);
  }, []);

  const updateProduct = useCallback((productId: string, updates: Partial<ProductWithUI>) => {
    setProducts((prev) => prev.map((product) => (product.id === productId ? { ...product, ...updates } : product)));
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const updateProductStock = useCallback((id: string, stock: number) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, stock } : product)));
  }, []);

  return { products, addProduct, updateProduct, deleteProduct, updateProductStock };
}
