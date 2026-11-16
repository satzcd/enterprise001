import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCartDetail } from "../api/aggregate";
import { clearCart, removeCartItem, updateCartItem } from "../api/cartApi";
import { createOrder } from "../api/orderApi";
import AsyncView from "../components/AsyncView";
import { useAsync } from "../hooks/useAsync";
import { describeError, formatRupiah } from "../utils/format";
export default function CartPage({ userId }) {
  const navigate = useNavigate();
  const loadCart = useCallback(() => getCartDetail(userId), [userId]);
  const { loading, data, error, reload } = useAsync(
    loadCart,
    [userId],
  );
  const [actionError, setActionError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  async function run(action) {
    setActionError(null);
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err);
    }
  }

  async function handleCheckout() {
    setActionError(null);
    setCheckingOut(true);
    try {
      const order = await createOrder(userId);
      navigate(`/orders/${order.id}`, { state: { justCreated: true } });
    } catch (err) {
      setActionError(err);
    } finally {
      setCheckingOut(false);
    }
  }
  return (
    <section className="cart-page">
      <p className="eyebrow">Pilihanmu, terkumpul di sini</p>
      <h1>Keranjang belanja</h1>
      {actionError && (
        <p className="alert alert-error">{describeError(actionError)}</p>
      )}

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && data.items.length === 0 && (
          <div className="cart-empty">
            <p>Keranjangmu masih kosong.</p>
            <Link className="hero-link" to="/">
              Temukan sesuatu yang istimewa <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="cart-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Jumlah</th>
                    <th>Subtotal</th>
                    <th>
                      <span className="muted">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.product ? (
                          item.product.name
                        ) : (
                          <em>Produk tidak tersedia</em>
                        )}
                      </td>
                      <td>
                        {item.product ? formatRupiah(item.product.price) : "-"}
                      </td>
                      <td className="quantity-controls">
                        <button
                          type="button"
                          aria-label="Kurangi jumlah"
                          disabled={checkingOut || item.quantity <= 1}
                          onClick={() =>
                            run(() => updateCartItem(item.id, item.quantity - 1))
                          }
                        >
                          -
                        </button>
                        <span className="qty">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Tambah jumlah"
                          disabled={checkingOut}
                          onClick={() =>
                            run(() => updateCartItem(item.id, item.quantity + 1))
                          }
                        >
                          +
                        </button>
                      </td>
                      <td>
                        {item.product
                          ? formatRupiah(
                              Number(item.product.price) * item.quantity,
                            )
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="remove-button"
                          type="button"
                          disabled={checkingOut}
                          onClick={() => run(() => removeCartItem(item.id))}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cart-summary">
              <p className="total">
                Total <strong>{formatRupiah(data.totalPrice)}</strong>
              </p>
              <div className="cart-summary-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={checkingOut}
                  onClick={() => run(() => clearCart(userId))}
                >
                  Kosongkan keranjang
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? "Membuat pesanan..." : "Checkout"}
                </button>
              </div>
            </div>
          </>
        )}
      </AsyncView>
    </section>
  );
}
