import { Link } from "react-router-dom";
import { formatRupiah } from "../utils/format";
import ProductImage from "./ProductImage";
import StarRating from "./StarRating";
export default function ProductCard({ product }) {
  const { id, name, price, stock, rating, image } = product;
  return (
    <article className="card">
      <Link
        className="product-visual"
        to={`/products/${id}`}
        aria-label={`Lihat ${name}`}
      >
        <span className="product-number">
          NO. {String(id).padStart(2, "0")}
        </span>
        <ProductImage image={image} alt={name} />
        <span className="product-label">GADGETKU / TECH</span>
      </Link>
      <div className="card-info">
        <h3>
          <Link to={`/products/${id}`}>{name}</Link>
        </h3>
        <div className="card-meta">
          <p className="price">{formatRupiah(price)}</p>
          <p className="card-stock">
            {stock > 0 ? `${stock} tersedia` : "Stok habis"}
          </p>
        </div>
        {rating ? (
          <StarRating
            average={rating.average_rating}
            total={rating.total_reviews}
          />
        ) : (
          <span className="muted">Belum ada ulasan</span>
        )}
      </div>
    </article>
  );
}
