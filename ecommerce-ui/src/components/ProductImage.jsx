import { useState } from "react";
import { getProductImageSrc } from "../utils/productImage";

export default function ProductImage({ image, alt }) {
  const src = getProductImageSrc(image);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const showImage = src && !imageUnavailable;

  return (
    <>
      {!showImage && <span className="product-shape" aria-hidden="true" />}
      {showImage && (
        <img
          className="product-image"
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={(event) => {
            if (
              event.currentTarget.naturalWidth <= 1 ||
              event.currentTarget.naturalHeight <= 1
            ) {
              setImageUnavailable(true);
            }
          }}
          onError={() => setImageUnavailable(true)}
        />
      )}
    </>
  );
}
