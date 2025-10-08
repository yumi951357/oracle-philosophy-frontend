// ===== REQUEST LOCK SYSTEM =====
window.requestLocks = new Map();
window.requestQueue = [];
window.maxConcurrentRequests = 2; // Maximum 2 concurrent requests

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
    
    // Prevent zoom on iOS
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
            
            <!-- Knowledge Search Results -->
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
        <div class="panel futuristic">
            <div class="vision-header">
                <h1>Oracle Ethics M1.5</h1>
                <div class="glow-text">Building Trustworthy AI for the Future</div>
            </div>
            
            <div class="manifesto-section">
                <h2>Our Vision</h2>
                <p>In an era of information explosion and algorithmic black boxes, truth and trust have become scarce resources. Oracle Ethics is not just a Q&A tool, but a new paradigm for AI design: transparent, verifiable, and immutable.</p>
            </div>

            <div class="manifesto-section">
                <h2>Our Mission</h2>
                <p>Build the world's first AI system that is:</p>
                <ul class="mission-list">
                    <li>Self-auditing with blockchain-style audit logs</li>
                    <li>Equipped with multi-layer risk and deception detection</li>
                    <li>Independently verifiable by users</li>
                    <li>Creates the first "trustworthy oracle" that can prove its own honesty</li>
                </ul>
            </div>

            <div class="core-principles">
                <h2>Core Principles</h2>
                <div class="principles-grid">
                    <div class="principle-card">
                        <h3>Transparency</h3>
                        <p>Every answer generates an audit record, publicly accessible and traceable.</p>
                    </div>
                    <div class="principle-card">
                        <h3>Verifiability</h3>
                        <p>Users can verify answer integrity through cryptographic hashes.</p>
                    </div>
                    <div class="principle-card">
                        <h3>Multi-perspective</h3>
                        <p>Each question receives answers from multiple philosophical frameworks with risk assessments.</p>
                    </div>
                    <div class="principle-card">
                        <h3>Self-evolution</h3>
                        <p>Future versions will feature introspection mechanisms for enhanced reliability.</p>
                    </div>
                </div>
            </div>

            <div class="manifesto-section">
                <h2>What Makes Us Different</h2>
                <div class="differentiation">
                    <div class="diff-item">
                        <strong>Other AIs are black boxes;</strong> We are glass boxes (auditable, traceable)
                    </div>
                    <div class="diff-item">
                        <strong>Other AIs disappear after answering;</strong> We preserve verifiable "Wisdom Logs"
                    </div>
                    <div class="diff-item">
                        <strong>Other AIs just output;</strong> We self-inspect and label deception/risk scores before output
                    </div>
                </div>
            </div>

            <div class="roadmap">
                <h2>Our Roadmap</h2>
                <div class="timeline">
                    <div class="timeline-item current">
                        <div class="timeline-marker">Now</div>
                        <div class="timeline-content">
                            <h3>M1.5 - NOW</h3>
                            <p>Trustworthy Q&A + Audit Chains (Currently Live)</p>
                        </div>
                    </div>
                    <div class="timeline-item future">
                        <div class="timeline-marker">Next</div>
                        <div class="timeline-content">
                            <h3>M2 - NEXT</h3>
                            <p>Internal Self-check Engine + Advanced Risk Assessment</p>
                        </div>
                    </div>
                    <div class="timeline-item future">
                        <div class="timeline-marker">Future</div>
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
                    <footer>Oracle Ethics Manifesto</footer>
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

// ===== LOGIC =====
function wireOracle() {
    const btn = document.getElementById("askBtn");
    const qEl = document.getElementById("q");
    const sidEl = document.getElementById("sid");

    btn.onclick = async () => {
        const question = qEl.value.trim();
        if (!question) return alert("Please enter a question.");
        
        // ✅ IMMEDIATE FIX: Add request lock
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
            // Show loading state for knowledge search
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
            
            // ✅ IMMEDIATE FIX: Add timeout handling
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Request timeout")), 30000)
            );
            
            const data = await Promise.race([res.json(), timeoutPromise]);
            
            if (!res.ok) throw new Error(data.error || "Request failed");

            // Show answer panel
            document.getElementById("answerPanel").style.display = "block";

            // Safe data extraction
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

            // Update answer display
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

            // Main answer display
            document.getElementById("answerText").innerHTML = `
                <div style="margin-bottom: 16px;">${escapeHtml(safeData.answer)}</div>
                ${explanationHtml}
                ${evidenceHtml}
                ${refHashHtml}
            `;
            
            // Update UI with safe data
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

            // Display knowledge search results - fixed version
            if (safeData.knowledge_search.available) {
                if (safeData.knowledge_search.from_ultimate && safeData.knowledge_search.oracle_response) {
                    // If from ultimate search and has Oracle response, show source info
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
                    
                    console.log(`✅ Using ultimate search answer from: ${safeData.knowledge_search.source}`);
                } else if (safeData.knowledge_search.results.length > 0) {
                    // Display regular search results
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
                    
                    console.log(`📚 Found ${safeData.knowledge_search.results_count} relevant documents`);
                } else {
                    document.getElementById("knowledgeResults").style.display = 'none';
                    console.log("📚 No relevant documents found");
                }
            } else {
                document.getElementById("knowledgeResults").style.display = 'none';
                console.log("📚 Knowledge search not available");
            }

            // ✅ FIX: Force reload audit chain with delay to ensure backend has saved
            setTimeout(async () => {
                await loadChain();
                console.log("✅ Audit chain reloaded after new question");
            }, 500);

        } catch (e) {
            console.error("❌ Request failed:", e);
            alert("Error: " + e.message);
        } finally {
            // ✅ IMMEDIATE FIX: Ensure lock is released
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
    // ✅ IMMEDIATE FIX: Add chain loading lock
    if (!acquireLock('loadChain')) {
        return;
    }
    
    try {
        console.log("🔍 Loading audit chain...");
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const res = await fetch(`${BACKEND_URL}/api/audit/chain?t=${timestamp}`);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const data = await res.json();
        
        console.log(`🔍 Audit chain API response:`, data);
        
        if (!data.records) {
            throw new Error("Audit chain data format error");
        }
        
        // Ensure sorting by time in descending order (newest first)
        const sortedRecords = [...data.records].sort((a, b) => {
            const timeA = safeTimestamp(a.timestamp || a.created_at).getTime();
            const timeB = safeTimestamp(b.timestamp || b.created_at).getTime();
            return timeB - timeA; // Newest first
        });
        
        // Only show the latest 10 records
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
        // ✅ IMMEDIATE FIX: Release lock
        releaseLock('loadChain');
    }
}

async function verifyHashDirectly(hash, event) {
    // ✅ IMMEDIATE FIX: Add verification lock
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
        
        // ✅ FIX: Add timestamp to prevent caching
        const res = await fetch(`${BACKEND_URL}/api/verify/${hash}?t=${Date.now()}`);
        const data = await res.json();
        
        console.log("🔍 Verification response:", data);
        
        if (data.verified) {
            verifyBtn.innerHTML = 'Verified';
            verifyBtn.style.background = 'rgba(0, 200, 81, 0.2)';
            verifyBtn.style.color = '#00c851';
            
            // ✅ FIX: Show correct verification result
            showVerificationResult(data, hash);
        } else {
            verifyBtn.innerHTML = 'Failed';
            verifyBtn.style.background = 'rgba(255, 68, 68, 0.2)';
            verifyBtn.style.color = '#ff4444';
            
            // ✅ FIX: Show detailed error message
            alert(`Verification failed: ${data.error || 'Unknown error'}`);
        }
        
    } catch (e) {
        console.error("❌ Verification error:", e);
        verifyBtn.innerHTML = 'Error';
        verifyBtn.style.background = 'rgba(255, 68, 68, 0.2)';
        verifyBtn.style.color = '#ff4444';
        alert("Verification error: " + e.message);
    } finally {
        // ✅ IMMEDIATE FIX: Reset button state after 2 seconds
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
    
    // ✅ FIX: Correctly display chain integrity status
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