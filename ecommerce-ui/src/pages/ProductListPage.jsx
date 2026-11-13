import { useMemo, useState } from "react";
import { getProductsWithRating } from "../api/aggregate";
import AsyncView from "../components/AsyncView";
import ProductCard from "../components/ProductCard";
import { useAsync } from "../hooks/useAsync";
export default function ProductListPage() {
  const { loading, data, error, reload } = useAsync(getProductsWithRating);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const products = useMemo(() => {
    const filtered = (data || []).filter((product) =>
      product.name.toLowerCase().includes(query.trim().toLowerCase()),
    );

    if (sort === "price-low") {
      return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sort === "price-high") {
      return [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    }
    return filtered;
  }, [data, query, sort]);

  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Follow The Future.</p>
          <h1 id="hero-title">
            Teknologi hebat, <span>untuk hidup lebih mudah.</span>
          </h1>
          <p className="hero-description">
            Temukan smartphone, laptop, smartwatch, dan aksesori pilihan untuk
            menemani setiap aktivitasmu.
          </p>
          <a className="hero-link" href="#koleksi">
            Jelajahi koleksi <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-object" />
          <div className="hero-stamp">
            <span>SMART</span>
            <span>TECH</span>
          </div>
        </div>
      </section>

      <section className="benefits" aria-label="Keunggulan belanja">
        <div className="benefit">
          <span className="benefit-mark" aria-hidden="true">
            ✳
          </span>
          <span>Gadget pilihan</span>
        </div>
        <div className="benefit">
          <span className="benefit-mark" aria-hidden="true">
            ◇
          </span>
          <span>Info produk transparan</span>
        </div>
        <div className="benefit">
          <span className="benefit-mark" aria-hidden="true">
            ↗
          </span>
          <span>Belanja praktis &amp; aman</span>
        </div>
      </section>

      <section className="catalog" id="koleksi" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div className="page-heading">
            <p className="eyebrow">Teknologi pilihan</p>
            <h1 id="catalog-title">Jelajahi gadget</h1>
          </div>
          {data && (
            <p className="results-count">
              {products.length} dari {data.length} produk
            </p>
          )}
        </div>

        <AsyncView loading={loading} error={error} onRetry={reload}>
          {data && (
            <>
              <div className="toolbar">
                <label className="search-wrap">
                  <svg
                    className="search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                  <input
                    className="search-input"
                    type="search"
                    placeholder="Cari produk..."
                    aria-label="Cari produk"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <select
                  aria-label="Urutkan produk"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="featured">Urutan: pilihan kami</option>
                  <option value="price-low">Harga: terendah</option>
                  <option value="price-high">Harga: tertinggi</option>
                </select>
              </div>
              <div className="grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {products.length === 0 && (
                  <p className="empty-results">
                    Produk tidak ditemukan. Coba kata kunci lain.
                  </p>
                )}
              </div>
            </>
          )}
        </AsyncView>
      </section>
    </div>
  );
}
