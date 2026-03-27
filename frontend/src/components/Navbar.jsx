import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { totalItems } = useCart()

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">ShopApp</Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-600 hover:text-indigo-600">Products</Link>
        <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin</Link>
        <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
