import { useCallback, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getOrder, payOrder } from "../api/orderApi";
import AsyncView from "../components/AsyncView";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useAsync } from "../hooks/useAsync";
import { describeError, formatOrderDate, formatRupiah } from "../utils/format";

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const loadOrder = useCallback(() => getOrder(id), [id]);
  const { loading, data, error, reload } = useAsync(loadOrder, [id]);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  async function handlePay() {
    setPaying(true);
    setPaymentError(null);
    try {
      await payOrder(id);
      reload();
    } catch (err) {
      setPaymentError(err);
    } finally {
      setPaying(false);
    }
  }

  return (
    <section className="order-detail-page">
      <div className="breadcrumbs">
        <Link to="/orders">Pesanan saya</Link>
        <span aria-hidden="true">/</span>
        <span>Detail pesanan</span>
      </div>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            {location.state?.justCreated && (
              <p className="alert alert-success">
                Pesanan berhasil dibuat. Silakan lanjutkan pembayaran.
              </p>
            )}
            <div className="order-detail-heading">
              <div>
                <p className="eyebrow">Ringkasan transaksi</p>
                <h1>Pesanan #{data.id}</h1>
                <time dateTime={data.created_at}>
                  Dibuat {formatOrderDate(data.created_at)}
                </time>
              </div>
              <OrderStatusBadge status={data.status} />
            </div>

            {paymentError && (
              <p className="alert alert-error">{describeError(paymentError)}</p>
            )}

            <div className="cart-table-wrap order-items-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Harga satuan</th>
                    <th>Jumlah</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.product_id}>
                      <td>{item.product_name}</td>
                      <td>{formatRupiah(item.unit_price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="order-total">
              <span>Total pesanan</span>
              <strong>{formatRupiah(data.total_amount)}</strong>
            </div>

            <div className="order-detail-actions">
              <Link className="secondary-button" to="/orders">
                Kembali ke pesanan
              </Link>
              {data.status === "PENDING" && (
                <button type="button" onClick={handlePay} disabled={paying}>
                  {paying ? "Memproses pembayaran..." : "Bayar sekarang"}
                </button>
              )}
            </div>
          </>
        )}
      </AsyncView>
    </section>
  );
}
