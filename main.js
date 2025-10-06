// ===== CONFIG =====
const BACKEND_URL = "https://oracle-philosophy-backend.onrender.com";

// ===== MOBILE INITIALIZATION =====
function initMobileFeatures() {
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mobileMenuToggle.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mainNav.classList.remove('active');
        mobileMenuToggle.textContent = '☰';
      }
    });
    
    // Close menu when clicking a link
    mainNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        mainNav.classList.remove('active');
        mobileMenuToggle.textContent = '☰';
      }
    });
  }
  
  // Prevent zoom on iOS
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Handle virtual keyboard
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      setTimeout(() => {
        // Scroll to ensure input is visible above keyboard
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });
  });
}

// ===== SIMPLE ROUTER =====
const routes = {
  oracle: renderOracle,
  vision: renderVision,
  docs: renderDocs,
  discussion: renderDiscussion,
  verify: renderVerify,
  contact: renderContact
};

function mount() {
  const hash = (location.hash || "#oracle").replace("#", "");
  const view = routes[hash] || renderOracle;
  document.getElementById("app").innerHTML = view();
  
  // Initialize mobile features after rendering
  setTimeout(initMobileFeatures, 0);
  
  // Wire up page-specific logic
  if (hash === "oracle") wireOracle();
  if (hash === "vision") wireVision();
  if (hash === "discussion") wireDiscussion();
  if (hash === "verify") wireVerify();
}

window.addEventListener("hashchange", mount);
window.addEventListener("load", mount);

// ===== VIEWS =====
function renderOracle() {
  return `
  <div class="container">
    <div class="panel">
      <h1>Consult the Oracle</h1>
      <label for="q">Question</label>
      <textarea id="q" rows="3" placeholder="Ask anything…"></textarea>
      <label for="sid">Session ID (optional)</label>
      <input id="sid" placeholder="auto-generate if empty"/>
      <div style="margin-top:16px">
        <button id="askBtn">Seek the Truth</button>
      </div>
    </div>

    <div class="panel" id="answerPanel" style="display:none">
      <h2>Oracle's Reply <span id="kindBadge" class="badge"></span></h2>
      <div id="answerText"></div>
      <div class="kvp">
        <div>Determinacy</div><div class="mono" id="det"></div>
        <div>Deception Prob.</div><div class="mono" id="dec"></div>
        <div>Risk Tags</div><div class="mono" id="risk"></div>
        <div>Hash</div><div class="hash" id="hash"></div>
        <div>Prev Hash</div><div class="hash" id="prev"></div>
        <div>Timestamp</div><div class="mono" id="ts"></div>
      </div>
    </div>

    <div class="panel">
      <h2>Audit Chain (latest 10)</h2>
      <div class="table-container">
        <table class="table" id="chainTable">
          <thead><tr><th>Time</th><th>Type</th><th>Q</th><th>Det.</th><th>Dec.</th><th>Hash</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderVision() {
  return `
  <div class="container">
    <div class="panel futuristic">
      <div class="vision-header">
        <h1>🚀 Oracle Ethics M1.5</h1>
        <div class="glow-text">Building Trustworthy AI for the Future</div>
      </div>
      
      <div class="manifesto-section">
        <h2>🌌 Our Vision</h2>
        <p>In an era of information explosion and algorithmic black boxes, truth and trust have become scarce resources. Oracle Ethics is not just a Q&A tool, but a new paradigm for AI design: transparent, verifiable, and immutable.</p>
      </div>

      <div class="manifesto-section">
        <h2>🎯 Our Mission</h2>
        <p>Build the world's first AI system that is:</p>
        <ul class="mission-list">
          <li>🔗 Self-auditing with blockchain-style audit logs</li>
          <li>🛡️ Equipped with multi-layer risk and deception detection</li>
          <li>🔍 Independently verifiable by users</li>
          <li>📜 Creates the first "trustworthy oracle" that can prove its own honesty</li>
        </ul>
      </div>

      <div class="core-principles">
        <h2>⭐ Core Principles</h2>
        <div class="principles-grid">
          <div class="principle-card">
            <h3>🔍 Transparency</h3>
            <p>Every answer generates an audit record, publicly accessible and traceable.</p>
          </div>
          <div class="principle-card">
            <h3>🔒 Verifiability</h3>
            <p>Users can verify answer integrity through cryptographic hashes.</p>
          </div>
          <div class="principle-card">
            <h3>🌐 Multi-perspective</h3>
            <p>Each question receives answers from multiple philosophical frameworks with risk assessments.</p>
          </div>
          <div class="principle-card">
            <h3>🔄 Self-evolution</h3>
            <p>Future versions will feature introspection mechanisms for enhanced reliability.</p>
          </div>
        </div>
      </div>

      <div class="manifesto-section">
        <h2>💫 What Makes Us Different</h2>
        <div class="differentiation">
          <div class="diff-item">
            <strong>• Other AIs are black boxes;</strong> We are glass boxes (auditable, traceable)
          </div>
          <div class="diff-item">
            <strong>• Other AIs disappear after answering;</strong> We preserve verifiable "Wisdom Logs"
          </div>
          <div class="diff-item">
            <strong>• Other AIs just output;</strong> We self-inspect and label deception/risk scores before output
          </div>
        </div>
      </div>

      <div class="roadmap">
        <h2>🛣️ Our Roadmap</h2>
        <div class="timeline">
          <div class="timeline-item current">
            <div class="timeline-marker">🚀</div>
            <div class="timeline-content">
              <h3>M1.5 - NOW</h3>
              <p>Trustworthy Q&A + Audit Chains (Currently Live)</p>
            </div>
          </div>
          <div class="timeline-item future">
            <div class="timeline-marker">🔮</div>
            <div class="timeline-content">
              <h3>M2 - NEXT</h3>
              <p>Internal Self-check Engine + Advanced Risk Assessment</p>
            </div>
          </div>
          <div class="timeline-item future">
            <div class="timeline-marker">🌍</div>
            <div class="timeline-content">
              <h3>M3 - FUTURE</h3>
              <p>Collective Wisdom Module - AI and users co-evolving towards a new social contract</p>
            </div>
          </div>
        </div>
      </div>

      <div class="manifesto-final">
        <blockquote class="vision-quote">
          "After the blackout, the true light appears."
          <footer>— Oracle Ethics Manifesto</footer>
        </blockquote>
        <p>Oracle Ethics is not just another AI project, but the blueprint for the next generation of trustworthy artificial intelligence.</p>
      </div>
    </div>
  </div>`;
}

function renderDocs() {
  return `
  <div class="container">
    <div class="panel">
      <h1>Documentation</h1>
      <p>Core idea: verifiable AI ethics — every answer is logged into a tamper-evident audit chain.</p>
      <ul>
        <li><a href="https://raw.githubusercontent.com/yumi951357/oracle-philosophy-frontend/main/public/whitepaper.pdf" target="_blank">Whitepaper (PDF)</a></li>
        <li><a href="https://raw.githubusercontent.com/yumi951357/oracle-philosophy-frontend/main/public/ritual-handbook.pdf" target="_blank">Ritual Handbook (PDF)</a></li>
        <li><a href="https://github.com/yumi951357/oracle-philosophy-frontend" target="_blank">Frontend Repository</a></li>
      </ul>
    </div>
  </div>`;
}

function renderDiscussion() {
  return `
  <div class="container">
    <div class="panel">
      <h1>Discussion Board</h1>
      <p>Share your thoughts about philosophy, ethics, and the oracle (max 300 characters)</p>
      
      <div class="message-form">
        <label for="authorInput">Your Name (optional)</label>
        <input type="text" id="authorInput" placeholder="Anonymous" maxlength="50">
        
        <label for="messageInput">Your Message</label>
        <textarea id="messageInput" rows="4" placeholder="Share your philosophical insights..." maxlength="300"></textarea>
        <div class="char-count"><span id="charCount">0</span>/300 characters</div>
        
        <button id="postMessageBtn" style="margin-top:16px">Post Message</button>
      </div>
    </div>

    <div class="panel">
      <h2>Community Messages</h2>
      <div id="messagesList" class="messages-list">
        <div class="loading">Loading messages...</div>
      </div>
    </div>
  </div>`;
}

function renderVerify() {
  return `
  <div class="container">
    <div class="panel">
      <h1>Verify Audit Record</h1>
      <p>Paste any hash from the audit chain to verify its authenticity and check the integrity of the entire blockchain.</p>
      
      <div class="verify-form">
        <label for="hashInput">Hash to Verify</label>
        <input type="text" id="hashInput" placeholder="Paste hash value here..." style="font-family: monospace; width: 100%">
        <button id="verifyBtn" style="margin-top:16px">Verify Hash</button>
      </div>
    </div>

    <div class="panel" id="verifyResult" style="display:none">
      <h2>Verification Result</h2>
      <div id="resultContent"></div>
    </div>

    <div class="panel">
      <h2>How Verification Works</h2>
      <div class="verification-info">
        <h3>🔗 Blockchain Integrity</h3>
        <p>Each record contains the hash of the previous record, creating an unbreakable chain. Any modification to a past record would break the chain.</p>
        
        <h3>🔒 Cryptographic Security</h3>
        <p>Hashes are generated using SHA-256. Changing even one character in a record produces a completely different hash.</p>
        
        <h3>👁️ Public Verification</h3>
        <p>Anyone can verify any record at any time. No central authority needed - the truth is mathematically provable.</p>
        
        <h3>Try It Yourself</h3>
        <p>Copy a hash from the audit chain, modify one character in the input field, and see how verification fails.</p>
      </div>
    </div>
  </div>`;
}

function renderContact() {
  return `
  <div class="container">
    <div class="panel">
      <h1>Contact</h1>
      <p>Email: renshijian0258@proton.me</p>
      <p>Telegram: @renshijian0</p>
      <p>GitHub: yumi951357</p>
    </div>
  </div>`;
}

// ===== LOGIC =====
function wireOracle() {
  const btn = document.getElementById("askBtn");
  const qEl = document.getElementById("q");
  const sidEl = document.getElementById("sid");

  btn.onclick = async () => {
    const question = qEl.value.trim();
    if (!question) return alert("Please enter a question.");
    const session_id = sidEl.value.trim() || ("session_" + Date.now());
    sidEl.value = session_id;

    btn.disabled = true; 
    btn.innerText = "Thinking…";
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/consult`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ question, session_id })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      // Show answer panel
      document.getElementById("answerPanel").style.display = "block";

      // Update answer display with explanation and evidence
      const explanationHtml = data.explanation ? `
          <div style="margin-top: 16px; padding: 12px; background: rgba(109, 169, 255, 0.1); border-radius: 8px; border-left: 4px solid var(--accent);">
              <strong>Why this answer?</strong>
              <div style="margin-top: 8px; font-size: 0.9em; color: var(--muted);">
                  ${escapeHtml(data.explanation)}
              </div>
          </div>
      ` : '';

      const evidenceHtml = data.evidence && data.evidence.length > 0 ? `
          <div style="margin-top: 12px;">
              <strong>Evidence:</strong>
              <div style="margin-top: 8px;">
                  ${data.evidence.map(e => `
                      <a href="${e.url}" target="_blank" style="display: block; margin: 4px 0; color: var(--accent); text-decoration: none;">
                          📚 ${escapeHtml(e.title)}
                      </a>
                  `).join('')}
              </div>
          </div>
      ` : '';

      // Use innerHTML instead of innerText for rich text display
      document.getElementById("answerText").innerHTML = `
          <div style="margin-bottom: 16px;">${escapeHtml(data.answer)}</div>
          ${explanationHtml}
          ${evidenceHtml}
      `;
      
      // Update badge
      const badge = document.getElementById("kindBadge");
      badge.innerText = data.kind;
      badge.className = "badge " + (data.kind || "truth");
      
      // Update metrics
      document.getElementById("det").innerText = data.determinacy.toFixed(2);
      document.getElementById("dec").innerText = data.deception_prob.toFixed(2);
      document.getElementById("risk").innerText = (data.risk_tags || []).join(", ");
      document.getElementById("hash").innerText = data.hash;
      document.getElementById("prev").innerText = data.prev_hash;
      document.getElementById("ts").innerText = new Date(data.timestamp * 1000).toISOString();

      await loadChain();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      btn.disabled = false; 
      btn.innerText = "Seek the Truth";
    }
  };

  loadChain();
}

function wireVision() {
  // Vision page logic can be added here
  console.log("Vision page loaded");
}

function wireDiscussion() {
  const messageInput = document.getElementById("messageInput");
  const authorInput = document.getElementById("authorInput");
  const postBtn = document.getElementById("postMessageBtn");
  const charCount = document.getElementById("charCount");

  // Character counter
  messageInput.addEventListener("input", () => {
    const count = messageInput.value.length;
    charCount.textContent = count;
    charCount.style.color = count > 280 ? "#ff4444" : "#888";
  });

  // Post message
  postBtn.onclick = async () => {
    const message = messageInput.value.trim();
    const author = authorInput.value.trim();

    if (!message) {
      alert("Please enter a message.");
      return;
    }

    if (message.length > 300) {
      alert("Message too long (max 300 characters).");
      return;
    }

    postBtn.disabled = true;
    postBtn.innerText = "Posting...";

    try {
      const res = await fetch(`${BACKEND_URL}/api/messages`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ 
          message: message,
          author: author 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post message");

      // Clear form
      messageInput.value = "";
      authorInput.value = "";
      charCount.textContent = "0";
      charCount.style.color = "#888";

      // Reload messages
      loadMessages();
      alert("Message posted successfully!");

    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      postBtn.disabled = false;
      postBtn.innerText = "Post Message";
    }
  };

  // Load messages on page load
  loadMessages();
}

function wireVerify() {
  const verifyBtn = document.getElementById("verifyBtn");
  const hashInput = document.getElementById("hashInput");

  verifyBtn.onclick = async () => {
    const hash = hashInput.value.trim();
    
    if (!hash) {
      alert("Please enter a hash to verify.");
      return;
    }

    verifyBtn.disabled = true;
    verifyBtn.innerText = "Verifying...";

    try {
      const res = await fetch(`${BACKEND_URL}/api/verify/${hash}`);
      const data = await res.json();
      
      document.getElementById("verifyResult").style.display = "block";
      const resultContent = document.getElementById("resultContent");
      
      if (data.verified) {
        // Use correct data path for verification results
        const record = data.record;
        const question = record.question || record.payload?.question || "N/A";
        const kind = record.kind || record.payload?.kind || "truth";
        const determinacy = record.determinacy ?? record.payload?.determinacy ?? 0;
        const deceptionProb = record.deception_prob ?? record.payload?.deception_prob ?? 0;
        
        resultContent.innerHTML = `
          <div style="color: #00c851; font-size: 1.2em; margin-bottom: 16px;">
            ✅ VERIFICATION SUCCESSFUL
          </div>
          <div class="verification-details">
            <p><strong>Record Found:</strong> Yes</p>
            <p><strong>Chain Integrity:</strong> ${data.chain_valid ? "✅ Valid" : "❌ Compromised"}</p>
            <p><strong>Timestamp:</strong> ${new Date(record.timestamp * 1000).toLocaleString()}</p>
            <p><strong>Question:</strong> "${escapeHtml(question)}"</p>
            <p><strong>Answer Type:</strong> ${kind}</p>
            <p><strong>Determinacy:</strong> ${determinacy}</p>
            <p><strong>Deception Probability:</strong> ${deceptionProb}</p>
          </div>
          <div style="margin-top: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <small>This record is permanently stored in the immutable audit chain. Any modification would break the cryptographic links.</small>
          </div>
        `;
      } else {
        resultContent.innerHTML = `
          <div style="color: #ff4444; font-size: 1.2em; margin-bottom: 16px;">
            ❌ VERIFICATION FAILED
          </div>
          <p>${data.error || "Hash not found or chain integrity compromised"}</p>
          <div style="margin-top: 16px; padding: 12px; background: #fff3cd; border-radius: 8px;">
            <small>This could mean: the hash doesn't exist, the record was tampered with, or the blockchain integrity is broken.</small>
          </div>
        `;
      }
      
    } catch (e) {
      document.getElementById("verifyResult").style.display = "block";
      document.getElementById("resultContent").innerHTML = `
        <div style="color: #ff4444;">Error: ${e.message}</div>
      `;
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.innerText = "Verify Hash";
    }
  };
}

// ===== ENHANCED FUNCTIONS =====
async function loadChain() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/audit/chain`);
    const data = await res.json();
    const rows = (data.records || []).slice(-10).reverse().map(r => {
      const t = new Date(r.timestamp * 1000).toLocaleTimeString();
      const kind = (r.deception_prob >= 0.6) ? "deception" : "truth";
      return `<tr>
        <td>${t}</td>
        <td>${kind}</td>
        <td title="${escapeHtml(r.question)}">${escapeHtml(truncate(r.question, 42))}</td>
        <td>${Number(r.determinacy).toFixed(2)}</td>
        <td>${Number(r.deception_prob).toFixed(2)}</td>
        <td class="mono" title="${r.hash}">
          ${r.hash.slice(0,10)}…
          <button class="verify-hash-btn" onclick="verifyHashDirectly('${r.hash}', event)" title="Verify this hash">
            🔍
          </button>
        </td>
      </tr>`;
    }).join("");
    
    document.querySelector("#chainTable tbody").innerHTML = rows || "<tr><td colspan='6'>No records</td></tr>";
  } catch(e) {
    document.querySelector("#chainTable tbody").innerHTML = "<tr><td colspan='6'>Failed to load chain</td></tr>";
  }
}

// Direct hash verification function with event parameter
async function verifyHashDirectly(hash, event) {
  try {
    // Show verifying state
    const verifyBtn = event.target;
    verifyBtn.innerHTML = '⏳';
    verifyBtn.disabled = true;

    const res = await fetch(`${BACKEND_URL}/api/verify/${hash}`);
    const data = await res.json();
    
    if (data.verified) {
      // Success verification - show green checkmark
      verifyBtn.innerHTML = '✅';
      verifyBtn.style.color = '#00c851';
      
      // Restore after 3 seconds
      setTimeout(() => {
        verifyBtn.innerHTML = '🔍';
        verifyBtn.style.color = '';
        verifyBtn.disabled = false;
      }, 3000);
      
      // Show detailed verification result
      showVerificationResult(data, hash);
    } else {
      // Verification failed - show red X
      verifyBtn.innerHTML = '❌';
      verifyBtn.style.color = '#ff4444';
      
      setTimeout(() => {
        verifyBtn.innerHTML = '🔍';
        verifyBtn.style.color = '';
        verifyBtn.disabled = false;
      }, 3000);
      
      alert(`Verification failed: ${data.error || 'Hash not found'}`);
    }
    
  } catch (e) {
    // Error case
    const verifyBtn = event.target;
    verifyBtn.innerHTML = '❌';
    verifyBtn.style.color = '#ff4444';
    
    setTimeout(() => {
      verifyBtn.innerHTML = '🔍';
      verifyBtn.style.color = '';
      verifyBtn.disabled = false;
    }, 3000);
    
    alert("Verification error: " + e.message);
  }
}

// Show detailed verification result
function showVerificationResult(data, hash) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--panel);
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #00c851;
    z-index: 1000;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `;
  
  // Use correct data path for modal display
  const record = data.record;
  const question = record.question || record.payload?.question || "N/A";
  const kind = record.kind || record.payload?.kind || "truth";
  const determinacy = record.determinacy ?? record.payload?.determinacy ?? 0;
  const deceptionProb = record.deception_prob ?? record.payload?.deception_prob ?? 0;
  
  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h3 style="margin: 0; color: #00c851;">✅ Verification Successful</h3>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1.2em;">×</button>
    </div>
    <div style="margin-bottom: 16px;">
      <p><strong>Hash:</strong> <code>${hash}</code></p>
      <p><strong>Record Found:</strong> ✅ Yes</p>
      <p><strong>Chain Integrity:</strong> ${data.chain_valid ? "✅ Valid" : "❌ Compromised"}</p>
      <p><strong>Timestamp:</strong> ${new Date(record.timestamp * 1000).toLocaleString()}</p>
      <p><strong>Question:</strong> "${escapeHtml(question)}"</p>
      <p><strong>Answer Type:</strong> ${kind}</p>
      <p><strong>Determinacy:</strong> ${determinacy}</p>
      <p><strong>Deception Probability:</strong> ${deceptionProb}</p>
    </div>
    <div style="padding: 12px; background: rgba(0, 200, 81, 0.1); border-radius: 8px; border-left: 4px solid #00c851;">
      <small>This record is permanently stored in the immutable audit chain. Any modification would break the cryptographic links.</small>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close when clicking background
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function loadMessages() {
  const messagesList = document.getElementById("messagesList");
  
  try {
    messagesList.innerHTML = "<div class='loading'>Loading messages...</div>";
    
    const res = await fetch(`${BACKEND_URL}/api/messages`);
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || "Failed to load messages");

    if (data.messages.length === 0) {
      messagesList.innerHTML = "<div class='no-messages'>No messages yet. Be the first to share your thoughts!</div>";
      return;
    }

    const messagesHtml = data.messages.map(msg => `
      <div class="message-item">
        <div class="message-header">
          <strong>${escapeHtml(msg.author)}</strong>
          <span class="message-time">${formatTime(msg.timestamp)}</span>
        </div>
        <div class="message-content">${escapeHtml(msg.message)}</div>
        <div class="message-footer">
          <button class="like-btn" onclick="likeMessage(${msg.id})">
            👍 <span class="like-count">${msg.likes || 0}</span>
          </button>
        </div>
      </div>
    `).join("");

    messagesList.innerHTML = messagesHtml;

  } catch (e) {
    messagesList.innerHTML = `<div class="error">Failed to load messages: ${e.message}</div>`;
  }
}

async function likeMessage(messageId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/messages/${messageId}/like`, {
      method: "POST"
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to like message");

    // Update like count in UI
    const likeBtn = document.querySelector(`.like-btn[onclick="likeMessage(${messageId})"]`);
    if (likeBtn) {
      const likeCount = likeBtn.querySelector('.like-count');
      likeCount.textContent = data.likes;
    }

  } catch (e) {
    alert("Error liking message: " + e.message);
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function truncate(s, n) { 
  return (s || "").length > n ? s.slice(0, n) + "…" : s; 
}

function escapeHtml(s) { 
  return (s || "").replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;', 
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m])); 
}