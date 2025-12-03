// const formatPrice = (price: number, productId?: string): string => {
//   if (productId) {
//     const product = products.find((p) => p.id === productId);
//     if (product && getRemainingStock(product) <= 0) {
//       return "SOLD OUT";
//     }
//   }

//   return `₩${price.toLocaleString()}`;
// };

export const formatPriceSymbol = (price: number) => {
  return `₩${price.toLocaleString()}`;
};

export const formatProceAdmin = (price: number) => {
  return `${price.toLocaleString()}원`;
};
