import axios from 'axios'

const API_BASE = 'https://oracle-philosophy-backend.onrender.com'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const oracleAPI = {
  async askQuestion(question) {
    try {
      const response = await api.post('/api/ask', { question })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get oracle response')
    }
  },

  async getLogs() {
    try {
      const response = await api.get('/api/logs')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch logs')
    }
  },

  async getRiskMetrics() {
    try {
      const response = await api.get('/api/risk')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch risk metrics')
    }
  },

  async getBlockchain() {
    try {
      const response = await api.get('/api/blocks')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch blockchain')
    }
  },

  async verifyChain() {
    try {
      const response = await api.get('/api/verify')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify chain')
    }
  },

  async getStats() {
    try {
      const response = await api.get('/api/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats')
    }
  },

  async healthCheck() {
    try {
      const response = await api.get('/api/health')
      return response.data
    } catch (error) {
      throw new Error('Service is unavailable')
    }
  }
}

export default api