<template>
  <div class="oracle-interface">
    <div class="input-section">
      <textarea
        v-model="question"
        placeholder="Ask the oracle your philosophical question..."
        class="question-input"
        :disabled="isLoading"
        rows="4"
      ></textarea>
      
      <button
        @click="submitQuestion"
        :disabled="!question.trim() || isLoading"
        class="btn btn-primary submit-btn"
      >
        <span v-if="isLoading">Consulting...</span>
        <span v-else>Consult Oracle</span>
      </button>
    </div>

    <div v-if="response" class="response-section">
      <div class="response-card card">
        <div class="response-header">
          <h3>Oracle's Response</h3>
          <div class="risk-badge" :class="getRiskClass(response.risk_score)">
            Risk: {{ (response.risk_score * 100).toFixed(1) }}%
          </div>
        </div>
        <div class="response-content">
          <p>{{ response.answer }}</p>
        </div>
        <div class="response-details">
          <div v-if="response.triggers && response.triggers.length" class="triggers">
            <strong>Risk Triggers:</strong>
            <span class="trigger-tags">
              <span v-for="trigger in response.triggers" :key="trigger" class="trigger-tag">
                {{ trigger }}
              </span>
            </span>
          </div>
          <div class="response-meta">
            <small>Risk Level: {{ response.risk_level }}</small>
            <small>Processed at: {{ formatTimestamp(response.timestamp) }}</small>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <p>❌ {{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { oracleAPI } from '../utils/api.js'

export default {
  name: 'OracleInterface',
  emits: ['question-asked'],
  setup(props, { emit }) {
    const question = ref('')
    const response = ref(null)
    const isLoading = ref(false)
    const error = ref('')

    const getRiskClass = (riskScore) => {
      if (riskScore < 0.3) return 'risk-low'
      if (riskScore < 0.7) return 'risk-medium'
      return 'risk-high'
    }

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return 'Just now'
      return new Date(timestamp).toLocaleString()
    }

    const submitQuestion = async () => {
      if (!question.value.trim()) return

      isLoading.value = true
      error.value = ''
      response.value = null

      try {
        const result = await oracleAPI.askQuestion(question.value.trim())
        response.value = result
        emit('question-asked')
      } catch (err) {
        error.value = err.message
        console.error('Error consulting oracle:', err)
      } finally {
        isLoading.value = false
      }
    }

    return {
      question,
      response,
      isLoading,
      error,
      submitQuestion,
      getRiskClass,
      formatTimestamp
    }
  }
}
</script>

<style scoped>
.oracle-interface {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  resize: vertical;
  transition: var(--transition);
  font-family: inherit;
}

.question-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.1);
}

.question-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  align-self: flex-end;
  min-width: 140px;
}

.response-card {
  padding: 1.5rem;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.response-header h3 {
  color: var(--text-primary);
  margin: 0;
}

.risk-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid currentColor;
}

.response-content {
  margin-bottom: 1rem;
}

.response-content p {
  line-height: 1.6;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.response-details {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.triggers {
  margin-bottom: 0.5rem;
}

.trigger-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.trigger-tag {
  background-color: var(--bg-secondary);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.response-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.error-message {
  padding: 1rem;
  background-color: rgba(229, 62, 62, 0.1);
  border: 1px solid var(--accent-danger);
  border-radius: var(--border-radius);
  color: var(--accent-danger);
}

.error-message p {
  margin: 0;
}

@media (max-width: 768px) {
  .response-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .response-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>