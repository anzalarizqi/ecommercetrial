import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/api'

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function ProductList() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['Semua'])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products when search/category changes (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search, category])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (search) params.search = search
      if (category !== 'Semua') params.category = category
      const res = await getProducts(params)
      const data = res.data
      setProducts(data)
      // rebuild category list from full fetch when no filters
      if (!search && category === 'Semua') {
        const cats = ['Semua', ...new Set(data.map(p => p.category).filter(Boolean))]
        setCategories(cats)
      }
    } catch (err) {
      setError('Gagal memuat produk. Pastikan backend berjalan di port 3001.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Produk</h1>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3">Memuat produk...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-gray-500 text-center py-16">Produk tidak ditemukan.</p>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow flex flex-col">
              <div className="bg-gray-100 rounded-t-xl aspect-square flex items-center justify-center text-gray-400 text-4xl">
                🛍️
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-indigo-500 font-medium mb-1">{product.category}</span>
                <h2 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h2>
                <p className="text-indigo-600 font-bold mt-auto">{formatRupiah(product.price)}</p>
                <p className={`text-xs mb-3 ${product.stock === 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {product.stock === 0 ? 'Stok habis' : `Stok: ${product.stock}`}
                </p>
                <Link
                  to={`/products/${product.id}`}
                  className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList
