// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Configurar cabeçalhos padrão
  getHeaders(includeAuth = true, includeContentType = true) {
    const headers = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.requireAuth !== false, options.includeContentType !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Atualizar token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // ========================
  // ACCOUNT ROUTES
  // ========================

  async signup(userData) {
    return this.request('/account/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      requireAuth: false,
    });
  }

  async login(credentials) {
    const response = await this.request('/account/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      requireAuth: false,
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/account/logout', {
        method: 'POST',
      });
    } finally {
      this.setToken(null);
    }
  }

  async deleteAccount(password) {
    const response = await this.request('/account/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    
    this.setToken(null);
    return response;
  }

  async makeAdmin(email, secretCode) {
    return this.request('/account/make-admin', {
      method: 'POST',
      body: JSON.stringify({ email, secretCode }),
      requireAuth: false,
    });
  }

  // ========================
  // USERS ROUTES
  // ========================

  async getMe() {
    return this.request('/users/me');
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateMe(userData) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
      requireAuth: true,
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================
  // PRODUCTS ROUTES
  // ========================

  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/produtos${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, { requireAuth: false });
  }

  async getProductById(id) {
    return this.request(`/produtos/${id}`, { requireAuth: false });
  }

  async createProduct(productData) {
    return this.request('/produtos', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async updateProductRating(id, rating) {
    return this.request(`/produtos/${id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating }),
    });
  }

  // Verificar se usuário já avaliou o produto
  async checkUserRating(id) {
    return this.request(`/produtos/${id}/rating/check`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async deleteProduct(id) {
    return this.request(`/produtos/${id}`, {
      method: 'DELETE',
    });
  }

  async getProductsBySeller(seller) {
    return this.request(`/produtos/seller/${seller}`, { requireAuth: false });
  }

  async getProductsByCategory(category) {
    return this.request(`/produtos/category/${category}`, { requireAuth: false });
  }

  async getProductsWithFreeShipping() {
    return this.request('/produtos/frete-gratis', { requireAuth: false });
  }

  // Buscar produtos do usuário logado
  async getMyProducts() {
    return this.request('/produtos/my-products', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getTotalProductsCount() {
    return this.request('/produtos/count', { requireAuth: false });
  }

  // ========================
  // UPLOAD ROUTES
  // ========================

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return this.request('/upload/image', {
      method: 'POST',
      body: formData,
      includeContentType: false,
    });
  }

  // ========================
  // BUY ROUTES
  // ========================

  async getMyOrders() {
    return this.request('/orders/my-orders', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async buyProduct(productId, quantity = 1) {
    return this.request(`/buy/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  // ========================
  // CHECKOUT ROUTES
  // ========================

  // Checkout com PIX
  async checkoutPix(productId, quantity = 1) {
    return this.request(`/checkout/pix/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
      requireAuth: true,
    });
  }

  // Confirmar pagamento PIX (publico - sem autenticacao)
  async confirmPixPayment(pixCode) {
    return this.request(`/checkout/pix/confirm/${pixCode}`, {
      method: 'POST',
      requireAuth: false,
    });
  }

  // Verificar status do pagamento PIX (publico - sem autenticacao)
  async checkPixStatus(pixCode) {
    return this.request(`/checkout/pix/status/${pixCode}`, {
      method: 'GET',
      requireAuth: false,
    });
  }

  // Checkout com Cartao
  async checkoutCartao(productId, cardData) {
    return this.request(`/checkout/cartao/${productId}`, {
      method: 'POST',
      body: JSON.stringify(cardData),
      requireAuth: true,
    });
  }

  // Checkout com Boleto
  async checkoutBoleto(productId, quantity = 1) {
    return this.request(`/checkout/boleto/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
      requireAuth: true,
    });
  }

  // ========================
  // ORDERS ROUTES
  // ========================

  async getAllOrders(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  async getOrdersByUser(userId) {
    return this.request(`/orders/user/${userId}`);
  }

  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  async getOrdersByStatus(status) {
    return this.request(`/orders/status/${status}`);
  }
}

// Criar instância única do serviço
const apiService = new ApiService();

export default apiService;