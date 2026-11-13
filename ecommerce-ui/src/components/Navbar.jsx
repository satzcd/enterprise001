import { NavLink } from "react-router-dom";
const USERS = [1, 2, 3, 4, 5];
export default function Navbar({ userId, onUserChange }) {
  return (
    <>
      <div className="announcement">
        ECOMMERCE PILIHAN, DIBUAT UNTUK MENEMANI KEBUTUHAN GADGETMU
      </div>
      <header className="navbar">
        <nav aria-label="Navigasi utama">
          <NavLink className="brand" to="/" aria-label="GADGETKU, beranda">
            GADGETKU<span>.</span>
          </NavLink>
          <NavLink to="/" end>
            Beranda
          </NavLink>
          <a href="/#koleksi">Koleksi</a>
        </nav>
        <div className="nav-actions">
          <NavLink className="nav-cart" to="/cart">
            <svg
              className="cart-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            Keranjang
          </NavLink>
          <label className="user">
            <span>Akun</span>
            <select
              value={userId}
              aria-label="Pilih akun"
              onChange={(e) => onUserChange(Number(e.target.value))}
            >
              {USERS.map((id) => (
                <option key={id} value={id}>
                  User {id}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
    </>
  );
}
