import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class OracleAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  async askOracle(question, sessionId = null, userId = null) {
    try {
      const payload = {
        question: question,
        session_id: sessionId || this.generateSessionId(),
        user_id: userId || this.generateUserId()
      };

      const response = await this.client.post('/ask', payload);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw this.handleError(error);
    }
  }

  async getEvents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.riskBucket) {
        filters.riskBucket.forEach(bucket => {
          params.append('risk_bucket', bucket);
        });
      }
      
      if (filters.type) {
        filters.type.forEach(type => {
          params.append('type', type);
        });
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit);
      }

      const response = await this.client.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Events API Error:', error);
      throw this.handleError(error);
    }
  }

  async verifyLedger(fromEvent = null, toEvent = null) {
    try {
      const params = {};
      if (fromEvent) params.from = fromEvent;
      if (toEvent) params.to = toEvent;

      const response = await this.client.get('/ledger/verify', { params });
      return response.data;
    } catch (error) {
      console.error('Ledger Verification Error:', error);
      throw this.handleError(error);
    }
  }

  async submitFeedback(feedbackData) {
    try {
      const response = await this.client.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Feedback API Error:', error);
      throw this.handleError(error);
    }
  }

  async getAdminStats(password) {
    try {
      const response = await this.client.get('/admin/stats', {
        params: { password }
      });
      return response.data;
    } catch (error) {
      console.error('Admin Stats Error:', error);
      throw this.handleError(error);
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health Check Error:', error);
      throw this.handleError(error);
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateUserId() {
    return `user_${Math.random().toString(36).substr(2, 9)}`;
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        type: 'api_error',
        message: error.response.data.error || 'Server error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Network error
      return {
        type: 'network_error',
        message: 'Network error: Cannot connect to oracle server',
        status: null
      };
    } else {
      // Other errors
      return {
        type: 'unknown_error',
        message: error.message || 'An unexpected error occurred',
        status: null
      };
    }
  }
}

// Create singleton instance
const oracleAPI = new OracleAPI();
export default oracleAPI;