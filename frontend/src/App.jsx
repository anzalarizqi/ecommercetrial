import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
