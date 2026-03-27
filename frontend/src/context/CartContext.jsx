import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, addToCartApi, removeFromCartApi, getSessionId } from '../api/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [sessionId] = useState(() => getSessionId())
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCart(sessionId)
      const items = res.data.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        stock: item.stock,
      }))
      setCartItems(items)
    } catch {
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (product, quantity = 1) => {
    // Optimistic update
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
    try {
      await addToCartApi(sessionId, product.id, quantity)
    } catch {
      // revert on error
      fetchCart()
    }
  }

  const removeFromCart = async (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
    try {
      await removeFromCartApi(sessionId, productId)
    } catch {
      fetchCart()
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    const item = cartItems.find(i => i.id === productId)
    if (!item) return

    setCartItems(prev =>
      prev.map(i => i.id === productId ? { ...i, quantity } : i)
    )
    try {
      // Backend doesn't have a direct update-qty endpoint, so we remove and re-add
      await removeFromCartApi(sessionId, productId)
      await addToCartApi(sessionId, productId, quantity)
    } catch {
      fetchCart()
    }
  }

  const clearCart = async () => {
    const prev = cartItems
    setCartItems([])
    // Remove each item from backend
    try {
      await Promise.all(prev.map(item => removeFromCartApi(sessionId, item.id)))
    } catch {
      // best-effort
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems, sessionId, loading,
      addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice, refreshCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
