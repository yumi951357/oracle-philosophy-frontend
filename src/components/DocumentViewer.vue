<template>
  <div class="document-viewer">
    <div class="view-header">
      <h1>📚 Documentation</h1>
      <p>System documentation and resources</p>
    </div>

    <div class="documents-grid">
      <div class="document-card">
        <div class="doc-icon">📄</div>
        <h3>White Paper</h3>
        <p>Technical specification and system architecture</p>
        <div class="doc-status">Coming Soon</div>
      </div>

      <div class="document-card">
        <div class="doc-icon">🔮</div>
        <h3>Ritual Manual</h3>
        <p>Usage guidelines and philosophical framework</p>
        <div class="doc-status">Coming Soon</div>
      </div>

      <div class="document-card">
        <div class="doc-icon">❓</div>
        <h3>FAQ</h3>
        <p>Frequently asked questions about the system</p>
        <div class="doc-status">Coming Soon</div>
      </div>

      <div class="document-card">
        <div class="doc-icon">🔧</div>
        <h3>API Documentation</h3>
        <p>Technical API reference and integration guide</p>
        <a href="https://oracle-philosophy-backend.onrender.com/api/health" 
           target="_blank" class="doc-link">
          View API Status →
        </a>
      </div>
    </div>

    <div class="quick-links">
      <h3>Quick Links</h3>
      <div class="links-grid">
        <router-link to="/oracle" class="quick-link">
          <span>🔮</span>
          <span>Oracle Interface</span>
        </router-link>
        <router-link to="/blockchain" class="quick-link">
          <span>⛓️</span>
          <span>Blockchain Viewer</span>
        </router-link>
        <router-link to="/dashboard" class="quick-link">
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentViewer'
}
</script>

<style scoped>
.document-viewer {
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  text-align: center;
  margin-bottom: 3rem;
}

.view-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.view-header p {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.document-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.document-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.doc-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.document-card h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.document-card p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.doc-status {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-block;
}

.doc-link {
  display: inline-block;
  background: var(--accent-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s;
}

.doc-link:hover {
  background: var(--accent-primary-dark);
}

.quick-links {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 12px;
}

.quick-links h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s;
}

.quick-link:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>