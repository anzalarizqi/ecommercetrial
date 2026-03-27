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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nama Produk *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Harga (Rp) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Stok *</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Kategori *</label>
            <input name="category" value={form.category} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium">
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Username</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg font-semibold transition-colors">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <button onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 border border-gray-300 px-3 py-1.5 rounded-lg transition-colors">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setTab('products')}
          className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Daftar Produk
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Daftar Order
        </button>
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">{products.length} produk</p>
            <button
              onClick={() => setModal('add')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Tambah Produk
            </button>
          </div>
          {loadingProducts ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3">Nama</th>
                    <th className="text-left px-4 py-3">Kategori</th>
                    <th className="text-right px-4 py-3">Harga</th>
                    <th className="text-right px-4 py-3">Stok</th>
                    <th className="text-center px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                      <td className="px-4 py-3 text-gray-500">{product.category}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatRupiah(product.price)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{product.stock}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setModal(product)}
                          className="text-indigo-600 hover:text-indigo-800 mr-3 font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-700 font-medium">
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
        <div>
          {loadingOrders ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-4">{orders.length} order</p>
              <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3">ID Order</th>
                      <th className="text-left px-4 py-3">Nama Pembeli</th>
                      <th className="text-right px-4 py-3">Total</th>
                      <th className="text-left px-4 py-3">Tanggal</th>
                      <th className="text-left px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-700 text-xs">{order.id}</td>
                        <td className="px-4 py-3 text-gray-800">{order.shippingAddress?.name || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">{formatRupiah(order.total || order.totalPrice || 0)}</td>
                        <td className="px-4 py-3 text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700'
                            : order.status === 'shipped' ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
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
  )
}

export default Admin
