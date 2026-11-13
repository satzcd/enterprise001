import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { getCartDetail } from "../api/aggregate";
import { clearCart, removeCartItem, updateCartItem } from "../api/cartApi";
import AsyncView from "../components/AsyncView";
import { useAsync } from "../hooks/useAsync";
import { describeError, formatRupiah } from "../utils/format";
export default function CartPage({ userId }) {
  const loadCart = useCallback(() => getCartDetail(userId), [userId]);
  const { loading, data, error, reload } = useAsync(
    loadCart,
    [userId],
  );
  const [actionError, setActionError] = useState(null);

  async function run(action) {
    setActionError(null);
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err);
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
                          disabled={item.quantity <= 1}
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
              <button
                type="button"
                onClick={() => run(() => clearCart(userId))}
              >
                Kosongkan keranjang
              </button>
            </div>
          </>
        )}
      </AsyncView>
    </section>
  );
}
