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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm text-center p-10 animate-scale-in">
        <div className="w-16 h-16 bg-[#FDF0E0] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#C17D3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="font-display text-3xl font-semibold text-[#1C1A16] mb-2">Order Berhasil!</h2>
        <p className="text-[#7A7063] text-sm mb-2">Terima kasih atas pesanan Anda.</p>
        <p className="text-[#C17D3A] font-semibold mb-8 text-sm font-mono">#{orderId}</p>
        <button
          onClick={onClose}
          className="w-full bg-[#C17D3A] hover:bg-[#9E6228] text-white py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all hover:shadow-md"
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

  const inputClass = (field) =>
    `w-full bg-[#FDFAF5] border rounded-xl px-4 py-3 text-sm text-[#1C1A16] placeholder-[#7A7063] focus:outline-none focus:border-[#C17D3A] focus:bg-white transition-all ${
      errors[field] ? 'border-red-300' : 'border-[#E8E0D4]'
    }`

  return (
    <div className="min-h-screen bg-[#FDFAF5]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <h1 className="font-display text-4xl font-semibold text-[#1C1A16] mb-8 animate-fade-up" style={{ opacity: 0 }}>
          Checkout
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Form Pengiriman */}
          <div className="flex-1 animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s' }}>
            <div className="bg-white rounded-2xl border border-[#E8E0D4] p-6">
              <h2 className="text-xs font-semibold text-[#7A7063] uppercase tracking-[0.18em] mb-5">
                Informasi Pengiriman
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                {/* Nama Lengkap */}
                <div>
                  <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Nama Lengkap *</label>
                  <input
                    name="fullName" value={form.fullName} onChange={handleChange}
                    placeholder="John Doe"
                    className={inputClass('fullName')}
                  />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Email *</label>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="john@example.com"
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* No. Telepon */}
                <div>
                  <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">No. Telepon *</label>
                  <input
                    name="phone" type="tel" value={form.phone} onChange={handleChange}
                    placeholder="08123456789"
                    className={inputClass('phone')}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Alamat */}
                <div>
                  <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Alamat Lengkap *</label>
                  <textarea
                    name="address" value={form.address} onChange={handleChange}
                    placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                    rows={3}
                    className={inputClass('address')}
                  />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Kota */}
                <div>
                  <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Kota *</label>
                  <input
                    name="city" value={form.city} onChange={handleChange}
                    placeholder="Jakarta"
                    className={inputClass('city')}
                  />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                </div>

                {submitError && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C17D3A] hover:bg-[#9E6228] disabled:bg-[#E8E0D4] disabled:text-[#7A7063] text-white py-4 rounded-xl font-medium text-sm tracking-widest uppercase transition-all hover:shadow-md mt-2"
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s' }}>
            <div className="bg-white rounded-2xl border border-[#E8E0D4] p-6 sticky top-20">
              <h2 className="text-xs font-semibold text-[#7A7063] uppercase tracking-[0.18em] mb-4">
                Ringkasan Order
              </h2>
              <div className="flex flex-col gap-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1C1A16] font-medium text-sm truncate">{item.name}</p>
                      <p className="text-[#7A7063] text-xs mt-0.5">{item.quantity} × {formatRupiah(item.price)}</p>
                    </div>
                    <p className="font-semibold text-[#1C1A16] whitespace-nowrap text-sm tabular-nums">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E8E0D4] pt-4 flex justify-between items-center">
                <span className="text-sm text-[#7A7063]">Total</span>
                <span className="font-display text-2xl font-semibold text-[#C17D3A] tabular-nums">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
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
