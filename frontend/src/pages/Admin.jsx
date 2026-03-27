import { useState, useEffect } from 'react'
import { formatRupiah } from './ProductList'
import {
  adminLogin,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
} from '../api/api'

const EMPTY_FORM = { name: '', price: '', stock: '', category: '', description: '' }

const adminInputClass = 'w-full bg-[#FDFAF5] border border-[#E8E0D4] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1A16] placeholder-[#7A7063] focus:outline-none focus:border-[#C17D3A] focus:bg-white transition-all'

function ProductModal({ product, token, onSaved, onClose }) {
  const [form, setForm] = useState(
    product ? { ...product, price: String(product.price), stock: String(product.stock) } : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock || !form.category) return
    setSaving(true)
    setError(null)
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) }
      if (product) {
        await adminUpdateProduct(token, product.id, data)
      } else {
        await adminCreateProduct(token, data)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan produk.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E0D4]">
          <h2 className="font-display text-xl font-semibold text-[#1C1A16]">
            {product ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#7A7063] hover:text-[#1C1A16] hover:bg-[#F5F0E8] rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Nama Produk *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Nama produk" className={adminInputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Harga (Rp) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min="0" placeholder="0" className={adminInputClass} />
            </div>
            <div>
              <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Stok *</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0" placeholder="0" className={adminInputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Kategori *</label>
            <input name="category" value={form.category} onChange={handleChange} required placeholder="Elektronik, Fashion, dll." className={adminInputClass} />
          </div>

          <div>
            <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Deskripsi produk..." className={adminInputClass} />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 border border-[#E8E0D4] rounded-xl text-sm text-[#7A7063] hover:border-[#C17D3A] hover:text-[#C17D3A] transition-all"
            >
              Batal
            </button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2.5 bg-[#C17D3A] hover:bg-[#9E6228] disabled:bg-[#E8E0D4] disabled:text-[#7A7063] text-white rounded-xl text-sm font-medium transition-all"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await adminLogin(username, password)
      onLogin(res.data.token)
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa username dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAF5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up" style={{ opacity: 0 }}>

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-display text-3xl font-semibold text-[#1C1A16] tracking-wider">
            NUSANTARA<span className="text-[#C17D3A]">.</span>
          </p>
          <p className="text-xs text-[#7A7063] mt-2 tracking-[0.15em] uppercase">Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E0D4] p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-[#1C1A16] mb-6">Masuk</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Username</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="admin"
                className={adminInputClass}
              />
            </div>
            <div>
              <label className="text-xs text-[#7A7063] mb-1.5 block tracking-wide">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className={adminInputClass}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{error}</p>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C17D3A] hover:bg-[#9E6228] disabled:bg-[#E8E0D4] disabled:text-[#7A7063] text-white py-3 rounded-xl text-sm font-medium tracking-widest uppercase transition-all hover:shadow-md mt-1"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null)
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [modal, setModal] = useState(null)

  const handleLogin = (t) => {
    localStorage.setItem('adminToken', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
  }

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await adminGetProducts(token)
      setProducts(res.data)
    } catch (err) {
      if (err.response?.status === 401) handleLogout()
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const res = await adminGetOrders(token)
      setOrders(res.data)
    } catch (err) {
      if (err.response?.status === 401) handleLogout()
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (!token) return
    if (tab === 'products') fetchProducts()
    else fetchOrders()
  }, [token, tab])

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return
    try {
      await adminDeleteProduct(token, id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      if (err.response?.status === 401) handleLogout()
    }
  }

  if (!token) return <LoginForm onLogin={handleLogin} />

  const Spinner = () => (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#C17D3A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFAF5]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-up" style={{ opacity: 0 }}>
          <div>
            <p className="text-xs text-[#C17D3A] tracking-[0.2em] uppercase font-semibold mb-1">Dashboard</p>
            <h1 className="font-display text-4xl font-semibold text-[#1C1A16]">Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-[#7A7063] hover:text-red-500 border border-[#E8E0D4] hover:border-red-200 px-4 py-2 rounded-xl transition-all"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 bg-white border border-[#E8E0D4] rounded-xl p-1 w-fit animate-fade-up"
          style={{ opacity: 0, animationDelay: '0.1s' }}
        >
          {[['products', 'Daftar Produk'], ['orders', 'Daftar Order']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-[#C17D3A] text-white shadow-sm'
                  : 'text-[#7A7063] hover:text-[#1C1A16]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.15s' }}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-[#7A7063] text-sm">{products.length} produk</p>
              <button
                onClick={() => setModal('add')}
                className="bg-[#C17D3A] hover:bg-[#9E6228] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md flex items-center gap-2"
              >
                <span className="text-base leading-none">+</span>
                Tambah Produk
              </button>
            </div>

            {loadingProducts ? <Spinner /> : (
              <div className="bg-white rounded-2xl border border-[#E8E0D4] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8E0D4]">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Nama</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Kategori</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Harga</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Stok</th>
                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F0E8]">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-[#FDFAF5] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#1C1A16]">{product.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs bg-[#FDF0E0] text-[#C17D3A] font-medium px-2.5 py-1 rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-display font-semibold text-[#1C1A16] tabular-nums">
                          {formatRupiah(product.price)}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          <span className={product.stock === 0 ? 'text-red-400 font-medium' : 'text-[#7A7063]'}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => setModal(product)}
                            className="text-[#C17D3A] hover:text-[#9E6228] font-medium mr-4 text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-600 font-medium text-sm transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.15s' }}>
            {loadingOrders ? <Spinner /> : (
              <>
                <p className="text-[#7A7063] text-sm mb-4">{orders.length} order</p>
                <div className="bg-white rounded-2xl border border-[#E8E0D4] overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E8E0D4]">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">ID Order</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Pembeli</th>
                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Total</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Tanggal</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#7A7063] uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F0E8]">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-[#FDFAF5] transition-colors">
                          <td className="px-5 py-3.5 font-mono text-[#7A7063] text-xs">{order.id?.slice(0, 8)}…</td>
                          <td className="px-5 py-3.5 text-[#1C1A16] font-medium">{order.shippingAddress?.name || order.customerName || '—'}</td>
                          <td className="px-5 py-3.5 text-right font-display font-semibold text-[#1C1A16] tabular-nums">
                            {formatRupiah(order.total || order.totalPrice || 0)}
                          </td>
                          <td className="px-5 py-3.5 text-[#7A7063]">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'completed'
                                ? 'bg-green-50 text-green-600'
                                : order.status === 'shipped'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-[#FDF0E0] text-[#C17D3A]'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal */}
        {modal !== null && (
          <ProductModal
            product={modal === 'add' ? null : modal}
            token={token}
            onSaved={() => { setModal(null); fetchProducts() }}
            onClose={() => setModal(null)}
          />
        )}

      </div>
    </div>
  )
}

export default Admin
