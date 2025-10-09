<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oracle Ethics</title>
    <style>
        :root {
            --bg: #0a0a0a;
            --panel: #1a1a1a;
            --text: #e0e0e0;
            --muted: #888;
            --accent: #6da9ff;
            --border: #333;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
        }

        .app-header {
            background: var(--panel);
            border-bottom: 1px solid var(--border);
            padding: 1rem;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--accent);
            text-decoration: none;
        }

        .nav {
            display: flex;
            gap: 2rem;
        }

        .nav a {
            color: var(--text);
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .nav a:hover, .nav a.active {
            background: var(--accent);
            color: var(--bg);
        }

        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            color: var(--text);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
        }

        .container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        .panel {
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
        }

        h1, h2, h3 {
            color: var(--accent);
            margin-bottom: 1rem;
        }

        label {
            display: block;
            margin: 1rem 0 0.5rem;
            color: var(--muted);
            font-size: 0.9rem;
        }

        input, textarea, button {
            width: 100%;
            padding: 0.75rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            border-radius: 6px;
            color: var(--text);
            font-size: 1rem;
        }

        button {
            background: var(--accent);
            color: var(--bg);
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: opacity 0.2s;
        }

        button:hover {
            opacity: 0.9;
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .kvp {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 0.5rem;
            margin-top: 1rem;
            font-size: 0.9rem;
        }

        .kvp > div:nth-child(odd) {
            color: var(--muted);
        }

        .mono, .hash {
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }

        .hash {
            color: var(--accent);
        }

        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }

        .badge.truth {
            background: rgba(0, 200, 81, 0.2);
            color: #00c851;
        }

        .badge.deception {
            background: rgba(255, 68, 68, 0.2);
            color: #ff4444;
        }

        .table-container {
            overflow-x: auto;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        .table th, .table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }

        .table th {
            color: var(--muted);
            font-weight: 600;
        }

        .verify-hash-btn {
            width: auto;
            padding: 0.25rem 0.75rem;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        }

        @media (max-width: 768px) {
            .mobile-menu-toggle {
                display: block;
            }

            .nav {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--panel);
                flex-direction: column;
                padding: 1rem;
                border-bottom: 1px solid var(--border);
            }

            .nav.active {
                display: flex;
            }

            .container {
                margin: 1rem auto;
                padding: 0 0.5rem;
            }

            .panel {
                padding: 1rem;
            }

            .kvp {
                grid-template-columns: 1fr;
                gap: 0.25rem;
            }

            .table {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <header class="app-header">
        <div class="header-content">
            <a href="#oracle" class="logo">Oracle Ethics</a>
            
            <button class="mobile-menu-toggle" id="mobileMenuToggle">☰</button>
            
            <nav class="nav" id="mainNav">
                <a href="#oracle">Oracle</a>
                <a href="#vision">Vision</a>
                <a href="#docs">Docs</a>
                <a href="#discussion">Discussion</a>
                <a href="#verify">Verify</a>
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </header>

    <main id="app">
        <!-- Content will be rendered here by JavaScript -->
    </main>

<script>
// ===== REQUEST LOCK SYSTEM =====
window.requestLocks = new Map();
window.requestQueue = [];
window.maxConcurrentRequests = 2;

function acquireLock(key) {
    if (window.requestLocks.has(key)) {
        return false;
    }
    window.requestLocks.set(key, true);
    return true;
}

function releaseLock(key) {
    window.requestLocks.delete(key);
}

// ===== CONFIG =====
const BACKEND_URL = "https://oracle-philosophy-backend.onrender.com";

// ===== SAFE DATA HANDLING =====
function safeTimestamp(timestamp) {
    if (!timestamp) return new Date();
    
    if (typeof timestamp === 'number') {
        return new Date(timestamp * 1000);
    }
    
    if (typeof timestamp === 'string') {
        let date = new Date(timestamp);
        if (!isNaN(date.getTime())) return date;
        
        date = new Date(timestamp.replace('Z', '+00:00'));
        if (!isNaN(date.getTime())) return date;
        
        console.warn('Failed to parse timestamp:', timestamp);
        return new Date();
    }
    
    return new Date();
}

function safeNumber(value, defaultValue = 0) {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
}

function safeString(value, defaultValue = '') {
    return value || defaultValue;
}

function safeArray(value, defaultValue = []) {
    return Array.isArray(value) ? value : defaultValue;
}

// ===== MOBILE INITIALIZATION =====
function initMobileFeatures() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = mainNav.classList.contains('active');
            mainNav.classList.toggle('active');
            mobileMenuToggle.textContent = isActive ? '☰' : '✕';
        });
        
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('active') && 
                !mainNav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        mainNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                setTimeout(() => closeMobileMenu(), 100);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
}

function closeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mainNav && mobileMenuToggle) {
        mainNav.classList.remove('active');
        mobileMenuToggle.textContent = '☰';
    }
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
    
    setTimeout(initMobileFeatures, 0);
    closeMobileMenu();
    
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
            
            <div id="knowledgeResults" style="margin-top: 20px; display: none;">
                <h3>📚 Related Knowledge</h3>
                <div id="knowledgeList"></div>
            </div>
            
            <div class="kvp">
                <div>Determinacy</div><div class="mono" id="det"></div>
                <div>Deception Prob.</div><div class="mono" id="dec"></div>
                <div>Risk Tags</div><div class="mono" id="risk"></div>
                <div>Hash</div><div class="hash" id="hash"></div>
                <div>Prev Hash</div><div class="hash" id="prev"></div>
                <div>Timestamp</div><div class="mono" id="ts"></div>
                <div>Source</div><div class="mono" id="source"></div>
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
        <div class="panel">
            <h1>Our Vision</h1>
            <p>Building Trustworthy AI for the Future</p>
        </div>
    </div>`;
}

function renderDocs() {
    return `
    <div class="container">
        <div class="panel">
            <h1>Documentation</h1>
            <p>Core idea: verifiable AI ethics — every answer is logged into a tamper-evident audit chain.</p>
        </div>
    </div>`;
}

function renderDiscussion() {
    return `
    <div class="container">
        <div class="panel">
            <h1>Discussion Board</h1>
            <p>Share your thoughts about philosophy, ethics, and the oracle</p>
        </div>
    </div>`;
}

function renderVerify() {
    return `
    <div class="container">
        <div class="panel">
            <h1>Verify Audit Record</h1>
            <p>Paste any hash from the audit chain to verify its authenticity.</p>
        </div>
    </div>`;
}

function renderContact() {
    return `
    <div class="container">
        <div class="panel">
            <h1>Contact</h1>
            <p>Email: renshijian0258@proton.me</p>
        </div>
    </div>`;
}

// ===== ORACLE LOGIC =====
function wireOracle() {
    const btn = document.getElementById("askBtn");
    const qEl = document.getElementById("q");
    const sidEl = document.getElementById("sid");

    btn.onclick = async () => {
        const question = qEl.value.trim();
        if (!question) return alert("Please enter a question.");
        
        const requestKey = `ask_${Date.now()}`;
        if (!acquireLock(requestKey)) {
            console.log("🔄 Request already in progress, please wait...");
            return;
        }
        
        const session_id = sidEl.value.trim() || ("session_" + Date.now());
        sidEl.value = session_id;

        btn.disabled = true; 
        btn.innerText = "Thinking…";
        
        try {
            document.getElementById("knowledgeResults").style.display = 'none';
            document.getElementById("knowledgeList").innerHTML = '<div class="loading">Searching knowledge base...</div>';
            
            console.log("🚀 Sending request to backend...");
            
            const res = await fetch(`${BACKEND_URL}/api/consult`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    question: question,
                    session_id: session_id,
                    lang: navigator.language.startsWith("zh") ? "zh" : "en"
                })
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Request timeout")), 30000)
            );
            
            const data = await Promise.race([res.json(), timeoutPromise]);
            
            if (!res.ok) throw new Error(data.error || "Request failed");

            document.getElementById("answerPanel").style.display = "block";

            const safeData = {
                kind: safeString(data.kind, "unknown"),
                answer: safeString(data.answer, "No answer provided"),
                determinacy: safeNumber(data.determinacy, 0),
                deception_prob: safeNumber(data.deception_prob, 0),
                risk_tags: safeArray(data.risk_tags),
                hash: safeString(data.hash, "N/A"),
                prev_hash: safeString(data.prev_hash, "N/A"),
                timestamp: data.timestamp || Date.now() / 1000,
                explanation: safeString(data.explanation),
                evidence: safeArray(data.evidence),
                ref_hash: safeString(data.ref_hash),
                references: safeArray(data.references),
                knowledge_search: data.knowledge_search || {},
                source: safeString(data.source, "unknown")
            };

            const explanationHtml = safeData.explanation ? `
                <div style="margin-top: 16px; padding: 12px; background: rgba(109, 169, 255, 0.1); border-radius: 8px; border-left: 4px solid var(--accent);">
                    <strong>Why this answer?</strong>
                    <div style="margin-top: 8px; font-size: 0.9em; color: var(--muted);">
                        ${escapeHtml(safeData.explanation)}
                    </div>
                </div>
            ` : '';

            document.getElementById("answerText").innerHTML = `
                <div style="margin-bottom: 16px;">${escapeHtml(safeData.answer)}</div>
                ${explanationHtml}
            `;
            
            const badge = document.getElementById("kindBadge");
            badge.innerText = safeData.kind;
            badge.className = "badge " + safeData.kind;
            
            document.getElementById("det").innerText = safeData.determinacy.toFixed(2);
            document.getElementById("dec").innerText = safeData.deception_prob.toFixed(2);
            document.getElementById("risk").innerText = safeData.risk_tags.join(", ");
            document.getElementById("hash").innerText = safeData.hash;
            document.getElementById("prev").innerText = safeData.prev_hash;
            document.getElementById("ts").innerText = safeTimestamp(safeData.timestamp).toISOString();
            document.getElementById("source").innerText = safeData.source;

            if (safeData.knowledge_search.available && safeData.knowledge_search.results.length > 0) {
                const knowledgeHtml = safeData.knowledge_search.results.map((result, index) => `
                    <div style="margin-bottom: 16px; padding: 12px; background: rgba(109, 169, 255, 0.05); border-radius: 8px; border-left: 3px solid var(--accent);">
                        <div style="font-weight: bold; color: var(--accent);">
                            📄 ${result.file_name} (Relevance: ${result.score})
                        </div>
                        <div style="font-size: 0.9em; color: var(--muted); margin-top: 4px;">
                            ${escapeHtml(result.content_preview || 'No preview available')}
                        </div>
                    </div>
                `).join('');
                
                document.getElementById("knowledgeList").innerHTML = knowledgeHtml;
                document.getElementById("knowledgeResults").style.display = 'block';
            } else {
                document.getElementById("knowledgeResults").style.display = 'none';
            }

            setTimeout(async () => {
                await loadChain();
                console.log("✅ Audit chain reloaded after new question");
            }, 500);

        } catch (e) {
            console.error("❌ Request failed:", e);
            alert("Error: " + e.message);
        } finally {
            releaseLock(requestKey);
            btn.disabled = false; 
            btn.innerText = "Seek the Truth";
        }
    };

    loadChain();
}

function wireVision() {
    console.log("Vision page loaded");
}

function wireDiscussion() {
    console.log("Discussion page loaded");
}

function wireVerify() {
    console.log("Verify page loaded");
}

// ===== AUDIT CHAIN FUNCTIONS =====
async function loadChain() {
    if (!acquireLock('loadChain')) {
        return;
    }
    
    try {
        console.log("🔍 Loading audit chain...");
        
        const timestamp = new Date().getTime();
        const res = await fetch(`${BACKEND_URL}/api/audit/chain?t=${timestamp}`);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const data = await res.json();
        
        console.log(`🔍 Audit chain API response:`, data);
        
        if (!data.records) {
            throw new Error("Audit chain data format error");
        }
        
        const displayRecords = data.records.slice(0, 10);
        
        console.log(`📊 Displaying ${displayRecords.length} records (total ${data.records.length})`);
        
        const rows = displayRecords.map(r => {
            const timestamp = r.timestamp || r.created_at;
            const t = safeTimestamp(timestamp).toLocaleTimeString();
            const kind = (safeNumber(r.deception_prob) >= 0.45) ? "deception" : "truth";
            const questionText = escapeHtml(truncate(r.question, 42));
            
            return `<tr>
                <td>${t}</td>
                <td>${kind}</td>
                <td title="${escapeHtml(r.question)}">${questionText}</td>
                <td>${safeNumber(r.determinacy).toFixed(2)}</td>
                <td>${safeNumber(r.deception_prob).toFixed(2)}</td>
                <td class="mono" title="${r.hash}">
                    ${(r.hash || '').slice(0,10)}…
                    <button class="verify-hash-btn" onclick="verifyHashDirectly('${r.hash}', event)" title="Verify this hash">
                        Verify
                    </button>
                </td>
            </tr>`;
        }).join("");
        
        const tbody = document.querySelector("#chainTable tbody");
        if (tbody) {
            tbody.innerHTML = rows || "<tr><td colspan='6'>No records</td></tr>";
            console.log("✅ Audit chain table updated");
        }
        
    } catch(e) {
        console.error("❌ Failed to load audit chain:", e);
        const tbody = document.querySelector("#chainTable tbody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan='6'>Load failed: ${e.message}</td></tr>`;
        }
    } finally {
        releaseLock('loadChain');
    }
}

async function verifyHashDirectly(hash, event) {
    const verifyKey = `verify_${hash}`;
    if (!acquireLock(verifyKey)) {
        return;
    }
    
    const verifyBtn = event.target;
    const originalHTML = verifyBtn.innerHTML;
    
    try {
        verifyBtn.innerHTML = 'Verifying...';
        verifyBtn.disabled = true;

        console.log(`🔍 Verifying hash: ${hash}`);
        
        const res = await fetch(`${BACKEND_URL}/api/verify/${hash}?t=${Date.now()}`);
        const data = await res.json();
        
        console.log("🔍 Verification response:", data);
        
        if (data.verified) {
            verifyBtn.innerHTML = 'Verified';
            verifyBtn.style.background = 'rgba(0, 200, 81, 0.2)';
            verifyBtn.style.color = '#00c851';
        } else {
            verifyBtn.innerHTML = 'Failed';
            verifyBtn.style.background = 'rgba(255, 68, 68, 0.2)';
            verifyBtn.style.color = '#ff4444';
            alert(`Verification failed: ${data.error || 'Unknown error'}`);
        }
        
    } catch (e) {
        console.error("❌ Verification error:", e);
        verifyBtn.innerHTML = 'Error';
        verifyBtn.style.background = 'rgba(255, 68, 68, 0.2)';
        verifyBtn.style.color = '#ff4444';
        alert("Verification error: " + e.message);
    } finally {
        setTimeout(() => {
            verifyBtn.innerHTML = originalHTML;
            verifyBtn.style.background = '';
            verifyBtn.style.color = '';
            verifyBtn.disabled = false;
            releaseLock(verifyKey);
        }, 2000);
    }
}

// ===== UTILITY FUNCTIONS =====
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

// Make functions globally available
window.verifyHashDirectly = verifyHashDirectly;
</script>
</body>
</html>