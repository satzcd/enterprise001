export function getProductImageSrc(image) {
  if (typeof image !== "string" || !image.trim()) return null;

  const value = image.trim();
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(value)) return value;

  const base64 = value.replace(/\s/g, "");
  const mimeType = base64.startsWith("iVBORw0KGgo")
    ? "image/png"
    : base64.startsWith("/9j/")
      ? "image/jpeg"
      : base64.startsWith("R0lGOD")
        ? "image/gif"
        : base64.startsWith("UklGR")
          ? "image/webp"
          : base64.startsWith("Qk")
            ? "image/bmp"
            : "image/png";

  return `data:${mimeType};base64,${base64}`;
}
