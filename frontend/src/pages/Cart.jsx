import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatRupiah } from './ProductList'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, loading } = useCart()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4">
        <div className="w-7 h-7 border-2 border-[#C17D3A] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#7A7063] text-sm">Memuat keranjang...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#FDF0E0] flex items-center justify-center">
          <span className="text-3xl" style={{ opacity: 0.6 }}>🛍️</span>
        </div>
        <div className="text-center">
          <p className="font-display text-3xl text-[#1C1A16] font-light">Keranjang Kosong</p>
          <p className="text-[#7A7063] text-sm mt-2">Belum ada produk yang dipilih.</p>
        </div>
        <Link
          to="/"
          className="bg-[#C17D3A] hover:bg-[#9E6228] text-white px-8 py-3 rounded-xl text-sm font-medium transition-all hover:shadow-md"
        >
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFAF5]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <h1 className="font-display text-4xl font-semibold text-[#1C1A16] mb-8 animate-fade-up" style={{ opacity: 0 }}>
          Keranjang Belanja
        </h1>

        {/* Cart Items */}
        <div className="flex flex-col gap-3 mb-6 animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s' }}>
          {cartItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E8E0D4] p-4 flex items-center gap-4 hover:border-[#C17D3A]/30 transition-colors"
            >
              {/* Mini image */}
              <div className="product-image-bg w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl relative z-10" style={{ opacity: 0.55 }}>🛍️</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1C1A16] text-sm truncate">{item.name}</p>
                <p className="text-[#7A7063] text-xs mt-0.5">{formatRupiah(item.price)} / pcs</p>
              </div>

              {/* Qty Stepper */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-[#E8E0D4] hover:border-[#C17D3A] hover:text-[#C17D3A] flex items-center justify-center text-[#7A7063] transition-all font-medium text-base leading-none"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-sm text-[#1C1A16] tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.stock !== undefined && item.quantity >= item.stock}
                  className="w-8 h-8 rounded-full border border-[#E8E0D4] hover:border-[#C17D3A] hover:text-[#C17D3A] flex items-center justify-center text-[#7A7063] transition-all font-medium text-base leading-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#E8E0D4] disabled:hover:text-[#7A7063]"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <p className="font-display text-base font-semibold text-[#1C1A16] w-28 text-right tabular-nums">
                {formatRupiah(item.price * item.quantity)}
              </p>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.id)}
                title="Hapus"
                className="text-[#E8E0D4] hover:text-red-400 transition-colors ml-1 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-[#E8E0D4] p-6 animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-6">
            <span className="text-[#7A7063] text-sm">Total Belanja</span>
            <span className="font-display text-3xl font-semibold text-[#C17D3A] tabular-nums">
              {formatRupiah(totalPrice)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 border border-[#E8E0D4] hover:border-[#C17D3A] text-[#7A7063] hover:text-[#C17D3A] py-3 rounded-xl text-sm font-medium transition-all"
            >
              ← Lanjut Belanja
            </button>
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 bg-[#C17D3A] hover:bg-[#9E6228] text-white py-3 rounded-xl text-sm font-medium transition-all hover:shadow-md"
            >
              Checkout →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Cart
