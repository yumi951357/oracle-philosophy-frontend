// ===== CONFIG =====
const BACKEND_URL = "https://oracle-philosophy-backend.onrender.com";

// ===== SIMPLE ROUTER =====
const routes = {
  oracle: renderOracle,
  docs: renderDocs,
  discussion: renderDiscussion,
  contact: renderContact
};

function mount() {
  const hash = (location.hash || "#oracle").replace("#", "");
  const view = routes[hash] || renderOracle;
  document.getElementById("app").innerHTML = view();
  if (hash === "oracle") wireOracle();
  if (hash === "discussion") wireDiscussion();
}
window.addEventListener("hashchange", mount);
window.addEventListener("load", mount);

// ===== VIEWS =====
function renderOracle() {
  return `
  <div class="container">
    <div class="panel">
      <h1>Consult the Oracle</h1>
      <label>Question</label>
      <textarea id="q" rows="3" placeholder="Ask anything…"></textarea>
      <label>Session ID (optional)</label>
      <input id="sid" placeholder="auto-generate if empty"/>
      <div style="margin-top:12px">
        <button id="askBtn">Seek the Truth</button>
      </div>
    </div>

    <div class="panel" id="answerPanel" style="display:none">
      <h2>Oracle's Reply <span id="kindBadge" class="badge"></span></h2>
      <p id="answerText"></p>
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
      <table class="table" id="chainTable">
        <thead><tr><th>Time</th><th>Type</th><th>Q</th><th>Det.</th><th>Dec.</th><th>Hash</th></tr></thead>
        <tbody></tbody>
      </table>
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
        <label>Your Name (optional)</label>
        <input type="text" id="authorInput" placeholder="Anonymous" maxlength="50">
        
        <label>Your Message</label>
        <textarea id="messageInput" rows="4" placeholder="Share your philosophical insights..." maxlength="300"></textarea>
        <div class="char-count"><span id="charCount">0</span>/300 characters</div>
        
        <button id="postMessageBtn" style="margin-top:12px">Post Message</button>
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
      document.getElementById("answerText").innerText = data.answer;
      
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
        <td class="mono" title="${r.hash}">${r.hash.slice(0,10)}…</td>
      </tr>`;
    }).join("");
    
    document.querySelector("#chainTable tbody").innerHTML = rows || "<tr><td colspan='6'>No records</td></tr>";
  } catch(e) {
    document.querySelector("#chainTable tbody").innerHTML = "<tr><td colspan='6'>Failed to load chain</td></tr>";
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