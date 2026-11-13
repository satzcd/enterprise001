import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductDetail } from "../api/aggregate";
import { addToCart } from "../api/cartApi";
import AsyncView from "../components/AsyncView";
import ProductImage from "../components/ProductImage";
import ReviewForm from "../components/ReviewForm";
import StarRating from "../components/StarRating";
import { useAsync } from "../hooks/useAsync";
import { describeError, formatRupiah } from "../utils/format";
export default function ProductDetailPage({ userId }) {
  const { id } = useParams();
  const loadProduct = useCallback(() => getProductDetail(id), [id]);
  const { loading, data, error, reload } = useAsync(
    loadProduct,
    [id],
  );

  const [quantity, setQuantity] = useState("1");
  const [cartMessage, setCartMessage] = useState(null);
  async function handleAddToCart() {
    const amount = Math.max(1, Number(quantity) || 1);
    try {
      await addToCart(userId, Number(id), amount);
      setCartMessage({ type: "success", text: "Produk masuk ke keranjang." });
    } catch (err) {
      setCartMessage({ type: "error", text: describeError(err) });
    }
  }
  return (
    <section>
      <div className="breadcrumbs">
        <Link to="/">Beranda</Link>
        <span aria-hidden="true">/</span>
        <span>Detail produk</span>
      </div>
      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="product-detail">
              <div className="product-visual detail-visual">
                <span className="product-number">
                  NO. {String(data.product.id).padStart(2, "0")}
                </span>
                <ProductImage
                  image={data.product.image}
                  alt={data.product.name}
                />
                <span className="product-label">GADGETKU / TECH</span>
              </div>
              <div className="detail-copy">
                <p className="eyebrow">Teknologi pilihan / Gadgetku</p>
                <h1>{data.product.name}</h1>
                {data.reviews && (
                  <StarRating
                    average={data.reviews.summary.average_rating}
                    total={data.reviews.summary.total_reviews}
                  />
                )}
                <p className="price">{formatRupiah(data.product.price)}</p>
                {data.product.description && (
                  <p className="detail-description">
                    {data.product.description}
                  </p>
                )}
                <p className="detail-stock">
                  {data.product.stock > 0
                    ? `${data.product.stock} tersedia`
                    : "Stok habis"}
                </p>
                <div className="actions">
                  <input
                    type="number"
                    min="1"
                    max={data.product.stock}
                    value={quantity}
                    aria-label="Jumlah"
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={data.product.stock < 1}
                  >
                    {data.product.stock > 0
                      ? "Tambahkan ke keranjang"
                      : "Stok habis"}
                  </button>
                </div>
                {cartMessage && (
                  <p className={`alert alert-${cartMessage.type}`}>
                    {cartMessage.text}
                  </p>
                )}
              </div>
            </div>
            <section className="reviews-section">
              <h2>Ulasan pelanggan</h2>
              {data.reviews ? (
                <ul className="reviews">
                  {data.reviews.reviews.map((review) => (
                    <li key={review.id}>
                      <StarRating average={review.rating} total={1} compact />
                      <p>
                        {review.comment || (
                          <em className="muted">Tanpa komentar</em>
                        )}
                      </p>
                      <small className="muted">
                        User {review.user_id},{" "}
                        {new Date(review.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </small>
                    </li>
                  ))}
                  {data.reviews.reviews.length === 0 && (
                    <li className="muted">Belum ada ulasan.</li>
                  )}
                </ul>
              ) : (
                <p className="alert alert-error">
                  Ulasan tidak dapat dimuat saat ini.
                </p>
              )}
              <ReviewForm
                productId={Number(id)}
                userId={userId}
                onCreated={reload}
              />
            </section>
          </>
        )}
      </AsyncView>
    </section>
  );
}
