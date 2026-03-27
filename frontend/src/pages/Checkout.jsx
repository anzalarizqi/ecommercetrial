import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatRupiah } from './ProductList'
import { createOrder } from '../api/api'

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
}

function SuccessModal({ orderId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm text-center p-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Berhasil!</h2>
        <p className="text-gray-500 mb-1">Terima kasih atas pesanan Anda.</p>
        <p className="text-indigo-600 font-semibold text-lg mb-6">ID Order: #{orderId}</p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )
}

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, totalPrice, clearCart, sessionId } = useCart()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [successOrder, setSuccessOrder] = useState(null)

  useEffect(() => {
    if (cartItems.length === 0 && !successOrder) {
      navigate('/')
    }
  }, [cartItems, navigate, successOrder])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi'
    if (!form.email.trim()) newErrors.email = 'Email wajib diisi'
    if (!form.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi'
    if (!form.address.trim()) newErrors.address = 'Alamat wajib diisi'
    if (!form.city.trim()) newErrors.city = 'Kota wajib diisi'
    return newErrors
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await createOrder({
        customerName: form.fullName,
        customerEmail: form.email,
        address: `${form.address}, ${form.city}`,
        items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
      })
      setSuccessOrder(res.data.data?.id || res.data.data?.orderId)
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Gagal membuat order. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    clearCart()
    navigate('/')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Pengiriman */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Informasi Pengiriman</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nama Lengkap *</label>
                <input
                  name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.fullName ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email *</label>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">No. Telepon *</label>
                <input
                  name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="08123456789"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Alamat Lengkap *</label>
                <textarea
                  name="address" value={form.address} onChange={handleChange}
                  placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.address ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Kota *</label>
                <input
                  name="city" value={form.city} onChange={handleChange}
                  placeholder="Jakarta"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              {submitError && (
                <p className="text-red-500 text-sm">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-semibold transition-colors mt-2"
              >
                {submitting ? 'Memproses...' : 'Konfirmasi Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Order</h2>
            <div className="divide-y divide-gray-100 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="py-3 flex justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-400">{item.quantity} × {formatRupiah(item.price)}</p>
                  </div>
                  <p className="font-semibold text-gray-700 whitespace-nowrap">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-700">Total</span>
              <span className="text-xl font-bold text-indigo-600">{formatRupiah(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {successOrder && (
        <SuccessModal orderId={successOrder} onClose={handleSuccessClose} />
      )}
    </div>
  )
}

export default Checkout
