import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatRupiah } from './ProductList'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, loading } = useCart()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-3">Memuat keranjang...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">Keranjang belanja kosong.</p>
        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Keranjang Belanja</h1>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="text-left px-4 py-3">Produk</th>
              <th className="text-center px-4 py-3">Qty</th>
              <th className="text-right px-4 py-3">Subtotal</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cartItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-400">{formatRupiah(item.price)} / pcs</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-semibold text-gray-800">
                  {formatRupiah(item.price * item.quantity)}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-600 font-medium">Total</span>
          <span className="text-2xl font-bold text-indigo-600">{formatRupiah(totalPrice)}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Lanjut Belanja
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Checkout →
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
