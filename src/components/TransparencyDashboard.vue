<template>
  <div class="transparency-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <h2>📊 Transparency Dashboard</h2>
      <p>Real-time monitoring of oracle system integrity and deception patterns</p>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalEvents }}</div>
            <div class="stat-label">Total Events</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-value">{{ highRiskEvents }}</div>
            <div class="stat-label">High Risk Events</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">{{ avgDeceptionRisk.toFixed(2) }}</div>
            <div class="stat-label">Avg Deception Risk</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔄</div>
          <div class="stat-content">
            <div class="stat-value">{{ systemUptime }}</div>
            <div class="stat-label">System Uptime</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Risk Distribution Chart -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>Risk Distribution</h3>
          <div class="card-actions">
            <button @click="refreshCharts" class="action-btn">
              🔄 Refresh
            </button>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="riskChart"></canvas>
        </div>
      </div>

      <!-- Deception Risk Over Time -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>Deception Risk Timeline</h3>
        </div>
        <div class="chart-container">
          <canvas ref="timelineChart"></canvas>
        </div>
      </div>

      <!-- Event Type Distribution -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>Event Type Distribution</h3>
        </div>
        <div class="chart-container">
          <canvas ref="typeChart"></canvas>
        </div>
      </div>

      <!-- Top Risk Patterns -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>Top Risk Patterns</h3>
        </div>
        <div class="patterns-list">
          <div 
            v-for="pattern in topPatterns" 
            :key="pattern.name"
            class="pattern-item"
          >
            <div class="pattern-info">
              <span class="pattern-name">{{ pattern.name }}</span>
              <span class="pattern-count">{{ pattern.count }} events</span>
            </div>
            <div class="pattern-bar">
              <div 
                class="pattern-fill" 
                :style="{ width: `${(pattern.count / maxPatternCount) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Event Stream -->
      <div class="dashboard-card full-width">
        <div class="card-header">
          <h3>Real-time Event Stream</h3>
          <div class="stream-controls">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="autoRefresh" 
                @change="toggleAutoRefresh"
              >
              Auto-refresh
            </label>
            <button 
              @click="clearStream" 
              class="action-btn clear-btn"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
        <div class="event-stream">
          <div 
            v-for="event in recentEvents" 
            :key="event.id"
            class="stream-event"
            :class="getStreamEventClass(event)"
          >
            <div class="event-time">
              {{ formatEventTime(event.timestamp) }}
            </div>
            <div class="event-content">
              <span class="event-type">{{ event.payload.type }}</span>
              <span class="event-summary">{{ event.payload.content_summary }}</span>
            </div>
            <div class="event-risk" :class="getRiskClass(event.payload.deception_risk)">
              {{ (event.payload.deception_risk * 100).toFixed(0) }}%
            </div>
          </div>
          
          <div v-if="recentEvents.length === 0" class="empty-stream">
            <div class="empty-icon">📭</div>
            <p>No recent events</p>
          </div>
        </div>
      </div>

      <!-- System Integrity Monitor -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3>System Integrity</h3>
        </div>
        <div class="integrity-monitor">
          <div class="integrity-item">
            <span class="integrity-label">Blockchain Verified</span>
            <span 
              class="integrity-status"
              :class="{ verified: integrity.verified }"
            >
              {{ integrity.verified ? '✅' : '❌' }}
            </span>
          </div>
          <div class="integrity-item">
            <span class="integrity-label">Last Verification</span>
            <span class="integrity-value">{{ integrity.lastCheck || 'Never' }}</span>
          </div>
          <div class="integrity-item">
            <span class="integrity-label">Events Processed</span>
            <span class="integrity-value">{{ integrity.eventsProcessed }}</span>
          </div>
          <button 
            @click="verifyIntegrity" 
            :disabled="verifyingIntegrity"
            class="integrity-btn"
          >
            {{ verifyingIntegrity ? 'Verifying...' : 'Verify Now' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import oracleAPI from '../utils/api.js';

Chart.register(...registerables);

export default {
  name: 'TransparencyDashboard',
  data() {
    return {
      events: [],
      recentEvents: [],
      charts: {},
      autoRefresh: true,
      autoRefreshInterval: null,
      integrity: {
        verified: false,
        lastCheck: null,
        eventsProcessed: 0
      },
      verifyingIntegrity: false,
      refreshInterval: 30000, // 30 seconds
      stats: {
        totalEvents: 0,
        highRiskEvents: 0,
        avgDeceptionRisk: 0,
        riskDistribution: {},
        typeDistribution: {},
        patternDistribution: {}
      }
    };
  },
  computed: {
    totalEvents() {
      return this.stats.totalEvents;
    },
    highRiskEvents() {
      return this.stats.highRiskEvents;
    },
    avgDeceptionRisk() {
      return this.stats.avgDeceptionRisk;
    },
    systemUptime() {
      return '99.9%';
    },
    topPatterns() {
      const patterns = Object.entries(this.stats.patternDistribution)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      
      return patterns;
    },
    maxPatternCount() {
      return Math.max(...this.topPatterns.map(p => p.count), 1);
    }
  },
  async mounted() {
    await this.loadDashboardData();
    this.initializeCharts();
    this.startAutoRefresh();
  },
  beforeUnmount() {
    this.stopAutoRefresh();
    this.destroyCharts();
  },
  methods: {
    async loadDashboardData() {
      try {
        const response = await oracleAPI.getEvents({ limit: 1000 });
        this.events = response.events || [];
        this.recentEvents = this.events.slice(0, 50).reverse();
        this.calculateStats();
        this.updateCharts();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    },
    
    calculateStats() {
      // Reset stats
      this.stats = {
        totalEvents: this.events.length,
        highRiskEvents: 0,
        avgDeceptionRisk: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        typeDistribution: {},
        patternDistribution: {}
      };
      
      let totalRisk = 0;
      let riskCount = 0;
      
      this.events.forEach(event => {
        const payload = event.payload || {};
        const risk = payload.deception_risk || 0;
        const riskBucket = payload.risk_bucket || 'unknown';
        const type = payload.type || 'unknown';
        
        // Count high risk events
        if (risk >= 0.5) {
          this.stats.highRiskEvents++;
        }
        
        // Accumulate risk for average
        if (risk > 0) {
          totalRisk += risk;
          riskCount++;
        }
        
        // Risk distribution
        if (this.stats.riskDistribution[riskBucket] !== undefined) {
          this.stats.riskDistribution[riskBucket]++;
        }
        
        // Type distribution
        this.stats.typeDistribution[type] = (this.stats.typeDistribution[type] || 0) + 1;
        
        // Pattern distribution
        const patterns = payload.matched_patterns || [];
        patterns.forEach(pattern => {
          this.stats.patternDistribution[pattern] = (this.stats.patternDistribution[pattern] || 0) + 1;
        });
      });
      
      // Calculate averages
      this.stats.avgDeceptionRisk = riskCount > 0 ? totalRisk / riskCount : 0;
      this.integrity.eventsProcessed = this.events.length;
    },
    
    initializeCharts() {
      this.initializeRiskChart();
      this.initializeTimelineChart();
      this.initializeTypeChart();
    },
    
    initializeRiskChart() {
      const ctx = this.$refs.riskChart.getContext('2d');
      this.charts.risk = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
          datasets: [{
            data: [0, 0, 0, 0],
            backgroundColor: [
              '#28a745',
              '#ffc107', 
              '#fd7e14',
              '#dc3545'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    
    initializeTimelineChart() {
      const ctx = this.$refs.timelineChart.getContext('2d');
      this.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Deception Risk',
            data: [],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              ticks: {
                callback: function(value) {
                  return (value * 100) + '%';
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Risk: ${(context.parsed.y * 100).toFixed(1)}%`;
                }
              }
            }
          }
        }
      });
    },
    
    initializeTypeChart() {
      const ctx = this.$refs.typeChart.getContext('2d');
      this.charts.type = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Event Count',
            data: [],
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    },
    
    updateCharts() {
      this.updateRiskChart();
      this.updateTimelineChart();
      this.updateTypeChart();
    },
    
    updateRiskChart() {
      if (this.charts.risk) {
        this.charts.risk.data.datasets[0].data = [
          this.stats.riskDistribution.low || 0,
          this.stats.riskDistribution.medium || 0,
          this.stats.riskDistribution.high || 0,
          this.stats.riskDistribution.critical || 0
        ];
        this.charts.risk.update();
      }
    },
    
    updateTimelineChart() {
      if (this.charts.timeline) {
        // Sample last 20 events for timeline
        const sampleEvents = this.events.slice(-20);
        const labels = sampleEvents.map(event => 
          new Date(event.timestamp).toLocaleTimeString()
        );
        const data = sampleEvents.map(event => 
          event.payload.deception_risk || 0
        );
        
        this.charts.timeline.data.labels = labels;
        this.charts.timeline.data.datasets[0].data = data;
        this.charts.timeline.update();
      }
    },
    
    updateTypeChart() {
      if (this.charts.type) {
        const types = Object.keys(this.stats.typeDistribution);
        const counts = types.map(type => this.stats.typeDistribution[type]);
        
        this.charts.type.data.labels = types;
        this.charts.type.data.datasets[0].data = counts;
        this.charts.type.update();
      }
    },
    
    destroyCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
      this.charts = {};
    },
    
    startAutoRefresh() {
      if (this.autoRefresh) {
        this.autoRefreshInterval = setInterval(() => {
          this.loadDashboardData();
        }, this.refreshInterval);
      }
    },
    
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },
    
    toggleAutoRefresh() {
      if (this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
    
    async refreshCharts() {
      await this.loadDashboardData();
    },
    
    clearStream() {
      this.recentEvents = [];
    },
    
    async verifyIntegrity() {
      this.verifyingIntegrity = true;
      try {
        const result = await oracleAPI.verifyLedger();
        this.integrity.verified = result.verified;
        this.integrity.lastCheck = new Date().toLocaleString();
        
        if (!result.verified) {
          console.warn('Integrity verification failed:', result.integrity_issues);
        }
      } catch (error) {
        console.error('Integrity verification error:', error);
        this.integrity.verified = false;
      } finally {
        this.verifyingIntegrity = false;
      }
    },
    
    getStreamEventClass(event) {
      const risk = event.payload.deception_risk || 0;
      return {
        'low-risk': risk < 0.25,
        'medium-risk': risk >= 0.25 && risk < 0.5,
        'high-risk': risk >= 0.5 && risk < 0.75,
        'critical-risk': risk >= 0.75
      };
    },
    
    getRiskClass(risk) {
      if (risk < 0.25) return 'low';
      if (risk < 0.5) return 'medium';
      if (risk < 0.75) return 'high';
      return 'critical';
    },
    
    formatEventTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }
  }
};
</script>

<style scoped>
.transparency-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 5px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
}

.dashboard-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
}

.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.chart-container {
  height: 300px;
  position: relative;
}

.patterns-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pattern-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pattern-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pattern-name {
  font-weight: 500;
  color: #2c3e50;
  text-transform: capitalize;
}

.pattern-count {
  font-size: 0.8rem;
  color: #6c757d;
}

.pattern-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.pattern-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: width 0.5s ease;
}

.stream-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #6c757d;
  cursor: pointer;
}

.clear-btn:hover {
  background: #f8d7da;
  border-color: #f5c6cb;
}

.event-stream {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.stream-event {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s;
}

.stream-event:hover {
  background: #f8f9fa;
}

.stream-event:last-child {
  border-bottom: none;
}

.stream-event.low-risk {
  border-left: 3px solid #28a745;
}

.stream-event.medium-risk {
  border-left: 3px solid #ffc107;
}

.stream-event.high-risk {
  border-left: 3px solid #fd7e14;
}

.stream-event.critical-risk {
  border-left: 3px solid #dc3545;
}

.event-time {
  font-size: 0.8rem;
  color: #6c757d;
  min-width: 80px;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-type {
  font-size: 0.7rem;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: bold;
  align-self: flex-start;
}

.event-summary {
  font-size: 0.9rem;
  color: #495057;
}

.event-risk {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.event-risk.low {
  background: #d4edda;
  color: #155724;
}

.event-risk.medium {
  background: #fff3cd;
  color: #856404;
}

.event-risk.high {
  background: #f8d7da;
  color: #721c24;
}

.event-risk.critical {
  background: #dc3545;
  color: white;
}

.empty-stream {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.integrity-monitor {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.integrity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f8f9fa;
}

.integrity-item:last-child {
  border-bottom: none;
}

.integrity-label {
  font-weight: 500;
  color: #495057;
}

.integrity-status {
  font-size: 1.2rem;
}

.integrity-status.verified {
  color: #28a745;
}

.integrity-value {
  color: #6c757d;
  font-size: 0.9rem;
}

.integrity-btn {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.integrity-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.integrity-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .transparency-dashboard {
    padding: 10px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: start;
  }
  
  .stream-event {
    flex-direction: column;
    align-items: start;
    gap: 8px;
  }
  
  .event-time {
    align-self: flex-end;
  }
}
</style>