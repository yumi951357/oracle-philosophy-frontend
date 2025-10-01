<template>
  <div class="oracle-interface">
    <!-- Header Section -->
    <div class="interface-header">
      <h2>🐍 Oracle Interface</h2>
      <p>Where Truth and Deception Intertwine</p>
      <div class="session-info">
        <span>Session: {{ sessionId.substring(0, 10) }}...</span>
        <span class="status-indicator" :class="apiStatus">
          {{ apiStatus === 'online' ? '🟢 Online' : '🔴 Offline' }}
        </span>
      </div>
    </div>

    <!-- Conversation History -->
    <div v-if="conversationHistory.length > 0" class="conversation-history">
      <h3>📜 Conversation History ({{ conversationHistory.length }} rounds)</h3>
      <div class="history-list">
        <div 
          v-for="(conv, index) in reversedHistory" 
          :key="index" 
          class="history-item"
        >
          <div class="user-question">
            <strong>You:</strong> {{ conv.question }}
          </div>
          <div class="oracle-response" :class="getResponseClass(conv)">
            <strong>Oracle:</strong> {{ conv.response }}
            <div class="response-metadata">
              <span class="risk-badge" :class="conv.riskBucket">
                {{ conv.riskBucket.toUpperCase() }} RISK
              </span>
              <span class="entropy">Entropy: {{ conv.entropy }}</span>
              <span v-if="conv.isVerifiable" class="verification">✅ Verifiable</span>
              <span v-else class="verification">⚠️ Creative</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Section -->
    <div class="input-section">
      <textarea
        v-model="currentQuestion"
        @keydown.enter.prevent="handleEnterKey"
        placeholder="Ask the oracle profound philosophical questions... (Press Enter to send)"
        rows="3"
        :disabled="loading"
      ></textarea>
      <button 
        @click="askOracle" 
        :disabled="loading || !currentQuestion.trim()"
        class="ask-button"
      >
        {{ loading ? '🔄 Thinking...' : '🔮 Consult Oracle' }}
      </button>
    </div>

    <!-- Current Response -->
    <div v-if="currentResponse" class="current-response">
      <h3>Oracle's Revelation:</h3>
      <div class="answer-card" :class="currentResponse.riskBucket">
        <div class="answer-text">{{ currentResponse.answerText }}</div>
        
        <!-- Risk Visualization -->
        <div class="risk-visualization">
          <div class="risk-meter">
            <div class="risk-label">Deception Risk</div>
            <div class="meter-bar">
              <div 
                class="meter-fill" 
                :class="currentResponse.riskBucket"
                :style="{ width: `${currentResponse.deceptionRisk * 100}%` }"
              ></div>
            </div>
            <div class="risk-value">{{ (currentResponse.deceptionRisk * 100).toFixed(1) }}%</div>
          </div>
          
          <div class="confidence-meter">
            <div class="confidence-label">Confidence</div>
            <div class="meter-bar">
              <div 
                class="confidence-fill" 
                :style="{ width: `${currentResponse.confidence * 100}%` }"
              ></div>
            </div>
            <div class="confidence-value">{{ (currentResponse.confidence * 100).toFixed(1) }}%</div>
          </div>
        </div>

        <!-- Deception Analysis -->
        <div v-if="currentResponse.deceptionAnalysis" class="deception-analysis">
          <h4>🔍 Deception Analysis</h4>
          <div class="analysis-grid">
            <div class="analysis-item">
              <span class="label">Keyword Score:</span>
              <span class="value">{{ currentResponse.deceptionAnalysis.keywordScore }}</span>
            </div>
            <div class="analysis-item">
              <span class="label">ML Score:</span>
              <span class="value">{{ currentResponse.deceptionAnalysis.mlScore }}</span>
            </div>
            <div class="analysis-item">
              <span class="label">Semantic Confidence:</span>
              <span class="value">{{ currentResponse.deceptionAnalysis.semanticConfidence }}</span>
            </div>
          </div>
          
          <div v-if="currentResponse.deceptionAnalysis.matchedPatterns.length" class="matched-patterns">
            <strong>Matched Patterns:</strong>
            {{ currentResponse.deceptionAnalysis.matchedPatterns.join(', ') }}
          </div>
          
          <div class="explanation">
            <strong>Explanation:</strong> {{ currentResponse.deceptionAnalysis.explanation }}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            @click="submitFeedback('helpful')"
            class="action-btn helpful"
          >
            👍 Helpful
          </button>
          <button 
            @click="submitFeedback('confusing')"
            class="action-btn confusing"
          >
            ❓ Confusing
          </button>
          <button 
            v-if="currentResponse.deceptionRisk > 0.5"
            @click="flagContent"
            class="action-btn flag"
          >
            🚩 Flag Content
          </button>
          <button 
            @click="requestEvidence"
            class="action-btn evidence"
          >
            🔍 Request Evidence
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-text">{{ error }}</div>
      <button @click="clearError" class="dismiss-btn">Dismiss</button>
    </div>
  </div>
</template>

<script>
import oracleAPI from '../utils/api.js';

export default {
  name: 'OracleInterface',
  data() {
    return {
      currentQuestion: '',
      currentResponse: null,
      conversationHistory: [],
      loading: false,
      error: null,
      apiStatus: 'checking',
      sessionId: this.generateSessionId(),
      userId: this.generateUserId()
    };
  },
  computed: {
    reversedHistory() {
      return [...this.conversationHistory].reverse();
    }
  },
  async mounted() {
    await this.checkApiStatus();
    this.initializeSession();
  },
  methods: {
    generateSessionId() {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    generateUserId() {
      return `user_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    initializeSession() {
      console.log('Session initialized:', this.sessionId);
    },
    
    async checkApiStatus() {
      try {
        await oracleAPI.healthCheck();
        this.apiStatus = 'online';
      } catch (error) {
        this.apiStatus = 'offline';
      }
    },
    
    handleEnterKey(event) {
      if (event.ctrlKey || event.metaKey) {
        // Allow new line with Ctrl+Enter
        this.currentQuestion += '\n';
      } else {
        // Send message with Enter
        this.askOracle();
      }
    },
    
    async askOracle() {
      if (!this.currentQuestion.trim() || this.loading) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await oracleAPI.askOracle(
          this.currentQuestion, 
          this.sessionId, 
          this.userId
        );
        
        // Store current response
        this.currentResponse = {
          answerText: response.answer_text,
          entropy: response.entropy,
          deceptionRisk: response.deception_risk,
          riskBucket: response.risk_bucket,
          confidence: response.confidence,
          isVerifiable: response.is_verifiable,
          responseType: response.response_type,
          deceptionAnalysis: response.deception_analysis,
          timestamp: response.timestamp,
          eventId: response.event_id
        };
        
        // Add to conversation history
        this.conversationHistory.push({
          question: this.currentQuestion,
          response: response.answer_text,
          entropy: response.entropy,
          deceptionRisk: response.deception_risk,
          riskBucket: response.risk_bucket,
          isVerifiable: response.is_verifiable,
          timestamp: response.timestamp
        });
        
        // Clear input
        this.currentQuestion = '';
        
      } catch (error) {
        this.error = this.formatErrorMessage(error);
        console.error('Oracle query error:', error);
      } finally {
        this.loading = false;
      }
    },
    
    getResponseClass(conv) {
      return {
        'low-risk': conv.riskBucket === 'low',
        'medium-risk': conv.riskBucket === 'medium',
        'high-risk': conv.riskBucket === 'high',
        'critical-risk': conv.riskBucket === 'critical',
        'verifiable': conv.isVerifiable,
        'creative': !conv.isVerifiable
      };
    },
    
    formatErrorMessage(error) {
      switch (error.type) {
        case 'network_error':
          return 'Cannot connect to the oracle server. Please check your connection and try again.';
        case 'api_error':
          return `Server error: ${error.message}`;
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    },
    
    clearError() {
      this.error = null;
    },
    
    async submitFeedback(feedbackType) {
      if (!this.currentResponse) return;
      
      try {
        await oracleAPI.submitFeedback({
          user_id: this.userId,
          session_id: this.sessionId,
          event_id: this.currentResponse.eventId,
          feedback_type: feedbackType,
          rating: feedbackType === 'helpful' ? 5 : 3,
          comment: `User provided ${feedbackType} feedback`
        });
        
        this.$emit('feedbackSubmitted', {
          type: feedbackType,
          eventId: this.currentResponse.eventId
        });
        
      } catch (error) {
        console.error('Feedback submission error:', error);
      }
    },
    
    flagContent() {
      this.submitFeedback('deceptive');
      alert('Content has been flagged for review. Thank you for your vigilance.');
    },
    
    requestEvidence() {
      alert('Evidence request submitted. Grounding sources will be retrieved if available.');
    }
  }
};
</script>

<style scoped>
.oracle-interface {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.interface-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #8a2be2;
  padding-bottom: 20px;
}

.interface-header h2 {
  color: #8a2be2;
  margin: 0;
  font-size: 2.2rem;
}

.session-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
  font-size: 0.9rem;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.status-indicator.online {
  background: #e8f5e8;
  color: #2d5016;
  border: 1px solid #c3e6cb;
}

.status-indicator.offline {
  background: #fff0f0;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}

.conversation-history {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  margin: 15px 0;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-question {
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 500;
}

.oracle-response {
  color: #34495e;
  padding: 10px;
  border-radius: 6px;
}

.response-metadata {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  font-size: 0.8rem;
  flex-wrap: wrap;
}

.risk-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.risk-badge.low {
  background: #d4edda;
  color: #155724;
}

.risk-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.risk-badge.high {
  background: #f8d7da;
  color: #721c24;
}

.risk-badge.critical {
  background: #dc3545;
  color: white;
}

.entropy, .verification {
  padding: 2px 6px;
  background: #e9ecef;
  border-radius: 4px;
  color: #6c757d;
}

.input-section {
  display: flex;
  gap: 15px;
  margin: 30px 0;
}

.input-section textarea {
  flex: 1;
  padding: 15px;
  border: 2px solid #8a2be2;
  border-radius: 10px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.input-section textarea:focus {
  outline: none;
  border-color: #7b1fa2;
}

.ask-button {
  padding: 15px 25px;
  background: #8a2be2;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.ask-button:hover:not(:disabled) {
  background: #7b1fa2;
  transform: translateY(-1px);
}

.ask-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.current-response {
  margin: 30px 0;
}

.answer-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-left: 6px solid;
}

.answer-card.low {
  border-left-color: #28a745;
}

.answer-card.medium {
  border-left-color: #ffc107;
}

.answer-card.high {
  border-left-color: #fd7e14;
}

.answer-card.critical {
  border-left-color: #dc3545;
}

.answer-text {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 500;
}

.risk-visualization {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.risk-meter, .confidence-meter {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.meter-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.meter-fill.low { background: #28a745; }
.meter-fill.medium { background: #ffc107; }
.meter-fill.high { background: #fd7e14; }
.meter-fill.critical { background: #dc3545; }

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #ffc107);
  transition: width 0.5s ease;
}

.risk-value, .confidence-value {
  font-weight: bold;
  text-align: right;
}

.deception-analysis {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 15px 0;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
}

.matched-patterns, .explanation {
  margin: 10px 0;
  padding: 10px;
  background: white;
  border-radius: 6px;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.helpful:hover {
  background: #d4edda;
  border-color: #c3e6cb;
}

.action-btn.confusing:hover {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.action-btn.flag:hover {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.action-btn.evidence:hover {
  background: #d1ecf1;
  border-color: #bee5eb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.dismiss-btn {
  margin-left: auto;
  padding: 5px 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

@media (max-width: 768px) {
  .oracle-interface {
    padding: 10px;
  }
  
  .input-section {
    flex-direction: column;
  }
  
  .risk-visualization {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}
</style>