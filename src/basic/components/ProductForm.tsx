import { useState, useEffect } from "react";
import { isValidPrice, isValidStock } from "../utils/validators";
import { Discount } from "../models/discount";
import { ProductWithUI } from "../models/product";
import { TimesIcon } from "./icons";

export interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  description: string;
  discounts: Discount[];
}

interface ProductFormProps {
  editingProduct: ProductWithUI | null;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  addNotification: (message: string, type: "error" | "success" | "warning") => void;
}

const initialForm: ProductFormData = {
  name: "",
  price: 0,
  stock: 0,
  description: "",
  discounts: [],
};

const ProductForm = ({ editingProduct, onSubmit, onCancel, addNotification }: ProductFormProps) => {
  const [form, setForm] = useState<ProductFormData>(initialForm);
  const isEditing = editingProduct !== null;

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: editingProduct.price,
        stock: editingProduct.stock,
        description: editingProduct.description || "",
        discounts: editingProduct.discounts || [],
      });
    } else {
      setForm(initialForm);
    }
  }, [editingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setForm({ ...form, price: value === "" ? 0 : parseInt(value) });
    }
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const price = parseInt(value) || 0;

    if (!isValidPrice(price)) {
      addNotification("가격은 0보다 커야 합니다", "error");
      setForm({ ...form, price: 0 });
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setForm({ ...form, stock: value === "" ? 0 : parseInt(value) });
    }
  };

  const handleStockBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const stock = parseInt(value) || 0;

    if (!isValidStock(stock)) {
      addNotification("재고는 0보다 커야 합니다", "error");
      setForm({ ...form, stock: 0 });
    } else if (stock > 9999) {
      addNotification("재고는 9999개를 초과할 수 없습니다", "error");
      setForm({ ...form, stock: 9999 });
    }
  };

  const handleDiscountQuantityChange = (index: number, value: string) => {
    const newDiscounts = [...form.discounts];
    newDiscounts[index].quantity = parseInt(value) || 0;
    setForm({ ...form, discounts: newDiscounts });
  };

  const handleDiscountRateChange = (index: number, value: string) => {
    const newDiscounts = [...form.discounts];
    newDiscounts[index].rate = (parseInt(value) || 0) / 100;
    setForm({ ...form, discounts: newDiscounts });
  };

  const handleRemoveDiscount = (index: number) => {
    const newDiscounts = form.discounts.filter((_, i) => i !== index);
    setForm({ ...form, discounts: newDiscounts });
  };

  const handleAddDiscount = () => {
    setForm({
      ...form,
      discounts: [...form.discounts, { quantity: 10, rate: 0.1 }],
    });
  };

  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{isEditing ? "상품 수정" : "새 상품 추가"}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
            <input
              type="text"
              value={form.price === 0 ? "" : form.price}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
              placeholder="숫자만 입력"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
            <input
              type="text"
              value={form.stock === 0 ? "" : form.stock}
              onChange={handleStockChange}
              onBlur={handleStockBlur}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
              placeholder="숫자만 입력"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">할인 정책</label>
          <div className="space-y-2">
            {form.discounts.map((discount, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <input
                  type="number"
                  value={discount.quantity}
                  onChange={(e) => handleDiscountQuantityChange(index, e.target.value)}
                  className="w-20 px-2 py-1 border rounded"
                  min="1"
                  placeholder="수량"
                />
                <span className="text-sm">개 이상 구매 시</span>
                <input
                  type="number"
                  value={discount.rate * 100}
                  onChange={(e) => handleDiscountRateChange(index, e.target.value)}
                  className="w-16 px-2 py-1 border rounded"
                  min="0"
                  max="100"
                  placeholder="%"
                />
                <span className="text-sm">% 할인</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDiscount(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TimesIcon size={5} />
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddDiscount} className="text-sm text-indigo-600 hover:text-indigo-800">
              + 할인 추가
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {isEditing ? "수정" : "추가"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
