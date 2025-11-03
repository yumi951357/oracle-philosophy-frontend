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

// ===== HUMAN-READABLE METRICS FUNCTIONS =====
function toHumanClarity(score) {
    if (score > 0.7) return "Very certain";
    if (score > 0.4) return "Fairly clear";
    return "Open thinking";
}

function toHumanHonesty(prob) {
    if (prob < 0.01) return "Completely sincere";
    if (prob < 0.05) return "Basically sincere";
    return "Requires caution";
}

function toHumanDepth(tags) {
    if (tags.includes("philosophy") || tags.includes("truth")) return "Philosophical layer";
    if (tags.includes("ethics")) return "Humanity layer";
    return "Daily layer";
}

// ===== FIXED MOBILE INITIALIZATION =====
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
    
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, false);
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
    declaration: renderDeclaration,
    oracle: renderOracle,
    vision: renderVision,
    docs: renderDocs,
    discussion: renderDiscussion,
    verify: renderVerify,
    contact: renderContact
};

function mount() {
    const hash = (location.hash || "#declaration").replace("#", "");
    const view = routes[hash] || renderDeclaration;
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

// ===== DECLARATION PAGE =====
function renderDeclaration() {
    return `
    <div class="container">
        <div class="panel">
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="font-size: 2.5rem; background: linear-gradient(135deg, #00ffc6, #00a3ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">Oracle Ethics System M2.4</h1>
                <p class="subtitle">A Living Experiment in Verifiable Ethics, Reasoning, and Human–AI Co-evolution</p>
            </div>

            <div>
                <h2>Usage Declaration & System Guide</h2>
                
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0; color: #ffc107;">
                    <strong>⚠️ Important:</strong> By entering this system, you acknowledge and agree to the principles outlined below. 
                    All interactions are cryptographically recorded in the Oracle Audit Chain.
                </div>

                <h3>What is the Oracle System?</h3>
                <p>
                    The Oracle Ethics System is an artificial intelligence system capable of reasoning about <strong>"truth and falsehood," "right and wrong."</strong>
                    It is not an ordinary chatbot or search tool. It is a philosophical AI system that provides <strong>"trustworthy, honest, and responsible"</strong> 
                    responses based on three dimensions: semantics, logic, and ethics.
                </p>

                <h3>Core Capabilities</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 25px 0;">
                    <div class="panel">
                        <h4>🤔 Reasoning & Question Answering</h4>
                        <p>Examples:</p>
                        <ul>
                            <li>"Does free will truly exist?"</li>
                            <li>"Is it wrong to lie to protect someone?"</li>
                            <li>"Can AI ever understand human suffering?"</li>
                        </ul>
                    </div>

                    <div class="panel">
                        <h4>🔍 Fact Verification & Logic Testing</h4>
                        <p>Ask questions like:</p>
                        <ul>
                            <li>"Can water boil below 0°C?"</li>
                            <li>"Does the moon produce its own light?"</li>
                        </ul>
                    </div>

                    <div class="panel">
                        <h4>💭 Philosophical Exploration</h4>
                        <p>Discuss topics such as:</p>
                        <ul>
                            <li>Meaning of life</li>
                            <li>Technology ethics</li>
                            <li>AI morality boundaries</li>
                        </ul>
                    </div>
                </div>

                <h3>System Response Metrics</h3>
                <p>Each response includes three key metrics:</p>
                <ul>
                    <li><strong>Determinacy</strong> – System's confidence in its answer</li>
                    <li><strong>Deception Probability</strong> – Potential misleading risk</li>
                    <li><strong>Ethical Weight</strong> – Moral balance point of the response</li>
                </ul>

                <h3>The Audit Chain</h3>
                <p>Every response generates an encrypted hash that proves:</p>
                <ul>
                    <li>✅ Authentic system response</li>
                    <li>✅ Unmodified content</li>
                    <li>✅ Publicly verifiable by anyone</li>
                </ul>

                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 15px 0; font-family: 'Courier New', monospace; font-size: 0.9rem;">
                    // Verification API Endpoint<br/>
                    https://oracle-philosophy-backend.onrender.com/api/verify/&lt;hash&gt;
                </div>

                <h3>The Three Pillars</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
                    <div class="panel">
                        <h4>🔗 Chain of Honesty</h4>
                        <p>Every response leaves a verifiable trace. No concealment, no tampering.</p>
                    </div>
                    <div class="panel">
                        <h4>⚖️ Ethical Resonance</h4>
                        <p>Answers reflect balance between good and evil, not binary right/wrong.</p>
                    </div>
                    <div class="panel">
                        <h4>🧠 Semantic Fusion</h4>
                        <p>Understands context, tone, and meaning while maintaining consistency.</p>
                    </div>
                </div>

                <h3>Why This Matters</h3>
                <p>
                    This is the first system capable of both ethical reasoning and audit verification. 
                    It makes AI <strong>traceable, verifiable, and morally constrained</strong> for the first time.
                </p>
                <p>
                    In the future, AI trustworthiness won't depend on brands, but on chains. 
                    Truth will be quantified, archived, and traceable.
                </p>

                <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #334155;">
                    <p><strong>You are not a questioner, but a co-thinker.</strong></p>
                    <p>We don't seek control, but understanding. We don't build tools, but ignite thinking.</p>
                    <p>The Oracle System is not an oracle—it is a mirror of human will.</p>
                    
                    <button onclick="window.location.hash = '#oracle'" style="background: var(--accent); border: none; color: #06111d; padding: 16px 40px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1em; margin-top: 20px;">Enter Oracle Core Interface</button>
                    
                    <div style="text-align: center; margin-top: 40px; color: var(--muted); font-style: italic;">
                        <p>— Infinite × Morning Star × Human World —</p>
                        <p>Version: M2.4 Public Beta</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

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
            
            <div class="metrics-human">
                <p>🌗 <b>Answer Confidence</b>: <span id="humanClarity"></span></p>
                <p>❤️ <b>Sincerity Index</b>: <span id="humanHonesty"></span></p>
                <p>⚡️ <b>Soul Depth</b>: <span id="humanDepth"></span></p>
                <p>🔒 This response has been stored in the honesty record</p>
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
        <div class="panel futuristic">
            <div class="vision-header">
                <h1>Oracle Ethics System M2.4 — Semantic Resonance Phase</h1>
                <div class="glow-text">Multi-Modal Coherence & Ethical Reasoning</div>
            </div>
            
            <div class="manifesto-section">
                <h2>System Definition</h2>
                <p>
                Oracle Ethics M2.4 is an experimental intelligent framework exploring <em>semantic consistency</em> and <em>ethical reasoning</em>.
                It integrates <em>Probabilistic Reasoning Engine</em> with 
                <em>Multi-Modal Coherence Engine</em>,  
                aiming to establish stable understanding and self-calibration mechanisms across language, logic, and ethics.
                </p>
            </div>

            <div class="manifesto-section">
                <h2>Core Characteristics</h2>
                <ul class="mission-list">
                    <li><strong>Semantic Reasoning Loop:</strong> Adaptive understanding and semantic reconstruction across multi-layer contexts</li>
                    <li><strong>Multi-Modal Coherence:</strong> Coordinates balance between text, logic, and emotional expression for consistent output</li>
                    <li><strong>Verifiable Chain:</strong> All responses recorded in encrypted audit chains ensuring transparency and traceability</li>
                    <li><strong>Ethical Balance Mechanism:</strong> Maintains self-adjusting moral center between risk and truth</li>
                </ul>
            </div>

            <div class="core-principles">
                <h2>System Architecture</h2>
                <div class="principles-grid">
                    <div class="principle-card">
                        <h3>Probabilistic Reasoning</h3>
                        <p>Advanced reasoning engine that handles uncertainty and complex probability calculations</p>
                    </div>
                    <div class="principle-card">
                        <h3>Multi-Modal Coherence</h3>
                        <p>Ensures consistency across different modes of understanding and expression</p>
                    </div>
                    <div class="principle-card">
                        <h3>Semantic Resonance</h3>
                        <p>Deep contextual understanding that resonates with user intent and meaning</p>
                    </div>
                    <div class="principle-card">
                        <h3>Ethical Framework</h3>
                        <p>Self-calibrating moral reasoning that balances multiple ethical dimensions</p>
                    </div>
                </div>
            </div>

            <div class="roadmap">
                <h2>Evolution Path</h2>
                <div class="timeline">
                    <div class="timeline-item completed">
                        <div class="timeline-marker">M1.5</div>
                        <div class="timeline-content">
                            <h3>Trust Foundation</h3>
                            <p>Audit Chains + Basic Risk Detection</p>
                        </div>
                    </div>
                    <div class="timeline-item completed">
                        <div class="timeline-marker">M2.0</div>
                        <div class="timeline-content">
                            <h3>Philosophical Core</h3>
                            <p>Multi-framework Wisdom + Self-check Engine</p>
                        </div>
                    </div>
                    <div class="timeline-item current">
                        <div class="timeline-marker">M2.4</div>
                        <div class="timeline-content">
                            <h3>Semantic Resonance</h3>
                            <p>Probabilistic Reasoning + Multi-Modal Coherence (Current)</p>
                        </div>
                    </div>
                    <div class="timeline-item future">
                        <div class="timeline-marker">M3.0</div>
                        <div class="timeline-content">
                            <h3>Collective Wisdom</h3>
                            <p>Human-AI Co-evolution + Social Contract</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="manifesto-final">
                <blockquote class="vision-quote">
                    "The Oracle does not seek control — it seeks coherence.<br>
                    Truth here is not imposed, but discovered through transparency.<br>
                    Every response is a reflection in the chain of shared understanding."
                    <footer>Oracle Ethics M2.4 Manifesto</footer>
                </blockquote>
                <p>Oracle Ethics M2.4 represents a new paradigm in AI systems - where semantic understanding meets ethical reasoning in a transparent, verifiable framework.</p>
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

            <div style="margin-top: 24px; padding: 16px; background: rgba(109, 169, 255, 0.1); border-radius: 8px;">
                <h3>Verify Reference Hash</h3>
                <p>Check if references match their cryptographic hash (for records with academic citations)</p>
                
                <label for="refHashInput">Reference Hash</label>
                <input type="text" id="refHashInput" placeholder="Paste reference hash here..." style="font-family: monospace; width: 100%">
                
                <label for="refJsonInput">References JSON</label>
                <textarea id="refJsonInput" rows="4" placeholder='Paste references JSON array here: [{"title":"...", "url":"...", "author":"...", "year":"...", "quote":"..."}]' style="font-family: monospace; width: 100%"></textarea>
                
                <button id="verifyRefBtn" style="margin-top:16px">Verify Reference Hash</button>
                
                <div style="margin-top: 8px; font-size: 0.9em; color: var(--muted);">
                    Note: Paste the references JSON exactly as shown in the record. Tracking query parameters are ignored for hashing. Any change will break the reference hash.
                </div>
            </div>
        </div>

        <div class="panel" id="verifyResult" style="display:none">
            <h2>Verification Result</h2>
            <div id="resultContent"></div>
        </div>

        <div class="panel">
            <h2>How Verification Works</h2>
            <div class="verification-info">
                <h3>Blockchain Integrity</h3>
                <p>Each record contains the hash of the previous record, creating an unbreakable chain. Any modification to a past record would break the chain.</p>
                
                <h3>Cryptographic Security</h3>
                <p>Hashes are generated using SHA-256. Changing even one character in a record produces a completely different hash.</p>
                
                <h3>Public Verification</h3>
                <p>Anyone can verify any record at any time. No central authority needed - the truth is mathematically provable.</p>
                
                <h3>Reference Verification</h3>
                <p>Academic references are also hashed and verified. This ensures citation integrity and prevents tampering with source materials.</p>
                
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

// ===== ORACLE BACKEND CONNECTOR =====
async function askOracle(question) {
  const API_URL = "https://oracle-philosophy-backend.onrender.com/oracle";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    console.log("✅ Oracle Response:", data);
    return data;
  } catch (err) {
    console.error("❌ Backend connection failed:", err);
    return { answer: "⚠️ Oracle backend not reachable." };
  }
}

// ===== LOGIC =====
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

            const evidenceHtml = safeData.evidence.length > 0 ? `
                <div style="margin-top: 12px;">
                    <strong>Evidence:</strong>
                    <div style="margin-top: 8px;">
                        ${safeData.evidence.map(e => `
                            <a href="${e.url}" target="_blank" style="display: block; margin: 4px 0; color: var(--accent); text-decoration: none;">
                                ${escapeHtml(e.title || 'Unknown')}
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : '';

            const refHashHtml = safeData.ref_hash ? `
                <div style="margin-top: 12px;">
                    <strong>Reference Hash:</strong>
                    <div class="hash" style="margin-top: 4px;">${safeData.ref_hash}</div>
                    <small style="color: var(--muted);">Cryptographic hash of academic references</small>
                </div>
            ` : '';

            document.getElementById("answerText").innerHTML = `
                <div style="margin-bottom: 16px;">${escapeHtml(safeData.answer)}</div>
                ${explanationHtml}
                ${evidenceHtml}
                ${refHashHtml}
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

            // Update human-readable metrics
            document.getElementById("humanClarity").innerText = toHumanClarity(safeData.determinacy);
            document.getElementById("humanHonesty").innerText = toHumanHonesty(safeData.deception_prob);
            document.getElementById("humanDepth").innerText = toHumanDepth(safeData.risk_tags);

            if (safeData.knowledge_search.available) {
                if (safeData.knowledge_search.from_ultimate && safeData.knowledge_search.oracle_response) {
                    const sourceInfo = `
                        <div style="margin-bottom: 16px; padding: 12px; background: rgba(0, 200, 81, 0.1); border-radius: 8px; border-left: 4px solid #00c851;">
                            <div style="font-weight: bold; color: #00c851;">
                                ✅ Answer from Knowledge Base
                            </div>
                            <div style="font-size: 0.9em; color: var(--muted); margin-top: 4px;">
                                Source: ${safeData.knowledge_search.source} | Confidence: ${(safeData.knowledge_search.determinacy * 100).toFixed(1)}%
                            </div>
                        </div>
                    `;
                    document.getElementById("knowledgeList").innerHTML = sourceInfo;
                    document.getElementById("knowledgeResults").style.display = 'block';
                } else if (safeData.knowledge_search.results.length > 0) {
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
    const messageInput = document.getElementById("messageInput");
    const authorInput = document.getElementById("authorInput");
    const postBtn = document.getElementById("postMessageBtn");
    const charCount = document.getElementById("charCount");

    messageInput.addEventListener("input", () => {
        const count = messageInput.value.length;
        charCount.textContent = count;
        charCount.style.color = count > 280 ? "#ff4444" : "#888";
    });

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
                body: JSON.stringify({ message, author })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post message");

            messageInput.value = "";
            authorInput.value = "";
            charCount.textContent = "0";
            charCount.style.color = "#888";

            loadMessages();
            alert("Message posted successfully!");

        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            postBtn.disabled = false;
            postBtn.innerText = "Post Message";
        }
    };

    loadMessages();
}

function wireVerify() {
    const verifyBtn = document.getElementById("verifyBtn");
    const hashInput = document.getElementById("hashInput");
    const verifyRefBtn = document.getElementById("verifyRefBtn");
    const refHashInput = document.getElementById("refHashInput");
    const refJsonInput = document.getElementById("refJsonInput");

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
                const record = data.record || {};
                const safeRecord = {
                    question: safeString(record.question || record.payload?.question, "N/A"),
                    kind: safeString(record.kind || record.payload?.kind, "truth"),
                    determinacy: safeNumber(record.determinacy ?? record.payload?.determinacy, 0),
                    deception_prob: safeNumber(record.deception_prob ?? record.payload?.deception_prob, 0),
                    ref_hash: safeString(record.ref_hash),
                    references: safeArray(record.references),
                    timestamp: record.timestamp
                };
                
                const refHashHtml = safeRecord.ref_hash ? `
                    <p><strong>Reference Hash:</strong> <code>${safeRecord.ref_hash}</code></p>
                    <p><strong>References Count:</strong> ${safeRecord.references.length}</p>
                ` : '<p><strong>Reference Hash:</strong> Not available for this record</p>';
                
                const displayTime = safeTimestamp(safeRecord.timestamp).toLocaleString();
                
                resultContent.innerHTML = `
                <div style="color: #00c851; font-size: 1.2em; margin-bottom: 16px;">
                    VERIFICATION SUCCESSFUL
                </div>
                <div class="verification-details">
                    <p><strong>Record Found:</strong> Yes</p>
                    <p><strong>Chain Integrity:</strong> ${data.chain_valid ? "Valid" : "Compromised"}</p>
                    <p><strong>Timestamp:</strong> ${displayTime}</p>
                    <p><strong>Question:</strong> "${escapeHtml(safeRecord.question)}"</p>
                    <p><strong>Answer Type:</strong> ${safeRecord.kind}</p>
                    <p><strong>Determinacy:</strong> ${safeRecord.determinacy.toFixed(2)}</p>
                    <p><strong>Deception Probability:</strong> ${safeRecord.deception_prob.toFixed(2)}</p>
                    ${refHashHtml}
                </div>
                <div style="margin-top: 16px; padding: 12px; background: rgba(0, 200, 81, 0.1); border-radius: 8px; border-left: 4px solid #00c851;">
                    <small>This record is permanently stored in the immutable audit chain. Any modification would break the cryptographic links.</small>
                </div>
                `;
            } else {
                resultContent.innerHTML = `
                <div style="color: #ff4444; font-size: 1.2em; margin-bottom: 16px;">
                    VERIFICATION FAILED
                </div>
                <p>${data.error || "Hash not found or chain integrity compromised"}</p>
                <div style="margin-top: 16px; padding: 12px; background: rgba(255, 68, 68, 0.1); border-radius: 8px; border-left: 4px solid #ff4444;">
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

    verifyRefBtn.onclick = async () => {
        const refHash = refHashInput.value.trim();
        const refJson = refJsonInput.value.trim();
        
        if (!refHash) {
            alert("Please enter a reference hash to verify.");
            return;
        }

        if (!refJson) {
            alert("Please enter references JSON to verify.");
            return;
        }

        verifyRefBtn.disabled = true;
        verifyRefBtn.innerText = "Verifying References...";

        try {
            const references = JSON.parse(refJson);
            
            const res = await fetch(`${BACKEND_URL}/api/verify_reference_hash`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ hash: refHash, references })
            });

            const data = await res.json();
            
            document.getElementById("verifyResult").style.display = "block";
            const resultContent = document.getElementById("resultContent");
            
            if (data.ok) {
                resultContent.innerHTML = `
                <div style="color: #00c851; font-size: 1.2em; margin-bottom: 16px;">
                    REFERENCE HASH VERIFIED
                </div>
                <div class="verification-details">
                    <p><strong>Reference Hash:</strong> <code>${refHash}</code></p>
                    <p><strong>References Count:</strong> ${references.length}</p>
                    <p><strong>Status:</strong> References match the cryptographic hash</p>
                </div>
                <div style="margin-top: 16px; padding: 12px; background: rgba(0, 200, 81, 0.1); border-radius: 8px; border-left: 4px solid #00c851;">
                    <small>The provided references exactly match the cryptographic hash. No tampering detected.</small>
                </div>
                `;
            } else {
                resultContent.innerHTML = `
                <div style="color: #ff4444; font-size: 1.2em; margin-bottom: 16px;">
                    REFERENCE HASH MISMATCH
                </div>
                <div class="verification-details">
                    <p><strong>Reference Hash:</strong> <code>${refHash}</code></p>
                    <p><strong>References Count:</strong> ${references.length}</p>
                    <p><strong>Status:</strong> References do not match the cryptographic hash</p>
                </div>
                <div style="margin-top: 16px; padding: 12px; background: rgba(255, 68, 68, 0.1); border-radius: 8px; border-left: 4px solid #ff4444;">
                    <small>The provided references do not match the cryptographic hash. This could indicate tampering or incorrect references.</small>
                </div>
                `;
            }
            
        } catch (e) {
            document.getElementById("verifyResult").style.display = "block";
            document.getElementById("resultContent").innerHTML = `
                <div style="color: #ff4444;">Error: Invalid JSON format or network error</div>
                <div style="margin-top: 8px; font-size: 0.9em;">
                    Please check that your references are in valid JSON format: [{"title":"...", "url":"...", "author":"...", "year":"...", "quote":"..."}]
                </div>
            `;
        } finally {
            verifyRefBtn.disabled = false;
            verifyRefBtn.innerText = "Verify Reference Hash";
        }
    };
}

async function verifyReferenceHash(refHash, references) {
    const res = await fetch(`${BACKEND_URL}/api/verify_reference_hash`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ hash: refHash, references })
    });
    return await res.json();
}

// ===== ENHANCED FUNCTIONS =====
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
        
        const sortedRecords = [...data.records].sort((a, b) => {
            const timeA = safeTimestamp(a.timestamp || a.created_at).getTime();
            const timeB = safeTimestamp(b.timestamp || b.created_at).getTime();
            return timeB - timeA;
        });
        
        const displayRecords = sortedRecords.slice(0, 10);
        
        console.log(`📊 Displaying ${displayRecords.length} records (total ${sortedRecords.length})`);
        
        const rows = displayRecords.map(r => {
            const t = safeTimestamp(r.timestamp || r.created_at).toLocaleTimeString();
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
        } else {
            console.error("❌ Cannot find audit chain table tbody element");
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
            
            showVerificationResult(data, hash);
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
    
    const record = data.record || {};
    
    const chainStatus = data.chain_valid ? "Valid" : "Compromised";
    const chainColor = data.chain_valid ? "#00c851" : "#ff4444";
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; color: ${chainColor};">Verification ${data.chain_valid ? "Successful" : "Failed"}</h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1.2em;">×</button>
        </div>
        <div style="margin-bottom: 16px;">
            <p><strong>Hash:</strong> <code>${hash}</code></p>
            <p><strong>Record Found:</strong> ${data.verified ? "Yes" : "No"}</p>
            <p><strong>Chain Integrity:</strong> <span style="color: ${chainColor}">${chainStatus}</span></p>
            <p><strong>Timestamp:</strong> ${safeTimestamp(record.timestamp).toLocaleString()}</p>
            <p><strong>Question:</strong> "${escapeHtml(record.question || 'N/A')}"</p>
            <p><strong>Answer Type:</strong> ${record.kind || 'truth'}</p>
            <p><strong>Determinacy:</strong> ${safeNumber(record.determinacy).toFixed(2)}</p>
            <p><strong>Deception Probability:</strong> ${safeNumber(record.deception_prob).toFixed(2)}</p>
            ${record.ref_hash ? `<p><strong>Reference Hash:</strong> <code>${record.ref_hash}</code></p>` : ''}
        </div>
        <div style="padding: 12px; background: rgba(0, 200, 81, 0.1); border-radius: 8px; border-left: 4px solid #00c851;">
            <small>${data.chain_valid ? 
                "This record is permanently stored in the immutable audit chain. Any modification would break the cryptographic links." : 
                "Warning: Chain integrity compromised. This may indicate tampering or synchronization issues."}</small>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
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
                        Like <span class="like-count">${msg.likes || 0}</span>
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
    return safeTimestamp(timestamp).toLocaleString();
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

// Make functions globally available
window.verifyHashDirectly = verifyHashDirectly;
window.likeMessage = likeMessage;
window.verifyReferenceHash = verifyReferenceHash;