import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { getUserOrders } from "../api/orderApi";
import AsyncView from "../components/AsyncView";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useAsync } from "../hooks/useAsync";
import { formatOrderDate, formatRupiah } from "../utils/format";

export default function OrderHistoryPage({ userId }) {
  const [status, setStatus] = useState("");
  const loadOrders = useCallback(
    () => getUserOrders(userId, status),
    [userId, status],
  );
  const { loading, data, error, reload } = useAsync(
    loadOrders,
    [userId, status],
  );

  return (
    <section className="orders-page">
      <p className="eyebrow">Aktivitas akun user {userId}</p>
      <div className="orders-heading">
        <div>
          <h1>Pesanan saya</h1>
          <p className="muted">Lihat status dan detail pesananmu.</p>
        </div>
        <label className="order-filter">
          <span>Status</span>
          <select
            value={status}
            aria-label="Filter status pesanan"
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Semua pesanan</option>
            <option value="PENDING">Menunggu pembayaran</option>
            <option value="PAID">Lunas</option>
          </select>
        </label>
      </div>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && data.length === 0 && (
          <div className="orders-empty">
            <p>Belum ada pesanan untuk ditampilkan.</p>
            <Link className="hero-link" to="/">
              Jelajahi gadget <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="order-list">
            {data.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-heading">
                  <div>
                    <span className="order-reference">Pesanan #{order.id}</span>
                    <time className="order-date" dateTime={order.created_at}>
                      {formatOrderDate(order.created_at)}
                    </time>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="order-card-content">
                  <p>
                    {order.items.length} produk
                    <span aria-hidden="true"> · </span>
                    {order.items
                      .slice(0, 2)
                      .map((item) => item.product_name)
                      .join(", ")}
                    {order.items.length > 2 && " dan lainnya"}
                  </p>
                  <strong>{formatRupiah(order.total_amount)}</strong>
                </div>
                <Link
                  className="order-detail-link"
                  to={`/orders/${order.id}`}
                >
                  Lihat detail <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </AsyncView>
    </section>
  );
}
