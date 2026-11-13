import { request } from "./http";

const BASE_URL = import.meta.env.VITE_CART_URL;

export const getCart = (userId) => request(BASE_URL, `/carts/${userId}`);

export const addToCart = (userId, productId, quantity) =>
  request(BASE_URL, "/carts", {
    method: "POST",
    body: { user_id: userId, product_id: productId, quantity },
  });

export const updateCartItem = (itemId, quantity) =>
  request(BASE_URL, `/carts/items/${itemId}`, {
    method: "PUT",
    body: { quantity },
  });

export const removeCartItem = (itemId) =>
  request(BASE_URL, `/carts/items/${itemId}`, { method: "DELETE" });

export const clearCart = (userId) =>
  request(BASE_URL, `/carts/${userId}`, { method: "DELETE" });
