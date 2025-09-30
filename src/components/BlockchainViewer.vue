<template>
  <div class="blockchain-viewer">
    <!-- Controls -->
    <div class="viewer-controls">
      <button @click="refreshBlocks" :disabled="isLoading" class="btn btn-primary">
        {{ isLoading ? 'Refreshing...' : 'Refresh Chain' }}
      </button>
      <div class="chain-info">
        <span class="block-count">{{ blocks.length }} Blocks</span>
        <span class="integrity-badge" :class="chainIntegrity.status">
          {{ chainIntegrity.message }}
        </span>
      </div>
    </div>

    <!-- Blockchain Visualization -->
    <div class="blockchain-container">
      <div
        v-for="(block, index) in blocks"
        :key="block.id || index"
        class="block-card card"
        :class="{ 'genesis-block': block.payload?.type === 'genesis' }"
      >
        <div class="block-header">
          <div class="block-index">Block #{{ block.index }}</div>
          <div class="block-type">{{ getBlockType(block) }}</div>
          <div class="block-hash">{{ shortenHash(block.hash) }}</div>
        </div>
        
        <div class="block-content">
          <div v-if="block.payload?.type === 'oracle_interaction'" class="interaction-data">
            <div class="data-field">
              <strong>Question:</strong>
              <span class="question-text">{{ block.payload.question }}</span>
            </div>
            <div class="data-field">
              <strong>Response:</strong>
              <span class="response-text">{{ block.payload.response }}</span>
            </div>
            <div class="risk-info">
              <span class="risk-score" :class="getRiskClass(block.payload.risk_score)">
                Risk: {{ (block.payload.risk_score * 100).toFixed(1) }}%
              </span>
              <span class="risk-level">{{ block.payload.risk_bucket }}</span>
            </div>
          </div>
          
          <div v-else-if="block.payload?.type === 'genesis'" class="genesis-data">
            <p>{{ block.payload.message }}</p>
            <small>Version: {{ block.payload.system_version }}</small>
          </div>
          
          <div v-else class="generic-data">
            <pre>{{ JSON.stringify(block.payload, null, 2) }}</pre>
          </div>
        </div>
        
        <div class="block-footer">
          <div class="timestamp">{{ formatTimestamp(block.timestamp) }}</div>
          <div class="prev-hash" v-if="block.previous_hash && block.previous_hash !== '0'">
            Prev: {{ shortenHash(block.previous_hash) }}
          </div>
        </div>
        
        <div class="block-connector" v-if="index < blocks.length - 1">
          <div class="connector-line"></div>
          <div class="connector-arrow">↓</div>
        </div>
      </div>

      <div v-if="blocks.length === 0 && !isLoading" class="empty-chain">
        <div class="empty-icon">⛓️</div>
        <h3>No blocks in the chain</h3>
        <p>The blockchain is empty. Start by asking the oracle a question.</p>
      </div>

      <div v-if="isLoading" class="loading-chain">
        <div class="loading-spinner"></div>
        <p>Loading blockchain data...</p>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <p>❌ {{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { oracleAPI } from '../utils/api.js'

export default {
  name: 'BlockchainViewer',
  setup() {
    const blocks = ref([])
    const isLoading = ref(false)
    const error = ref('')

    const chainIntegrity = computed(() => {
      if (blocks.value.length === 0) {
        return { status: 'unknown', message: 'Chain Empty' }
      }

      // Basic integrity check - verify chain links
      for (let i = 1; i < blocks.value.length; i++) {
        const currentBlock = blocks.value[i]
        const previousBlock = blocks.value[i - 1]
        
        if (currentBlock.previous_hash !== previousBlock.hash) {
          return { status: 'compromised', message: 'Integrity Compromised' }
        }
      }

      return { status: 'secure', message: 'Chain Secure' }
    })

    const getBlockType = (block) => {
      const type = block.payload?.type
      switch (type) {
        case 'genesis': return 'Genesis Block'
        case 'oracle_interaction': return 'Oracle Query'
        default: return type || 'Unknown'
      }
    }

    const getRiskClass = (riskScore) => {
      if (!riskScore) return ''
      if (riskScore < 0.3) return 'risk-low'
      if (riskScore < 0.7) return 'risk-medium'
      return 'risk-high'
    }

    const shortenHash = (hash) => {
      if (!hash) return 'N/A'
      return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
    }

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return 'Unknown'
      return new Date(timestamp).toLocaleString()
    }

    const refreshBlocks = async () => {
      isLoading.value = true
      error.value = ''

      try {
        const chainData = await oracleAPI.getBlockchain()
        blocks.value = Array.isArray(chainData) ? chainData : []
      } catch (err) {
        error.value = err.message
        console.error('Error fetching blockchain:', err)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      refreshBlocks()
    })

    return {
      blocks,
      isLoading,
      error,
      chainIntegrity,
      refreshBlocks,
      getBlockType,
      getRiskClass,
      shortenHash,
      formatTimestamp
    }
  }
}
</script>

<style scoped>
.blockchain-viewer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.viewer-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.chain-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.block-count {
  color: var(--text-primary);
  font-weight: 600;
}

.integrity-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.integrity-badge.secure {
  background-color: rgba(56, 161, 105, 0.2);
  color: var(--accent-success);
  border: 1px solid var(--accent-success);
}

.integrity-badge.compromised {
  background-color: rgba(229, 62, 62, 0.2);
  color: var(--accent-danger);
  border: 1px solid var(--accent-danger);
}

.integrity-badge.unknown {
  background-color: rgba(214, 158, 46, 0.2);
  color: var(--accent-warning);
  border: 1px solid var(--accent-warning);
}

.blockchain-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.block-card {
  padding: 1.5rem;
  position: relative;
  transition: var(--transition);
}

.block-card:hover {
  transform: translateX(5px);
}

.block-card.genesis-block {
  border-left: 4px solid var(--accent-success);
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.block-index {
  font-weight: 700;
  color: var(--accent-primary);
  font-size: 1.1rem;
}

.block-type {
  background-color: var(--accent-primary);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.block-hash {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.block-content {
  margin-bottom: 1rem;
}

.interaction-data {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.data-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.data-field strong {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.question-text, .response-text {
  color: var(--text-secondary);
  line-height: 1.4;
  background-color: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.risk-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.risk-score {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid currentColor;
  font-size: 0.8rem;
}

.risk-level {
  background-color: var(--bg-secondary);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  text-transform: capitalize;
  color: var(--text-secondary);
}

.genesis-data {
  text-align: center;
  padding: 1rem;
}

.genesis-data p {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.genesis-data small {
  color: var(--text-secondary);
}

.generic-data pre {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--border-radius);
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0;
  color: var(--text-primary);
  max-height: 150px;
  overflow-y: auto;
}

.block-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.prev-hash {
  font-family: 'Monaco', 'Consolas', monospace;
  background-color: var(--bg-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.block-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.5rem 0;
}

.connector-line {
  width: 2px;
  height: 20px;
  background-color: var(--accent-primary);
  opacity: 0.5;
}

.connector-arrow {
  color: var(--accent-primary);
  font-size: 1.2rem;
}

.empty-chain,
.loading-chain {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  .viewer-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .block-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .block-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .risk-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>