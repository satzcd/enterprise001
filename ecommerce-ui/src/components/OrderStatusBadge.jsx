export default function OrderStatusBadge({ status }) {
  const label = status === "PAID" ? "Lunas" : "Menunggu pembayaran";

  return (
    <span className={`order-status order-status-${status.toLowerCase()}`}>
      <span className="order-status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
