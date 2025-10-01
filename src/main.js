import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Import components
import OracleInterface from './components/OracleInterface.vue'
import BlockchainViewer from './components/BlockchainViewer.vue'
import TransparencyDashboard from './components/TransparencyDashboard.vue'
import DocumentViewer from './components/DocumentViewer.vue'

// Home component
const Home = {
  template: `
    <div class="home-page">
      <div class="hero-section">
        <div class="hero-content">
          <h1>🐍 Oracle Philosophy System</h1>
          <p class="hero-subtitle">
            Where Artificial Intelligence Meets Ancient Wisdom
          </p>
          <p class="hero-description">
            An experimental system exploring the boundaries between truth and creative expression 
            through advanced deception detection and philosophical inquiry.
          </p>
          <div class="hero-actions">
            <router-link to="/oracle" class="cta-button primary">
              🔮 Consult the Oracle
            </router-link>
            <router-link to="/docs" class="cta-button secondary">
              📚 Read Documentation
            </router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="philosophy-wheel">
            <div class="wheel-segment truth">Truth</div>
            <div class="wheel-segment deception">Deception</div>
            <div class="wheel-segment wisdom">Wisdom</div>
            <div class="wheel-segment inquiry">Inquiry</div>
            <div class="wheel-center">⚖️</div>
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2>Core Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Deception Detection</h3>
            <p>Three-layer analysis to identify potentially misleading content using keyword patterns, ML classification, and semantic grounding.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⛓️</div>
            <h3>Blockchain Transparency</h3>
            <p>Immutable audit trail of all interactions ensures complete transparency and system integrity verification.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Real-time Dashboard</h3>
            <p>Live monitoring of system behavior, risk patterns, and interaction metrics with comprehensive visualizations.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Philosophical Foundation</h3>
            <p>Built on principles of Socratic inquiry, existential philosophy, and modern transparency ethics.</p>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>Experience the System</h2>
        <div class="demo-cards">
          <router-link to="/oracle" class="demo-card">
            <div class="demo-icon">💬</div>
            <h4>Chat with Oracle</h4>
            <p>Ask profound questions and observe the system's reasoning process and deception analysis.</p>
          </router-link>
          <router-link to="/blockchain" class="demo-card">
            <div class="demo-icon">🔐</div>
            <h4>View Audit Trail</h4>
            <p>Explore the immutable blockchain record of all system interactions and verifications.</p>
          </router-link>
          <router-link to="/dashboard" class="demo-card">
            <div class="demo-icon">📈</div>
            <h4>Monitor System</h4>
            <p>Watch real-time metrics and patterns in the transparency dashboard.</p>
          </router-link>
        </div>
      </div>
    </div>
  `,
  styles: `
    .home-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      align-items: center;
      margin-bottom: 80px;
      padding: 40px 0;
    }
    
    .hero-content h1 {
      font-size: 3rem;
      color: #8a2be2;
      margin-bottom: 15px;
    }
    
    .hero-subtitle {
      font-size: 1.5rem;
      color: #6c757d;
      margin-bottom: 20px;
      font-weight: 300;
    }
    
    .hero-description {
      font-size: 1.1rem;
      line-height: 1.7;
      margin-bottom: 30px;
      color: #495057;
    }
    
    .hero-actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    
    .cta-button {
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .cta-button.primary {
      background: #8a2be2;
      color: white;
    }
    
    .cta-button.secondary {
      background: transparent;
      color: #8a2be2;
      border: 2px solid #8a2be2;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .philosophy-wheel {
      position: relative;
      width: 300px;
      height: 300px;
      margin: 0 auto;
    }
    
    .wheel-segment {
      position: absolute;
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      border-radius: 8px;
      transform-origin: center;
    }
    
    .wheel-segment.truth {
      top: 0;
      left: 80px;
      background: #d4edda;
      color: #155724;
    }
    
    .wheel-segment.deception {
      top: 80px;
      right: 0;
      background: #f8d7da;
      color: #721c24;
    }
    
    .wheel-segment.wisdom {
      bottom: 0;
      left: 80px;
      background: #fff3cd;
      color: #856404;
    }
    
    .wheel-segment.inquiry {
      top: 80px;
      left: 0;
      background: #d1ecf1;
      color: #0c5460;
    }
    
    .wheel-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      background: white;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .features-section {
      margin-bottom: 80px;
    }
    
    .features-section h2 {
      text-align: center;
      margin-bottom: 40px;
      color: #2c3e50;
      font-size: 2.5rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
    }
    
    .feature-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    
    .feature-card h3 {
      color: #2c3e50;
      margin-bottom: 15px;
    }
    
    .feature-card p {
      color: #6c757d;
      line-height: 1.6;
    }
    
    .demo-section h2 {
      text-align: center;
      margin-bottom: 40px;
      color: #2c3e50;
      font-size: 2.5rem;
    }
    
    .demo-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }
    
    .demo-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-decoration: none;
      color: inherit;
      transition: all 0.3s;
      border: 2px solid transparent;
    }
    
    .demo-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 25px rgba(0,0,0,0.15);
      border-color: #8a2be2;
    }
    
    .demo-icon {
      font-size: 2.5rem;
      margin-bottom: 15px;
    }
    
    .demo-card h4 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    
    .demo-card p {
      color: #6c757d;
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
      .hero-section {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 30px;
      }
      
      .hero-content h1 {
        font-size: 2.2rem;
      }
      
      .hero-subtitle {
        font-size: 1.2rem;
      }
      
      .hero-actions {
        justify-content: center;
      }
      
      .philosophy-wheel {
        width: 250px;
        height: 250px;
      }
      
      .wheel-segment {
        width: 110px;
        height: 110px;
        font-size: 0.9rem;
      }
    }
  `
}

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/oracle', component: OracleInterface },
    { path: '/blockchain', component: BlockchainViewer },
    { path: '/dashboard', component: TransparencyDashboard },
    { path: '/docs', component: DocumentViewer }
  ]
})

// Create and mount app
const app = createApp(App)
app.use(router)
app.mount('#app')