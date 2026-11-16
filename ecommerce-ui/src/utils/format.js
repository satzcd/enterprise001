const rupiah = new Intl.NumberFormat('id-ID', {
style: 'currency',
currency: 'IDR',
maximumFractionDigits: 0,
})

export const formatRupiah = (value) => rupiah.format(Number(value))

export function formatOrderDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// Mengubah ApiError menjadi teks yang bisa ditampilkan ke pengguna.
export function describeError(error) {
const details = error.errors ? Object.values(error.errors).flat()
: []
return details.length ? `${error.message}: ${details.join(', ')}`
: error.message
}