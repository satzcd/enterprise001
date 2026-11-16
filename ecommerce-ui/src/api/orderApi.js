import { request } from "./http";

const BASE_URL = import.meta.env.VITE_ORDER_URL || "http://localhost:3003";

export const createOrder = (userId) =>
  request(BASE_URL, "/orders", {
    method: "POST",
    body: { user_id: userId },
  }).then((response) => response.data);

export const getOrder = (orderId) =>
  request(BASE_URL, `/orders/${orderId}`).then((response) => response.data);

export const getUserOrders = (userId, status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(BASE_URL, `/orders/user/${userId}${query}`).then(
    (response) => response.data,
  );
};

export const payOrder = (orderId) =>
  request(BASE_URL, `/orders/${orderId}/pay`, {
    method: "PATCH",
  }).then((response) => response.data);
