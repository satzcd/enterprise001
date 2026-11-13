import { getCart } from "./cartApi";
import { getProduct, getProducts } from "./productApi";
import { getProductReviews } from "./reviewApi";

// Daftar produk beserta ringkasan rating.
export async function getProductsWithRating() {
  const products = await getProducts();

  return Promise.all(
    products.map(async (product) => {
      try {
        const { summary } = await getProductReviews(product.id);

        return {
          ...product,
          rating: summary,
        };
      } catch {
        return {
          ...product,
          rating: null,
        };
      }
    }),
  );
}

// Detail produk beserta ulasannya.
export async function getProductDetail(productId) {
  const [productResult, reviewResult] = await Promise.allSettled([
    getProduct(productId),
    getProductReviews(productId),
  ]);

  if (productResult.status === "rejected") {
    throw productResult.reason;
  }

  return {
    product: productResult.value,
    reviews: reviewResult.status === "fulfilled" ? reviewResult.value : null,
  };
}

// Detail keranjang beserta informasi produk.
export async function getCartDetail(userId) {
  const cartItems = await getCart(userId);

  const items = await Promise.all(
    cartItems.map(async (item) => {
      try {
        const product = await getProduct(item.product_id);

        return {
          ...item,
          product,
        };
      } catch {
        return {
          ...item,
          product: null,
        };
      }
    }),
  );

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + (item.product ? Number(item.product.price) * item.quantity : 0),
    0,
  );

  return {
    items,
    totalPrice,
  };
}
