<template>
  <div class="blockchain-viewer">
    <!-- Header -->
    <div class="viewer-header">
      <h2>⛓️ Blockchain Ethics Ledger</h2>
      <p>Immutable audit trail of all oracle interactions</p>
      
      <div class="ledger-info">
        <div class="info-item">
          <span class="label">Chain ID:</span>
          <span class="value">{{ chainMetadata.chain_id }}</span>
        </div>
        <div class="info-item">
          <span class="label">Total Events:</span>
          <span class="value">{{ chainMetadata.total_events }}</span>
        </div>
        <div class="info-item">
          <span class="label">Head Hash:</span>
          <span class="hash-value">{{ chainMetadata.head_hash ? chainMetadata.head_hash.substring(0, 16) + '...' : 'Loading...' }}</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-section">
      <div class="filter-controls">
        <div class="filter-group">
          <label>Risk Level:</label>
          <div class="filter-buttons">
            <button 
              v-for="bucket in riskBuckets" 
              :key="bucket.value"
              :class="{ active: filters.riskBucket.includes(bucket.value) }"
              @click="toggleRiskFilter(bucket.value)"
              class="filter-btn"
              :style="{ backgroundColor: bucket.color }"
            >
              {{ bucket.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>Event Type:</label>
          <div class="filter-buttons">
            <button 
              v-for="type in eventTypes" 
              :key="type.value"
              :class="{ active: filters.type.includes(type.value) }"
              @click="toggleTypeFilter(type.value)"
              class="filter-btn"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="action-controls">
        <button @click="verifyChain" :disabled="verifying" class="action-btn verify-btn">
          {{ verifying ? '🔄 Verifying...' : '🔍 Verify Integrity' }}
        </button>
        <button @click="exportData" class="action-btn export-btn">
          📤 Export Data
        </button>
        <button @click="refreshData" :disabled="loading" class="action-btn refresh-btn">
          {{ loading ? '🔄 Loading...' : '🔄 Refresh' }}
        </button>
      </div>
    </div>

    <!-- Verification Result -->
    <div v-if="verificationResult" class="verification-result" :class="{ verified: verificationResult.verified }">
      <div class="verification-header">
        <span class="verification-icon">
          {{ verificationResult.verified ? '✅' : '❌' }}
        </span>
        <span class="verification-text">
          Chain Integrity: {{ verificationResult.verified ? 'VERIFIED' : 'COMPROMISED' }}
        </span>
      </div>
      <div class="verification-details">
        <span>Events Checked: {{ verificationResult.total_events_checked }}</span>
        <span v-if="!verificationResult.verified" class="integrity-issues">
          Issues: {{ verificationResult.integrity_issues.length }}
        </span>
      </div>
    </div>

    <!-- Events Timeline -->
    <div class="events-timeline">
      <h3>Event Timeline ({{ filteredEvents.length }} events)</h3>
      
      <div v-if="filteredEvents.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No events match the current filters</p>
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>

      <div v-else class="timeline">
        <div 
          v-for="(event, index) in paginatedEvents" 
          :key="event.id"
          class="timeline-item"
          :class="getEventClass(event)"
        >
          <div class="timeline-connector" v-if="index > 0"></div>
          
          <div class="event-card">
            <!-- Event Header -->
            <div class="event-header">
              <div class="event-id">
                <span class="hash-badge">{{ event.id }}</span>
              </div>
              <div class="event-meta">
                <span class="timestamp">{{ formatTimestamp(event.timestamp) }}</span>
                <span class="event-type" :class="event.payload.type">
                  {{ event.payload.type }}
                </span>
              </div>
            </div>

            <!-- Event Content -->
            <div class="event-content">
              <div class="content-summary">
                {{ event.payload.content_summary }}
              </div>
              
              <div class="event-details">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Actor:</span>
                    <span class="detail-value">{{ event.actor.user_id }} ({{ event.actor.role }})</span>
                  </div>
                  
                  <div v-if="event.payload.entropy !== undefined" class="detail-item">
                    <span class="detail-label">Entropy:</span>
                    <span class="detail-value">{{ event.payload.entropy.toFixed(3) }}</span>
                  </div>
                  
                  <div v-if="event.payload.deception_risk !== undefined" class="detail-item">
                    <span class="detail-label">Deception Risk:</span>
                    <span class="detail-value risk-badge" :class="getRiskClass(event.payload.deception_risk)">
                      {{ (event.payload.deception_risk * 100).toFixed(1) }}%
                    </span>
                  </div>
                  
                  <div v-if="event.payload.risk_bucket" class="detail-item">
                    <span class="detail-label">Risk Bucket:</span>
                    <span class="detail-value risk-bucket" :class="event.payload.risk_bucket">
                      {{ event.payload.risk_bucket.toUpperCase() }}
                    </span>
                  </div>
                </div>

                <!-- Hash Information -->
                <div class="hash-info">
                  <div class="hash-item">
                    <span class="hash-label">Prev Hash:</span>
                    <span class="hash-value">{{ event.prev_hash.substring(0, 16) }}...</span>
                  </div>
                  <div class="hash-item">
                    <span class="hash-label">Event Hash:</span>
                    <span class="hash-value">{{ event.hash.substring(0, 16) }}...</span>
                  </div>
                  <div class="hash-item">
                    <span class="hash-label">Content Hash:</span>
                    <span class="hash-value">{{ event.payload.content_hash.substring(0, 16) }}...</span>
                  </div>
                </div>

                <!-- Matched Patterns -->
                <div v-if="event.payload.matched_patterns && event.payload.matched_patterns.length" class="matched-patterns">
                  <strong>Matched Patterns:</strong>
                  <div class="pattern-tags">
                    <span 
                      v-for="pattern in event.payload.matched_patterns" 
                      :key="pattern"
                      class="pattern-tag"
                    >
                      {{ pattern }}
                    </span>
                  </div>
                </div>

                <!-- Deception Scores -->
                <div v-if="event.payload.deception_scores" class="deception-scores">
                  <div class="scores-grid">
                    <div class="score-item">
                      <span class="score-label">Keyword:</span>
                      <span class="score-value">{{ event.payload.deception_scores.keyword_score.toFixed(3) }}</span>
                    </div>
                    <div class="score-item">
                      <span class="score-label">ML:</span>
                      <span class="score-value">{{ event.payload.deception_scores.ml_score.toFixed(3) }}</span>
                    </div>
                    <div class="score-item">
                      <span class="score-label">Semantic:</span>
                      <span class="score-value">{{ event.payload.deception_scores.semantic_confidence.toFixed(3) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Event Actions -->
            <div class="event-actions">
              <button @click="viewEventDetails(event)" class="action-btn details-btn">
                🔍 Details
              </button>
              <button @click="verifySingleEvent(event)" class="action-btn verify-event-btn">
                ✅ Verify
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredEvents.length > pageSize" class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ← Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <div v-if="selectedEvent" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Event Details</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <pre class="event-json">{{ JSON.stringify(selectedEvent, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import oracleAPI from '../utils/api.js';

export default {
  name: 'BlockchainViewer',
  data() {
    return {
      events: [],
      filteredEvents: [],
      chainMetadata: {},
      loading: false,
      verifying: false,
      verificationResult: null,
      filters: {
        riskBucket: [],
        type: []
      },
      selectedEvent: null,
      currentPage: 1,
      pageSize: 20,
      riskBuckets: [
        { value: 'low', label: 'Low', color: '#d4edda' },
        { value: 'medium', label: 'Medium', color: '#fff3cd' },
        { value: 'high', label: 'High', color: '#f8d7da' },
        { value: 'critical', label: 'Critical', color: '#dc3545' }
      ],
      eventTypes: [
        { value: 'narrative', label: 'Narrative' },
        { value: 'deception_injection', label: 'Deception' },
        { value: 'system', label: 'System' }
      ]
    };
  },
  computed: {
    paginatedEvents() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredEvents.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredEvents.length / this.pageSize);
    }
  },
  async mounted() {
    await this.loadData();
  },
  watch: {
    filters: {
      handler: 'applyFilters',
      deep: true
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const response = await oracleAPI.getEvents();
        this.events = response.events || [];
        this.chainMetadata = response.chain_metadata || {};
        this.applyFilters();
      } catch (error) {
        console.error('Failed to load events:', error);
        this.events = [];
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      this.filteredEvents = this.events.filter(event => {
        const payload = event.payload || {};
        
        // Risk bucket filter
        if (this.filters.riskBucket.length > 0 && 
            !this.filters.riskBucket.includes(payload.risk_bucket)) {
          return false;
        }
        
        // Type filter
        if (this.filters.type.length > 0 && 
            !this.filters.type.includes(payload.type)) {
          return false;
        }
        
        return true;
      });
      
      this.currentPage = 1; // Reset to first page when filters change
    },
    
    toggleRiskFilter(bucket) {
      const index = this.filters.riskBucket.indexOf(bucket);
      if (index > -1) {
        this.filters.riskBucket.splice(index, 1);
      } else {
        this.filters.riskBucket.push(bucket);
      }
    },
    
    toggleTypeFilter(type) {
      const index = this.filters.type.indexOf(type);
      if (index > -1) {
        this.filters.type.splice(index, 1);
      } else {
        this.filters.type.push(type);
      }
    },
    
    clearFilters() {
      this.filters = {
        riskBucket: [],
        type: []
      };
    },
    
    async verifyChain() {
      this.verifying = true;
      try {
        this.verificationResult = await oracleAPI.verifyLedger();
      } catch (error) {
        console.error('Verification failed:', error);
        this.verificationResult = {
          verified: false,
          error: error.message
        };
      } finally {
        this.verifying = false;
      }
    },
    
    async verifySingleEvent(event) {
      // In a real implementation, this would verify the specific event
      alert(`Event ${event.id} verification would be performed here.`);
    },
    
    viewEventDetails(event) {
      this.selectedEvent = event;
    },
    
    closeModal() {
      this.selectedEvent = null;
    },
    
    exportData() {
      const data = {
        chain_metadata: this.chainMetadata,
        events: this.filteredEvents,
        export_timestamp: new Date().toISOString(),
        total_events: this.filteredEvents.length
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `oracle-ledger-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    
    async refreshData() {
      await this.loadData();
    },
    
    getEventClass(event) {
      const payload = event.payload || {};
      return {
        [payload.type]: true,
        [`risk-${payload.risk_bucket}`]: payload.risk_bucket
      };
    },
    
    getRiskClass(risk) {
      if (risk < 0.25) return 'low';
      if (risk < 0.5) return 'medium';
      if (risk < 0.75) return 'high';
      return 'critical';
    },
    
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  }
};
</script>

<style scoped>
.blockchain-viewer {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.viewer-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 20px;
}

.ledger-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.value {
  font-weight: bold;
  color: #2c3e50;
}

.hash-value {
  font-family: monospace;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 30px;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.filter-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.filter-btn:hover {
  transform: translateY(-1px);
}

.action-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verify-btn:hover {
  background: #d4edda;
  border-color: #c3e6cb;
}

.export-btn:hover {
  background: #d1ecf1;
  border-color: #bee5eb;
}

.refresh-btn:hover {
  background: #e2e3e5;
  border-color: #d6d8db;
}

.verification-result {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid;
}

.verification-result.verified {
  background: #d4edda;
  border-left-color: #28a745;
  color: #155724;
}

.verification-result:not(.verified) {
  background: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

.verification-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.verification-text {
  font-weight: bold;
}

.verification-details {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
}

.integrity-issues {
  color: #dc3545;
  font-weight: bold;
}

.events-timeline {
  margin-top: 30px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.clear-filters-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.timeline {
  position: relative;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-connector {
  position: absolute;
  left: 30px;
  top: -10px;
  width: 2px;
  height: 20px;
  background: #e9ecef;
  z-index: 1;
}

.event-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 2;
}

.event-card.narrative {
  border-left: 4px solid #3498db;
}

.event-card.deception_injection {
  border-left: 4px solid #e74c3c;
}

.event-card.system {
  border-left: 4px solid #95a5a6;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.hash-badge {
  font-family: monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #495057;
}

.event-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.timestamp {
  font-size: 0.8rem;
  color: #6c757d;
}

.event-type {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.event-type.narrative {
  background: #d6eaf8;
  color: #2c3e50;
}

.event-type.deception_injection {
  background: #fadbd8;
  color: #c0392b;
}

.event-type.system {
  background: #ebedef;
  color: #566573;
}

.content-summary {
  font-weight: 500;
  margin-bottom: 15px;
  color: #2c3e50;
}

.event-details {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.detail-label {
  font-weight: bold;
  color: #495057;
  font-size: 0.9rem;
}

.detail-value {
  color: #6c757d;
  font-size: 0.9rem;
}

.risk-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.8rem;
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

.risk-bucket {
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.risk-bucket.low {
  background: #d4edda;
  color: #155724;
}

.risk-bucket.medium {
  background: #fff3cd;
  color: #856404;
}

.risk-bucket.high {
  background: #f8d7da;
  color: #721c24;
}

.risk-bucket.critical {
  background: #dc3545;
  color: white;
}

.hash-info {
  border-top: 1px solid #dee2e6;
  padding-top: 10px;
  margin-bottom: 15px;
}

.hash-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-family: monospace;
  font-size: 0.8rem;
}

.hash-label {
  color: #495057;
}

.matched-patterns {
  margin: 10px 0;
}

.pattern-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.pattern-tag {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  color: #495057;
}

.deception-scores {
  border-top: 1px solid #dee2e6;
  padding-top: 10px;
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.score-label {
  color: #495057;
}

.score-value {
  font-weight: bold;
  color: #2c3e50;
}

.event-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.details-btn:hover {
  background: #d1ecf1;
  border-color: #bee5eb;
}

.verify-event-btn:hover {
  background: #d4edda;
  border-color: #c3e6cb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: bold;
  color: #495057;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #dc3545;
}

.modal-body {
  padding: 20px;
  overflow: auto;
  max-height: calc(90vh - 80px);
}

.event-json {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .blockchain-viewer {
    padding: 10px;
  }
  
  .controls-section {
    flex-direction: column;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .event-header {
    flex-direction: column;
    align-items: start;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .scores-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}
</style>