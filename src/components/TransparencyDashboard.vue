<template>
  <div class="transparency-dashboard">
    <!-- Risk Metrics -->
    <div class="metrics-grid">
      <div class="metric-card card">
        <div class="metric-value" :class="getRiskClass(metrics.avg_risk)">
          {{ (metrics.avg_risk * 100).toFixed(1) }}%
        </div>
        <div class="metric-label">Average Risk Score</div>
      </div>
      
      <div class="metric-card card">
        <div class="metric-value">{{ metrics.deception_count || 0 }}</div>
        <div class="metric-label">Deception Events</div>
      </div>
      
      <div class="metric-card card">
        <div class="metric-value">{{ metrics.total_queries || 0 }}</div>
        <div class="metric-label">Total Queries</div>
      </div>

      <div class="metric-card card">
        <div class="metric-value">{{ chainStats.total_blocks || 0 }}</div>
        <div class="metric-label">Blockchain Blocks</div>
      </div>
    </div>

    <!-- Risk Distribution -->
    <div v-if="metrics.risk_distribution" class="risk-distribution card">
      <h3>Risk Distribution</h3>
      <div class="distribution-bars">
        <div v-for="(count, level) in metrics.risk_distribution" :key="level" class="distribution-item">
          <div class="distribution-label">{{ level }}</div>
          <div class="distribution-bar-container">
            <div 
              class="distribution-bar" 
              :class="`risk-${level}`"
              :style="{ width: getDistributionPercentage(level) + '%' }"
            ></div>
          </div>
          <div class="distribution-count">{{ count }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity card">
      <h3>Recent Activity</h3>
      <div class="activity-list">
        <div
          v-for="log in recentLogs"
          :key="log.id"
          class="activity-item"
        >
          <div class="activity-question">{{ log.question }}</div>
          <div class="activity-response">{{ log.answer }}</div>
          <div class="activity-meta">
            <span class="risk-tag" :class="getRiskClass(log.risk)">
              Risk: {{ (log.risk * 100).toFixed(0) }}%
            </span>
            <span class="timestamp">{{ formatTimestamp(log.timestamp) }}</span>
          </div>
        </div>
        
        <div v-if="recentLogs.length === 0" class="no-data">
          No activity recorded yet
        </div>
      </div>
    </div>

    <!-- Refresh Controls -->
    <div class="dashboard-controls">
      <button @click="refreshData" :disabled="isLoading" class="btn btn-primary">
        {{ isLoading ? 'Refreshing...' : 'Refresh Data' }}
      </button>
      <div class="last-updated">
        Last updated: {{ lastUpdated }}
      </div>
    </div>

    <div v-if="error" class="error-message">
      <p>❌ {{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { oracleAPI } from '../utils/api.js'

export default {
  name: 'TransparencyDashboard',
  setup() {
    const metrics = ref({
      avg_risk: 0,
      deception_count: 0,
      total_queries: 0,
      risk_distribution: { low: 0, medium: 0, high: 0 }
    })
    const chainStats = ref({})
    const recentLogs = ref([])
    const isLoading = ref(false)
    const error = ref('')
    const lastUpdated = ref('Never')
    let refreshInterval = null

    const getRiskClass = (riskScore) => {
      if (riskScore < 0.3) return 'risk-low'
      if (riskScore < 0.7) return 'risk-medium'
      return 'risk-high'
    }

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return 'Just now'
      return new Date(timestamp).toLocaleTimeString()
    }

    const getDistributionPercentage = (level) => {
      const total = Object.values(metrics.value.risk_distribution).reduce((a, b) => a + b, 0)
      if (total === 0) return 0
      return (metrics.value.risk_distribution[level] / total) * 100
    }

    const refreshData = async () => {
      isLoading.value = true
      error.value = ''

      try {
        // Fetch all data in parallel
        const [metricsData, logsData, statsData] = await Promise.all([
          oracleAPI.getRiskMetrics(),
          oracleAPI.getLogs(),
          oracleAPI.getStats()
        ])

        metrics.value = metricsData
        chainStats.value = statsData
        recentLogs.value = Array.isArray(logsData) ? logsData.slice(0, 5) : []
        lastUpdated.value = new Date().toLocaleTimeString()
      } catch (err) {
        error.value = err.message
        console.error('Error refreshing dashboard:', err)
      } finally {
        isLoading.value = false
      }
    }

    // Auto-refresh every 30 seconds
    onMounted(() => {
      refreshData()
      refreshInterval = setInterval(refreshData, 30000)
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      metrics,
      chainStats,
      recentLogs,
      isLoading,
      error,
      lastUpdated,
      refreshData,
      getRiskClass,
      formatTimestamp,
      getDistributionPercentage
    }
  }
}
</script>

<style scoped>
.transparency-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.metric-card {
  padding: 1.5rem;
  text-align: center;
  transition: var(--transition);
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.risk-distribution {
  padding: 1.5rem;
}

.risk-distribution h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.distribution-label {
  min-width: 60px;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--text-primary);
}

.distribution-bar-container {
  flex: 1;
  height: 20px;
  background-color: var(--bg-secondary);
  border-radius: 10px;
  overflow: hidden;
}

.distribution-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.distribution-count {
  min-width: 30px;
  text-align: right;
  color: var(--text-secondary);
  font-weight: 600;
}

.recent-activity {
  padding: 1.5rem;
}

.recent-activity h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
}

.activity-question {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-response {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.risk-tag {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid currentColor;
}

.timestamp {
  color: var(--text-secondary);
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-style: italic;
}

.dashboard-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-updated {
  color: var(--text-secondary);
  font-size: 0.9rem;
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

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .distribution-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .distribution-bar-container {
    width: 100%;
  }

  .activity-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .dashboard-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>