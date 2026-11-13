import { request } from "./http";

const BASE_URL = import.meta.env.VITE_REVIEW_URL;

export const getProductReviews = (productId) =>
  request(BASE_URL, `/reviews/product/${productId}`).then((reviews) => ({
    ...reviews,
    summary: {
      average_rating: reviews.average_rating,
      total_reviews: reviews.total_reviews,
    },
  }));

export const createReview = ({ productId, userId, rating, comment }) =>
  request(BASE_URL, "/reviews", {
    method: "POST",
    body: { product_id: productId, user_id: userId, rating, comment },
  });
