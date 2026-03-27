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
      const data = res.data.data
      setProducts(data)
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
    <div className="min-h-screen bg-[#FDFAF5]">

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <p
          className="text-[#C17D3A] text-xs tracking-[0.25em] uppercase font-semibold mb-4 animate-fade-up"
          style={{ opacity: 0 }}
        >
          Koleksi Premium
        </p>
        <h1
          className="font-display text-5xl sm:text-6xl font-semibold text-[#1C1A16] leading-[1.1] animate-fade-up"
          style={{ opacity: 0, animationDelay: '0.1s' }}
        >
          Temukan Produk<br />
          <em className="font-light italic text-[#7A7063]">Pilihan Terbaik</em>
        </h1>
      </div>

      {/* Filter Bar */}
      <div
        className="max-w-6xl mx-auto px-6 mb-10 animate-fade-up"
        style={{ opacity: 0, animationDelay: '0.2s' }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7063]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E0D4] rounded-xl text-sm text-[#1C1A16] placeholder-[#7A7063] focus:outline-none focus:border-[#C17D3A] transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                  category === c
                    ? 'bg-[#C17D3A] text-white shadow-sm'
                    : 'bg-white border border-[#E8E0D4] text-[#7A7063] hover:border-[#C17D3A] hover:text-[#C17D3A]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* States */}
      <div className="max-w-6xl mx-auto px-6">
        {loading && (
          <div className="flex flex-col items-center py-28 gap-4">
            <div className="w-7 h-7 border-2 border-[#C17D3A] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#7A7063] text-sm">Memuat produk...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-100 text-red-500 rounded-xl px-5 py-4 text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-28">
            <p className="font-display text-4xl text-[#7A7063] font-light italic">Produk tidak ditemukan.</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 pb-20 stagger-children">
            {products.map(product => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8E0D4] hover:border-[#C17D3A]/50 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image placeholder */}
                <div className="product-image-bg aspect-square flex items-center justify-center">
                  <span className="text-5xl transition-transform duration-500 group-hover:scale-110 relative z-10" style={{ opacity: 0.55 }}>
                    🛍️
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#C17D3A] font-semibold">
                    {product.category}
                  </span>
                  <h2 className="text-sm font-medium text-[#1C1A16] line-clamp-2 leading-snug mt-0.5">
                    {product.name}
                  </h2>
                  <p className={`text-xs mt-0.5 ${product.stock === 0 ? 'text-red-400' : 'text-[#7A7063]'}`}>
                    {product.stock === 0 ? 'Stok habis' : `${product.stock} tersedia`}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <p className="font-display text-lg font-semibold text-[#C17D3A]">
                      {formatRupiah(product.price)}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-xs font-medium text-[#7A7063] hover:text-[#C17D3A] transition-colors"
                    >
                      Detail →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
