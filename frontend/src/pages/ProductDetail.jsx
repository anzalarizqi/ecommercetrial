import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProductById } from '../api/api'
import { useCart } from '../context/CartContext'
import { formatRupiah } from './ProductList'

function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getProductById(id)
        setProduct(res.data.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Produk tidak ditemukan.')
        } else {
          setError('Gagal memuat produk. Pastikan backend berjalan di port 3001.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4">
        <div className="w-7 h-7 border-2 border-[#C17D3A] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#7A7063] text-sm">Memuat produk...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-5">
        <p className="font-display text-3xl text-[#7A7063] font-light italic">{error}</p>
        <Link to="/" className="text-sm text-[#C17D3A] hover:underline underline-offset-4">
          ← Kembali ke Produk
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFAF5]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#7A7063] hover:text-[#C17D3A] transition-colors mb-10 group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Kembali ke Produk
        </Link>

        {/* Main content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 animate-fade-up" style={{ opacity: 0 }}>

          {/* Image */}
          <div className="product-image-bg rounded-3xl aspect-square flex items-center justify-center">
            <span className="text-9xl relative z-10" style={{ opacity: 0.45 }}>🛍️</span>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.22em] text-[#C17D3A] font-semibold">
                {product.category}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#1C1A16] mt-2 leading-tight">
                {product.name}
              </h1>
            </div>

            {product.description && (
              <p className="text-[#7A7063] text-sm leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="h-px bg-[#E8E0D4]" />

            <div>
              <p className="font-display text-4xl font-semibold text-[#C17D3A]">
                {formatRupiah(product.price)}
              </p>
              <p className={`text-sm mt-2 font-medium ${product.stock === 0 ? 'text-red-400' : 'text-[#7A7063]'}`}>
                {product.stock === 0 ? 'Stok habis' : `${product.stock} unit tersedia`}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-2xl font-medium text-sm tracking-widest uppercase transition-all duration-300 ${
                added
                  ? 'bg-[#2E7D32] text-white'
                  : product.stock === 0
                  ? 'bg-[#E8E0D4] text-[#7A7063] cursor-not-allowed'
                  : 'bg-[#C17D3A] hover:bg-[#9E6228] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {added
                ? '✓ Ditambahkan!'
                : product.stock === 0
                ? 'Stok Habis'
                : 'Tambah ke Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
