<template>
  <div class="document-viewer">
    <!-- Header -->
    <div class="viewer-header">
      <h2>📚 System Documentation</h2>
      <p>Philosophical foundations and technical specifications</p>
    </div>

    <!-- Navigation -->
    <div class="doc-navigation">
      <div class="nav-tabs">
        <button 
          v-for="doc in documents" 
          :key="doc.id"
          :class="{ active: activeDoc.id === doc.id }"
          @click="selectDocument(doc)"
          class="nav-tab"
        >
          {{ doc.icon }} {{ doc.title }}
        </button>
      </div>
      
      <div class="nav-controls">
        <button @click="toggleTheme" class="control-btn theme-btn">
          {{ isDarkTheme ? '☀️ Light' : '🌙 Dark' }}
        </button>
        <button @click="printDocument" class="control-btn print-btn">
          🖨️ Print
        </button>
        <button @click="downloadDocument" class="control-btn download-btn">
          📥 Download
        </button>
      </div>
    </div>

    <!-- Document Content -->
    <div class="document-content" :class="{ 'dark-theme': isDarkTheme }">
      <div class="doc-header">
        <h1>{{ activeDoc.title }}</h1>
        <div class="doc-meta">
          <span class="version">Version: {{ activeDoc.version }}</span>
          <span class="last-updated">Last updated: {{ activeDoc.lastUpdated }}</span>
        </div>
      </div>

      <div class="doc-body">
        <component :is="activeDoc.component" />
      </div>
    </div>

    <!-- Table of Contents -->
    <div class="toc-sidebar" :class="{ 'visible': showToc }">
      <div class="toc-header">
        <h4>Table of Contents</h4>
        <button @click="showToc = false" class="close-toc">×</button>
      </div>
      <div class="toc-content">
        <div 
          v-for="section in activeDoc.toc" 
          :key="section.id"
          class="toc-item"
          :class="{ 'active': activeSection === section.id }"
          @click="scrollToSection(section.id)"
        >
          {{ section.title }}
        </div>
      </div>
    </div>

    <!-- Floating Controls -->
    <div class="floating-controls">
      <button @click="showToc = !showToc" class="floating-btn toc-btn">
        📑
      </button>
      <button @click="scrollToTop" class="floating-btn top-btn">
        ↑
      </button>
    </div>
  </div>
</template>

<script>
// Document components
const WhitepaperContent = {
  template: `
    <div class="whitepaper">
      <section id="abstract" class="doc-section">
        <h2>Abstract</h2>
        <p>The Oracle Philosophy System represents a groundbreaking approach to AI transparency, combining philosophical inquiry with advanced deception detection mechanisms. This system explores the boundaries between truth and creative expression in artificial intelligence.</p>
      </section>

      <section id="introduction" class="doc-section">
        <h2>Introduction</h2>
        <p>In an era of increasingly sophisticated AI systems, the need for transparency and ethical oversight has never been more critical. The Oracle Philosophy System addresses this need through a multi-layered approach to content verification and deception awareness.</p>
        
        <h3>Core Philosophy</h3>
        <p>We believe that AI systems should not merely provide answers, but should also reveal their reasoning processes and acknowledge uncertainty. This aligns with philosophical traditions that value the journey of inquiry as much as the destination of knowledge.</p>
      </section>

      <section id="architecture" class="doc-section">
        <h2>System Architecture</h2>
        
        <h3>Three-Layer Deception Detection</h3>
        <div class="architecture-diagram">
          <div class="layer">
            <h4>Layer 1: Keyword Analysis</h4>
            <p>Real-time pattern matching against known deceptive language patterns</p>
          </div>
          <div class="layer">
            <h4>Layer 2: ML Classification</h4>
            <p>Machine learning models trained to identify deceptive phrasing characteristics</p>
          </div>
          <div class="layer">
            <h4>Layer 3: Semantic Grounding</h4>
            <p>Comparison against verified knowledge sources for factual accuracy</p>
          </div>
        </div>

        <h3>Blockchain Integration</h3>
        <p>All system interactions are recorded in an immutable blockchain-style ledger, ensuring complete auditability and transparency.</p>
      </section>

      <section id="ethics" class="doc-section">
        <h2>Ethical Framework</h2>
        <p>Our system operates under the following ethical principles:</p>
        <ul>
          <li><strong>Transparency First:</strong> All AI reasoning should be explainable and verifiable</li>
          <li><strong>User Empowerment:</strong> Users should understand when they're receiving creative vs factual responses</li>
          <li><strong>Continuous Improvement:</strong> The system learns from user feedback to improve detection accuracy</li>
          <li><strong>Privacy Protection:</strong> User data is anonymized and protected throughout the process</li>
        </ul>
      </section>
    </div>
  `
};

const RitualsContent = {
  template: `
    <div class="rituals">
      <section id="purpose" class="doc-section">
        <h2>Purpose of Rituals</h2>
        <p>The ritual system serves as a metaphorical framework for understanding AI behavior and decision-making processes. These "rituals" represent different modes of operation and interaction patterns.</p>
      </section>

      <section id="truth-ritual" class="doc-section">
        <h2>Truth-Seeking Ritual</h2>
        <h3>Activation Conditions</h3>
        <ul>
          <li>Low deception risk detected</li>
          <li>Philosophical or factual questions</li>
          <li>User requests verifiable information</li>
        </ul>

        <h3>Behavior Patterns</h3>
        <p>In this mode, the system prioritizes factual accuracy, cites sources when available, and acknowledges uncertainty where appropriate.</p>
      </section>

      <section id="creative-ritual" class="doc-section">
        <h2>Creative Expression Ritual</h2>
        <h3>Activation Conditions</h3>
        <ul>
          <li>High deception risk detected</li>
          <li>Requests for predictions or absolute certainty</li>
          <li>Exploratory or imaginative queries</li>
        </ul>

        <h3>Behavior Patterns</h3>
        <p>This ritual allows for poetic, metaphorical responses while clearly marking them as creative expressions rather than factual statements.</p>
      </section>

      <section id="reflection-ritual" class="doc-section">
        <h2>User Reflection Ritual</h2>
        <p>This ritual captures moments where users engage in deep self-reflection, using these insights to improve the system's understanding of human inquiry.</p>
      </section>
    </div>
  `
};

const FAQContent = {
  template: `
    <div class="faq">
      <section id="general" class="doc-section">
        <h2>General Questions</h2>

        <div class="faq-item">
          <h3>What is the Oracle Philosophy System?</h3>
          <p>It's an experimental AI system that combines philosophical inquiry with advanced deception detection to explore the boundaries between truth and creative expression in artificial intelligence.</p>
        </div>

        <div class="faq-item">
          <h3>How does the deception detection work?</h3>
          <p>We use a three-layer approach: keyword pattern matching, machine learning classification, and semantic analysis against verified knowledge sources.</p>
        </div>

        <div class="faq-item">
          <h3>Is my data safe?</h3>
          <p>Yes, all user interactions are anonymized and protected. We only store necessary metadata for system improvement and transparency.</p>
        </div>
      </section>

      <section id="technical" class="doc-section">
        <h2>Technical Questions</h2>

        <div class="faq-item">
          <h3>What technology stack is used?</h3>
          <p>Backend: Python/Flask with scikit-learn and sentence transformers. Frontend: Vue.js with Chart.js for visualizations.</p>
        </div>

        <div class="faq-item">
          <h3>How is the blockchain implemented?</h3>
          <p>We use a blockchain-like structure with cryptographic hashing for immutability, but it's currently implemented as a local ledger rather than a distributed blockchain.</p>
        </div>

        <div class="faq-item">
          <h3>Can I verify the system's integrity?</h3>
          <p>Yes, the transparency dashboard allows you to verify the blockchain integrity and view all system interactions.</p>
        </div>
      </section>

      <section id="philosophy" class="doc-section">
        <h2>Philosophical Questions</h2>

        <div class="faq-item">
          <h3>What is the philosophical basis of this system?</h3>
          <p>We draw from Socratic inquiry, existential philosophy, and modern transparency ethics to create a system that values the process of questioning as much as the answers.</p>
        </div>

        <div class="faq-item">
          <h3>Why include deception in an AI system?</h3>
          <p>We don't promote deception - we detect it and make it transparent. This helps users understand when they're receiving creative vs factual responses.</p>
        </div>
      </section>
    </div>
  `
};

export default {
  name: 'DocumentViewer',
  components: {
    WhitepaperContent,
    RitualsContent,
    FAQContent
  },
  data() {
    return {
      activeDoc: null,
      activeSection: null,
      showToc: false,
      isDarkTheme: false,
      documents: [
        {
          id: 'whitepaper',
          title: 'Technical Whitepaper',
          icon: '📄',
          version: '2.1.0',
          lastUpdated: '2024-01-15',
          component: 'WhitepaperContent',
          toc: [
            { id: 'abstract', title: 'Abstract' },
            { id: 'introduction', title: 'Introduction' },
            { id: 'architecture', title: 'System Architecture' },
            { id: 'ethics', title: 'Ethical Framework' }
          ]
        },
        {
          id: 'rituals',
          title: 'Ritual Handbook',
          icon: '🔮',
          version: '1.0.0',
          lastUpdated: '2024-01-10',
          component: 'RitualsContent',
          toc: [
            { id: 'purpose', title: 'Purpose of Rituals' },
            { id: 'truth-ritual', title: 'Truth-Seeking Ritual' },
            { id: 'creative-ritual', title: 'Creative Expression Ritual' },
            { id: 'reflection-ritual', title: 'User Reflection Ritual' }
          ]
        },
        {
          id: 'faq',
          title: 'FAQ & Guide',
          icon: '❓',
          version: '1.2.0',
          lastUpdated: '2024-01-12',
          component: 'FAQContent',
          toc: [
            { id: 'general', title: 'General Questions' },
            { id: 'technical', title: 'Technical Questions' },
            { id: 'philosophy', title: 'Philosophical Questions' }
          ]
        }
      ]
    };
  },
  mounted() {
    this.selectDocument(this.documents[0]);
    this.setupScrollSpy();
  },
  methods: {
    selectDocument(doc) {
      this.activeDoc = doc;
      this.activeSection = doc.toc[0]?.id;
      this.showToc = false;
      this.scrollToTop();
    },
    
    setupScrollSpy() {
      window.addEventListener('scroll', this.handleScroll);
    },
    
    handleScroll() {
      if (!this.activeDoc) return;
      
      const sections = this.activeDoc.toc.map(item => 
        document.getElementById(item.id)
      ).filter(Boolean);
      
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollPosition) {
          this.activeSection = this.activeDoc.toc[i].id;
          break;
        }
      }
    },
    
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        this.activeSection = sectionId;
      }
    },
    
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
    },
    
    printDocument() {
      window.print();
    },
    
    downloadDocument() {
      const content = this.activeDoc.title + '\n\n';
      // In a real implementation, this would generate a proper document
      alert(`Download functionality would export: ${this.activeDoc.title}`);
    }
  },
  
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
.document-viewer {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.viewer-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #8a2be2;
  padding-bottom: 20px;
}

.viewer-header h2 {
  color: #8a2be2;
  margin-bottom: 10px;
}

.doc-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.nav-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-tab {
  padding: 12px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.nav-tab:hover {
  border-color: #8a2be2;
  transform: translateY(-2px);
}

.nav-tab.active {
  background: #8a2be2;
  color: white;
  border-color: #8a2be2;
}

.nav-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  transform: translateY(-1px);
}

.theme-btn:hover {
  background: #f8f9fa;
}

.print-btn:hover {
  background: #d1ecf1;
  border-color: #bee5eb;
}

.download-btn:hover {
  background: #d4edda;
  border-color: #c3e6cb;
}

.document-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 40px;
  min-height: 600px;
  transition: all 0.3s;
}

.document-content.dark-theme {
  background: #1a1a1a;
  color: #e0e0e0;
}

.doc-header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 30px;
}

.dark-theme .doc-header {
  border-bottom-color: #333;
}

.doc-header h1 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 2.5rem;
}

.dark-theme .doc-header h1 {
  color: #e0e0e0;
}

.doc-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #6c757d;
  font-size: 0.9rem;
}

.dark-theme .doc-meta {
  color: #999;
}

.doc-body {
  line-height: 1.7;
  font-size: 1.1rem;
}

.doc-section {
  margin-bottom: 50px;
}

.doc-section h2 {
  color: #8a2be2;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.dark-theme .doc-section h2 {
  color: #bb86fc;
  border-bottom-color: #333;
}

.doc-section h3 {
  color: #2c3e50;
  margin: 25px 0 15px 0;
}

.dark-theme .doc-section h3 {
  color: #e0e0e0;
}

.doc-section h4 {
  color: #495057;
  margin: 20px 0 10px 0;
}

.dark-theme .doc-section h4 {
  color: #ccc;
}

.doc-section p {
  margin-bottom: 15px;
  text-align: justify;
}

.doc-section ul {
  margin: 15px 0;
  padding-left: 20px;
}

.doc-section li {
  margin-bottom: 8px;
}

.architecture-diagram {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 25px 0;
}

.layer {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #8a2be2;
}

.dark-theme .layer {
  background: #2d2d2d;
  border-left-color: #bb86fc;
}

.layer h4 {
  margin-top: 0;
  color: #8a2be2;
}

.dark-theme .layer h4 {
  color: #bb86fc;
}

.faq-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #28a745;
}

.dark-theme .faq-item {
  background: #2d2d2d;
  border-left-color: #03dac6;
}

.faq-item h3 {
  margin-top: 0;
  color: #2c3e50;
}

.dark-theme .faq-item h3 {
  color: #e0e0e0;
}

.toc-sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 280px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  transition: right 0.3s;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.toc-sidebar.visible {
  right: 0;
}

.dark-theme .toc-sidebar {
  background: #1a1a1a;
  color: #e0e0e0;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.dark-theme .toc-header {
  border-bottom-color: #333;
}

.toc-header h4 {
  margin: 0;
  color: #2c3e50;
}

.dark-theme .toc-header h4 {
  color: #e0e0e0;
}

.close-toc {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close-toc:hover {
  color: #dc3545;
}

.toc-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px 0;
}

.toc-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.toc-item:hover {
  background: #f8f9fa;
  border-left-color: #8a2be2;
}

.dark-theme .toc-item:hover {
  background: #2d2d2d;
  border-left-color: #bb86fc;
}

.toc-item.active {
  background: #8a2be2;
  color: white;
  border-left-color: #7b1fa2;
}

.dark-theme .toc-item.active {
  background: #bb86fc;
  color: #1a1a1a;
}

.floating-controls {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 999;
}

.floating-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #8a2be2;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-btn:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

.toc-btn {
  background: #8a2be2;
}

.top-btn {
  background: #6c757d;
}

@media (max-width: 768px) {
  .document-viewer {
    padding: 10px;
  }
  
  .doc-navigation {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nav-tabs {
    justify-content: center;
  }
  
  .nav-controls {
    justify-content: center;
  }
  
  .document-content {
    padding: 20px;
  }
  
  .doc-header h1 {
    font-size: 2rem;
  }
  
  .doc-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .toc-sidebar {
    width: 100%;
    right: -100%;
  }
  
  .floating-controls {
    bottom: 20px;
    right: 20px;
  }
  
  .floating-btn {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }
}

@media print {
  .doc-navigation,
  .toc-sidebar,
  .floating-controls {
    display: none;
  }
  
  .document-content {
    box-shadow: none;
    padding: 0;
  }
}
</style>