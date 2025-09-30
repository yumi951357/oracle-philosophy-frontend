<template>
  <div id="app" :class="theme">
    <!-- Navigation Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="logo">🐍 Oracle Philosophy</h1>
          <span class="version">v2.1.0</span>
        </div>
        
        <nav class="main-nav">
          <router-link 
            v-for="route in routes" 
            :key="route.path"
            :to="route.path"
            class="nav-link"
            :class="{ active: $route.path === route.path }"
          >
            {{ route.icon }} {{ route.name }}
          </router-link>
        </nav>
        
        <div class="header-controls">
          <button @click="toggleTheme" class="theme-toggle">
            {{ isDarkTheme ? '☀️' : '🌙' }}
          </button>
          <button @click="showAbout" class="about-btn">
            ℹ️ About
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Oracle Philosophy System</h4>
          <p>Exploring the boundaries between truth and creative expression in AI</p>
        </div>
        
        <div class="footer-section">
          <h4>Connect</h4>
          <div class="social-links">
            <a href="#" class="social-link">📧 Email</a>
            <a href="#" class="social-link">🐙 GitHub</a>
            <a href="#" class="social-link">📖 Documentation</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>System Status</h4>
          <div class="status-indicators">
            <span class="status-item" :class="apiStatus">
              API: {{ apiStatus === 'online' ? '🟢 Online' : '🔴 Offline' }}
            </span>
            <span class="status-item">
              Blockchain: ✅ Verified
            </span>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 Oracle Philosophy System. Open source research project.</p>
      </div>
    </footer>

    <!-- About Modal -->
    <div v-if="showAboutModal" class="modal-overlay" @click="hideAbout">
      <div class="modal-content about-modal" @click.stop>
        <div class="modal-header">
          <h2>About Oracle Philosophy System</h2>
          <button @click="hideAbout" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="about-content">
            <div class="about-section">
              <h3>🎯 Mission</h3>
              <p>To create AI systems that are transparent about their reasoning processes and honest about their limitations.</p>
            </div>
            
            <div class="about-section">
              <h3>🔧 Technology</h3>
              <ul>
                <li>Three-layer deception detection engine</li>
                <li>Blockchain-style immutable audit logs</li>
                <li>Real-time transparency dashboard</li>
                <li>Philosophical response generation</li>
              </ul>
            </div>
            
            <div class="about-section">
              <h3>📜 Philosophy</h3>
              <p>We believe that the journey of inquiry is as valuable as the destination of knowledge. Our system embraces uncertainty and celebrates the process of questioning.</p>
            </div>
            
            <div class="about-section">
              <h3>👥 Team</h3>
              <p>This is an open-source research project developed by philosophers, AI researchers, and software engineers committed to AI transparency.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import oracleAPI from './utils/api.js'

export default {
  name: 'App',
  components: {
    RouterLink,
    RouterView
  },
  data() {
    return {
      isDarkTheme: false,
      showAboutModal: false,
      apiStatus: 'checking',
      routes: [
        { path: '/', name: 'Home', icon: '🏠' },
        { path: '/oracle', name: 'Oracle', icon: '🔮' },
        { path: '/blockchain', name: 'Blockchain', icon: '⛓️' },
        { path: '/dashboard', name: 'Dashboard', icon: '📊' },
        { path: '/docs', name: 'Documentation', icon: '📚' }
      ]
    }
  },
  computed: {
    theme() {
      return this.isDarkTheme ? 'dark-theme' : 'light-theme'
    }
  },
  async mounted() {
    await this.checkApiStatus()
    this.loadThemePreference()
  },
  methods: {
    async checkApiStatus() {
      try {
        await oracleAPI.healthCheck()
        this.apiStatus = 'online'
      } catch (error) {
        this.apiStatus = 'offline'
      }
    },
    
    loadThemePreference() {
      const savedTheme = localStorage.getItem('oracle-theme')
      this.isDarkTheme = savedTheme === 'dark'
    },
    
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      localStorage.setItem('oracle-theme', this.isDarkTheme ? 'dark' : 'light')
    },
    
    showAbout() {
      this.showAboutModal = true
    },
    
    hideAbout() {
      this.showAboutModal = false
    }
  }
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background: #f8f9fa;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app.dark-theme {
  background: #121212;
  color: #e0e0e0;
}

/* Header Styles */
.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.dark-theme .app-header {
  background: #1e1e1e;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  color: #8a2be2;
  font-size: 1.5rem;
  font-weight: bold;
}

.dark-theme .logo {
  color: #bb86fc;
}

.version {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  color: #6c757d;
}

.dark-theme .version {
  background: #333;
  color: #999;
}

.main-nav {
  display: flex;
  gap: 5px;
}

.nav-link {
  padding: 10px 20px;
  text-decoration: none;
  color: #6c757d;
  border-radius: 20px;
  transition: all 0.3s;
  font-weight: 500;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #8a2be2;
  transform: translateY(-1px);
}

.dark-theme .nav-link:hover {
  background: #2d2d2d;
  color: #bb86fc;
}

.nav-link.active {
  background: #8a2be2;
  color: white;
}

.dark-theme .nav-link.active {
  background: #bb86fc;
  color: #1e1e1e;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.theme-toggle, .about-btn {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-theme .theme-toggle,
.dark-theme .about-btn {
  background: #2d2d2d;
  border-color: #444;
  color: #e0e0e0;
}

.theme-toggle:hover, .about-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Main Content */
.app-main {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Footer Styles */
.app-footer {
  background: #2c3e50;
  color: white;
  margin-top: auto;
}

.dark-theme .app-footer {
  background: #1a1a1a;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer-section h4 {
  margin-bottom: 15px;
  color: #8a2be2;
}

.dark-theme .footer-section h4 {
  color: #bb86fc;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.social-link {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.2s;
}

.social-link:hover {
  color: #8a2be2;
}

.dark-theme .social-link:hover {
  color: #bb86fc;
}

.status-indicators {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-item {
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.1);
}

.status-item.online {
  color: #28a745;
}

.status-item.offline {
  color: #dc3545;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding: 20px;
  text-align: center;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.dark-theme .footer-bottom {
  border-top-color: #333;
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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.dark-theme .modal-content {
  background: #1e1e1e;
  color: #e0e0e0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #e9ecef;
}

.dark-theme .modal-header {
  border-bottom-color: #333;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.dark-theme .modal-header h2 {
  color: #e0e0e0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.dark-theme .close-btn:hover {
  background: #333;
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.about-section h3 {
  color: #8a2be2;
  margin-bottom: 10px;
}

.dark-theme .about-section h3 {
  color: #bb86fc;
}

.about-section ul {
  padding-left: 20px;
}

.about-section li {
  margin-bottom: 5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
    gap: 15px;
  }
  
  .main-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .nav-link {
    padding: 8px 15px;
    font-size: 0.9rem;
  }
  
  .app-main {
    padding: 10px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header,
  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.2rem;
  }
  
  .main-nav {
    gap: 2px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>