import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// --- Products ---
export const getProducts = (params) => api.get('/products', { params })
export const getProductById = (id) => api.get(`/products/${id}`)

// --- Cart ---
export const addToCartApi = (sessionId, productId, quantity) =>
  api.post('/cart', { sessionId, productId, quantity })
export const getCart = (sessionId) => api.get(`/cart/${sessionId}`)
export const removeFromCartApi = (sessionId, productId) =>
  api.delete(`/cart/${sessionId}/${productId}`)

// --- Orders ---
export const createOrder = (data) => api.post('/orders', data)

// --- Admin ---
export const adminLogin = (username, password) =>
  api.post('/admin/login', { username, password })

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

export const adminGetProducts = (token) =>
  api.get('/admin/products', authHeader(token))
export const adminCreateProduct = (token, data) =>
  api.post('/admin/products', data, authHeader(token))
export const adminUpdateProduct = (token, id, data) =>
  api.put(`/admin/products/${id}`, data, authHeader(token))
export const adminDeleteProduct = (token, id) =>
  api.delete(`/admin/products/${id}`, authHeader(token))
export const adminGetOrders = (token) =>
  api.get('/admin/orders', authHeader(token))

// --- SessionId helper ---
export const getSessionId = () => {
  let sessionId = localStorage.getItem('cartSessionId')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('cartSessionId', sessionId)
  }
  return sessionId
}

export default api
