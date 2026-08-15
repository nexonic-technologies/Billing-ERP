const API_BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('teashop_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),

  // Products & Categories
  getCategories: () => request('/products/categories'),
  getProducts: (categoryId = 'all', search = '') => 
    request(`/products?category_id=${categoryId}&search=${encodeURIComponent(search)}`),
  createProduct: (productData) => request('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, productData) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders & Billing
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: (search = '') => request(`/orders?search=${encodeURIComponent(search)}`),
  getOrderById: (id) => request(`/orders/${id}`),
  getInvoicePdfUrl: (id) => `/api/orders/${id}/pdf`,

  // Reports
  getDashboardStats: () => request('/reports/dashboard'),
  getReportPdfUrl: (startDate, endDate) => `/api/reports/pdf?startDate=${startDate}&endDate=${endDate}`
};
