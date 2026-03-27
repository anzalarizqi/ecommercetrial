/**
 * QA-03 — Frontend Component Tests
 * Tests: formatRupiah, ProductList, ProductDetail, Cart, Checkout form validation
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Global polyfills ──────────────────────────────────────────────────────────
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-session-uuid' },
  configurable: true,
});

// ── Controllable CartContext mock ──────────────────────────────────────────────
// We mock CartContext so that useCart returns predictable synchronous values.
// CartProvider becomes a simple passthrough wrapper.
let mockCartValue = {
  cartItems: [],
  sessionId: 'test-session-uuid',
  loading: false,
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  totalItems: 0,
  totalPrice: 0,
  refreshCart: jest.fn(),
};

jest.mock('../../frontend/src/context/CartContext.jsx', () => ({
  CartProvider: ({ children }) => children,
  useCart: () => mockCartValue,
}));

// ── Mock API module ────────────────────────────────────────────────────────────
jest.mock('../../frontend/src/api/api.js', () => ({
  getProducts: jest.fn(),
  getProductById: jest.fn(),
  addToCartApi: jest.fn(),
  getCart: jest.fn(),
  removeFromCartApi: jest.fn(),
  createOrder: jest.fn(),
  getSessionId: jest.fn(() => 'test-session-uuid'),
}));

const mockApi = require('../../frontend/src/api/api.js');

// ── Test data ─────────────────────────────────────────────────────────────────
const sampleProducts = [
  { id: 'p1', name: 'Laptop Pro 15"', price: 12999000, stock: 15, category: 'elektronik', description: 'Laptop bagus' },
  { id: 'p2', name: 'Smartphone Galaxy', price: 6499000, stock: 30, category: 'elektronik', description: 'HP keren' },
  { id: 'p3', name: 'Kaos Polos', price: 89000, stock: 100, category: 'fashion', description: 'Kaos murah' },
];

const cartItems = [
  { id: 'p1', name: 'Laptop Pro 15"', price: 12999000, quantity: 2, stock: 15 },
  { id: 'p3', name: 'Kaos Polos', price: 89000, quantity: 1, stock: 100 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderInRouter(ui, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

// ── formatRupiah ──────────────────────────────────────────────────────────────
describe('formatRupiah utility', () => {
  let formatRupiah;
  beforeAll(() => {
    formatRupiah = require('../../frontend/src/pages/ProductList.jsx').formatRupiah;
  });

  test('format 12999000 → mengandung "12.999.000"', () => {
    expect(formatRupiah(12999000)).toContain('12.999.000');
  });

  test('format 89000 → mengandung "89.000"', () => {
    expect(formatRupiah(89000)).toContain('89.000');
  });

  test('mengandung prefix Rp atau IDR', () => {
    expect(formatRupiah(100000)).toMatch(/Rp|IDR/i);
  });

  test('format 0 → tidak error', () => {
    expect(() => formatRupiah(0)).not.toThrow();
  });
});

// ── ProductList ────────────────────────────────────────────────────────────────
describe('ProductList', () => {
  let ProductList;
  beforeAll(() => {
    ProductList = require('../../frontend/src/pages/ProductList.jsx').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getProducts.mockResolvedValue({ data: sampleProducts });
  });

  test('render loading saat fetch sedang berjalan', () => {
    mockApi.getProducts.mockReturnValue(new Promise(() => {}));
    renderInRouter(<ProductList />);
    expect(screen.getByText(/memuat produk/i)).toBeInTheDocument();
  });

  test('render semua produk setelah fetch berhasil', async () => {
    renderInRouter(<ProductList />);
    await waitFor(() => expect(screen.getByText('Laptop Pro 15"')).toBeInTheDocument());
    expect(screen.getByText('Smartphone Galaxy')).toBeInTheDocument();
    expect(screen.getByText('Kaos Polos')).toBeInTheDocument();
  });

  test('render pesan error saat fetch gagal', async () => {
    mockApi.getProducts.mockRejectedValue(new Error('Network Error'));
    renderInRouter(<ProductList />);
    await waitFor(() => expect(screen.getByText(/gagal memuat produk/i)).toBeInTheDocument());
  });

  test('render "Produk tidak ditemukan" saat data kosong', async () => {
    mockApi.getProducts.mockResolvedValue({ data: [] });
    renderInRouter(<ProductList />);
    await waitFor(() => expect(screen.getByText(/produk tidak ditemukan/i)).toBeInTheDocument());
  });

  test('input search ada di halaman', () => {
    renderInRouter(<ProductList />);
    expect(screen.getByPlaceholderText(/cari produk/i)).toBeInTheDocument();
  });

  test('select kategori ada dengan opsi "Semua"', async () => {
    renderInRouter(<ProductList />);
    await waitFor(() => screen.getByText('Laptop Pro 15"'));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Semua' })).toBeInTheDocument();
  });
});

// ── ProductDetail ──────────────────────────────────────────────────────────────
describe('ProductDetail', () => {
  let ProductDetail;
  beforeAll(() => {
    ProductDetail = require('../../frontend/src/pages/ProductDetail.jsx').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getProductById.mockResolvedValue({ data: sampleProducts[0] });
    mockApi.addToCartApi.mockResolvedValue({ data: { success: true } });
    mockCartValue = {
      ...mockCartValue,
      addToCart: jest.fn(),
      cartItems: [],
    };
  });

  function renderDetail(id = 'p1') {
    return render(
      <MemoryRouter initialEntries={[`/products/${id}`]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    );
  }

  test('render loading saat fetch', () => {
    mockApi.getProductById.mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(screen.getByText(/memuat produk/i)).toBeInTheDocument();
  });

  test('render nama, deskripsi, dan harga produk', async () => {
    renderDetail();
    await waitFor(() => expect(screen.getByText('Laptop Pro 15"')).toBeInTheDocument());
    expect(screen.getByText(/laptop bagus/i)).toBeInTheDocument();
    expect(screen.getByText(/12\.999\.000/)).toBeInTheDocument();
  });

  test('tombol "Add to Cart" ada saat stok tersedia', async () => {
    renderDetail();
    await waitFor(() => screen.getByText('Laptop Pro 15"'));
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  test('tombol disabled "Stok Habis" saat stock = 0', async () => {
    mockApi.getProductById.mockResolvedValue({ data: { ...sampleProducts[0], stock: 0 } });
    renderDetail();
    await waitFor(() => screen.getByText('Laptop Pro 15"'));
    expect(screen.getByRole('button', { name: /stok habis/i })).toBeDisabled();
  });

  test('klik Add to Cart memanggil addToCart dari useCart', async () => {
    const mockAddToCart = jest.fn();
    mockCartValue = { ...mockCartValue, addToCart: mockAddToCart };
    renderDetail();
    await waitFor(() => screen.getByText('Laptop Pro 15"'));
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(mockAddToCart).toHaveBeenCalledWith(sampleProducts[0]);
  });

  test('render error saat produk tidak ditemukan (404)', async () => {
    mockApi.getProductById.mockRejectedValue({ response: { status: 404 } });
    renderDetail('nonexistent');
    await waitFor(() => expect(screen.getByText(/produk tidak ditemukan/i)).toBeInTheDocument());
  });
});

// ── Cart ───────────────────────────────────────────────────────────────────────
describe('Cart', () => {
  let Cart;
  beforeAll(() => {
    Cart = require('../../frontend/src/pages/Cart.jsx').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCartValue = {
      cartItems,
      sessionId: 'test-session-uuid',
      loading: false,
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      totalItems: 3,
      totalPrice: 12999000 * 2 + 89000,
      refreshCart: jest.fn(),
    };
  });

  test('render "Keranjang kosong" saat cart empty', () => {
    mockCartValue = { ...mockCartValue, cartItems: [], totalPrice: 0, loading: false };
    renderInRouter(<Cart />);
    expect(screen.getByText(/keranjang belanja kosong/i)).toBeInTheDocument();
  });

  test('render nama produk dalam cart', () => {
    renderInRouter(<Cart />);
    expect(screen.getByText('Laptop Pro 15"')).toBeInTheDocument();
    expect(screen.getByText('Kaos Polos')).toBeInTheDocument();
  });

  test('menampilkan total harga yang benar (Rp 26.087.000)', () => {
    // total = 12999000*2 + 89000 = 26087000
    renderInRouter(<Cart />);
    expect(screen.getByText(/26\.087\.000/)).toBeInTheDocument();
  });

  test('klik hapus (✕) memanggil removeFromCart', () => {
    const mockRemove = jest.fn();
    mockCartValue = { ...mockCartValue, removeFromCart: mockRemove };
    renderInRouter(<Cart />);
    fireEvent.click(screen.getAllByTitle('Hapus')[0]);
    expect(mockRemove).toHaveBeenCalledWith('p1');
  });

  test('klik tombol − memanggil updateQuantity dengan qty - 1', () => {
    const mockUpdate = jest.fn();
    mockCartValue = { ...mockCartValue, updateQuantity: mockUpdate };
    renderInRouter(<Cart />);
    const minusButtons = screen.getAllByText('−');
    fireEvent.click(minusButtons[0]);
    expect(mockUpdate).toHaveBeenCalledWith('p1', 1); // qty 2-1 = 1
  });
});

// ── Checkout — form validation ────────────────────────────────────────────────
describe('Checkout — form validation', () => {
  let Checkout;
  beforeAll(() => {
    Checkout = require('../../frontend/src/pages/Checkout.jsx').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.createOrder.mockResolvedValue({ data: { orderId: 'order-001' } });
    mockCartValue = {
      cartItems: [cartItems[0]],
      sessionId: 'test-session-uuid',
      loading: false,
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      totalItems: 2,
      totalPrice: 12999000 * 2,
      refreshCart: jest.fn(),
    };
  });

  function renderCheckout() {
    return render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </MemoryRouter>
    );
  }

  test('render form dengan 4 field wajib', () => {
    renderCheckout();
    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/08123456789/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jl\. contoh/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jakarta/i)).toBeInTheDocument();
  });

  test('submit form kosong → tampil semua pesan error validasi', async () => {
    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: /konfirmasi order/i }));
    await waitFor(() => expect(screen.getByText(/nama lengkap wajib diisi/i)).toBeInTheDocument());
    expect(screen.getByText(/nomor telepon wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/alamat wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/kota wajib diisi/i)).toBeInTheDocument();
  });

  test('submit tanpa nama lengkap → hanya error nama', async () => {
    renderCheckout();
    fireEvent.change(screen.getByPlaceholderText(/08123456789/i), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByPlaceholderText(/jl\. contoh/i), { target: { value: 'Jl. Test No. 1' } });
    fireEvent.change(screen.getByPlaceholderText(/jakarta/i), { target: { value: 'Jakarta' } });
    fireEvent.click(screen.getByRole('button', { name: /konfirmasi order/i }));
    await waitFor(() => expect(screen.getByText(/nama lengkap wajib diisi/i)).toBeInTheDocument());
    expect(screen.queryByText(/nomor telepon wajib diisi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/alamat wajib diisi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/kota wajib diisi/i)).not.toBeInTheDocument();
  });

  test('ringkasan order menampilkan produk dan harga', () => {
    renderCheckout();
    expect(screen.getByText('Laptop Pro 15"')).toBeInTheDocument();
    expect(screen.getByText(/12\.999\.000/)).toBeInTheDocument();
  });
});
