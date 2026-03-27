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
        setProduct(res.data)
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
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-3">Memuat produk...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link to="/" className="text-indigo-600 hover:underline">← Kembali ke Produk</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">← Kembali ke Produk</Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col sm:flex-row">
        <div className="bg-gray-100 flex items-center justify-center text-8xl sm:w-72 aspect-square sm:aspect-auto">
          🛍️
        </div>
        <div className="p-6 flex flex-col flex-1">
          <span className="text-xs text-indigo-500 font-medium mb-2">{product.category}</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-4">{product.description}</p>
          <p className="text-3xl font-bold text-indigo-600 mb-2">{formatRupiah(product.price)}</p>
          <p className={`text-sm mb-6 ${product.stock === 0 ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
            {product.stock === 0 ? 'Stok habis' : `Stok tersedia: ${product.stock}`}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
              added
                ? 'bg-green-500 text-white'
                : product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {added ? '✓ Ditambahkan!' : product.stock === 0 ? 'Stok Habis' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
