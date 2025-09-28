// src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.expiresIn = localStorage.getItem('expiresIn');
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  // Verificar se o token está próximo de expirar (5 minutos antes)
  isTokenExpiringSoon() {
    if (!this.expiresIn) return false;
    const expirationTime = parseInt(this.expiresIn);
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos em milissegundos
    
    return (expirationTime - currentTime) < fiveMinutes;
  }

  // Verificar se o token expirou
  isTokenExpired() {
    if (!this.expiresIn) return false;
    return Date.now() >= parseInt(this.expiresIn);
  }

  // Adicionar subscriber para aguardar refresh
  addRefreshSubscriber(callback) {
    this.refreshSubscribers.push(callback);
  }

  // Notificar todos os subscribers que o token foi renovado
  notifyRefreshSubscribers(newToken) {
    this.refreshSubscribers.forEach(callback => callback(newToken));
    this.refreshSubscribers = [];
  }

  // Renovar token automaticamente
  async refreshTokenAutomatically() {
    if (this.isRefreshing) {
      // Se já estamos renovando, aguardar
      return new Promise((resolve) => {
        this.addRefreshSubscriber((newToken) => {
          resolve(newToken);
        });
      });
    }

    if (!this.refreshToken) {
      throw new Error('Refresh token não disponível');
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/account/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao renovar token');
      }

      // Salvar novos tokens
      this.setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        expiresIn: data.data.expiresIn
      });

      // Notificar subscribers
      this.notifyRefreshSubscribers(data.data.accessToken);

      console.log('🔄 Token renovado automaticamente');
      return data.data.accessToken;

    } catch (error) {
      console.error('Erro ao renovar token:', error);
      
      // Se falhar, limpar tokens e fazer logout
      this.clearTokens();
      
      // Disparar evento customizado para o AuthContext
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Configurar cabeçalhos padrão
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    // Verificar se precisa renovar o token antes da requisição
    if (options.requireAuth !== false && (this.isTokenExpired() || this.isTokenExpiringSoon())) {
      try {
        await this.refreshTokenAutomatically();
      } catch (error) {
        // Se falhar ao renovar, a função já limpa os tokens
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.requireAuth !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Verificar se há um novo token no header da resposta
      const newToken = response.headers.get('X-New-Token');
      if (newToken) {
        this.setToken(newToken);
        // Atualizar o timestamp de expiração
        this.setExpiresIn(Date.now() + (24 * 60 * 60 * 1000)); // 24 horas
        console.log('🔄 Token atualizado via header');
      }

      const data = await response.json();

      if (!response.ok) {
        // Se for erro 401, tentar renovar token uma vez
        if (response.status === 401 && options.requireAuth !== false && !options._isRetry) {
          try {
            await this.refreshTokenAutomatically();
            // Tentar novamente com o novo token
            return this.request(endpoint, { ...options, _isRetry: true });
          } catch (refreshError) {
            // Se falhar, propagar o erro original
            throw new Error(data.message || 'Erro na requisição');
          }
        }
        
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Salvar tokens no localStorage
  setTokens({ accessToken, refreshToken, expiresIn }) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;

    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (expiresIn) {
      localStorage.setItem('expiresIn', expiresIn.toString());
    }
  }

  // Atualizar apenas o access token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Atualizar timestamp de expiração
  setExpiresIn(timestamp) {
    this.expiresIn = timestamp;
    localStorage.setItem('expiresIn', timestamp.toString());
  }

  // Limpar todos os tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.expiresIn = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresIn');
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

    if (response.data) {
      this.setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn
      });
    }

    return response;
  }

  async refreshTokenManually() {
    return this.refreshTokenAutomatically();
  }

  async logout() {
    try {
      await this.request('/account/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  async deleteAccount(password) {
    const response = await this.request('/account/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    
    this.clearTokens();
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

  async getMyProducts() {
    return this.request('/produtos/my-products', { requireAuth: true });
  }

  // ========================
  // BUY ROUTES
  // ========================

  async buyProduct(productId, quantity = 1) {
    return this.request(`/buy/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
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