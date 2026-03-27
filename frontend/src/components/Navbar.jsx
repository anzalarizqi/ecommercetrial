import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { totalItems } = useCart()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-[#FDFAF5]/95 backdrop-blur-sm border-b border-[#E8E0D4]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-semibold tracking-[0.12em] text-[#1C1A16] hover:text-[#C17D3A] transition-colors">
          NUSANTARA<span className="text-[#C17D3A]">.</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm tracking-wide transition-colors relative group pb-0.5 ${
              isActive('/') ? 'text-[#C17D3A]' : 'text-[#7A7063] hover:text-[#1C1A16]'
            }`}
          >
            Produk
            <span className={`absolute bottom-0 left-0 h-px bg-[#C17D3A] transition-all duration-300 ${
              isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          </Link>

          <Link
            to="/admin"
            className={`text-sm tracking-wide transition-colors relative group pb-0.5 ${
              isActive('/admin') ? 'text-[#C17D3A]' : 'text-[#7A7063] hover:text-[#1C1A16]'
            }`}
          >
            Admin
            <span className={`absolute bottom-0 left-0 h-px bg-[#C17D3A] transition-all duration-300 ${
              isActive('/admin') ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          </Link>

          <Link
            to="/cart"
            className={`relative flex items-center gap-1.5 text-sm tracking-wide transition-colors group pb-0.5 ${
              isActive('/cart') ? 'text-[#C17D3A]' : 'text-[#7A7063] hover:text-[#1C1A16]'
            }`}
          >
            <svg className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
            Keranjang
            {totalItems > 0 && (
              <span className="absolute -top-2.5 -right-4 bg-[#C17D3A] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
            <span className={`absolute bottom-0 left-0 h-px bg-[#C17D3A] transition-all duration-300 ${
              isActive('/cart') ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
