// ===== CONFIG =====
const BACKEND_URL = "https://YOUR-RENDER-BACKEND.onrender.com"; // <-- set yours

// ===== SIMPLE ROUTER =====
const routes = {
  oracle: renderOracle,
  docs: renderDocs,
  contact: renderContact
};

function mount() {
  const hash = (location.hash || "#oracle").replace("#", "");
  const view = routes[hash] || renderOracle;
  document.getElementById("app").innerHTML = view();
  if (hash === "oracle") wireOracle();
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
      <h1>Docs</h1>
      <p>Core idea: verifiable AI ethics — every answer is logged into a tamper-evident audit chain.</p>
      <ul>
        <li><a href="./whitepaper.pdf" target="_blank">Whitepaper (PDF)</a></li>
        <li><a href="./handbook.pdf" target="_blank">Ritual Handbook (PDF)</a></li>
        <li><a href="https://github.com/your-frontend-repo" target="_blank">Frontend Repo</a></li>
      </ul>
    </div>
  </div>`;
}

function renderContact() {
  return `
  <div class="container">
    <div class="panel">
      <h1>Contact</h1>
      <p>Email: renshijian0258@proton.me</p>
      <p>Telegram: renshijian0</p>
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

    btn.disabled = true; btn.innerText = "Thinking…";
    try {
      const res = await fetch(`${BACKEND_URL}/api/consult`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ question, session_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      document.getElementById("answerPanel").style.display = "block";
      document.getElementById("answerText").innerText = data.answer;
      const badge = document.getElementById("kindBadge");
      badge.innerText = data.kind;
      badge.className =     <a href="#contact

      document.getElementById("det").innerText = data.determinacy.toFixed(2);
      document.getElementById("dec").innerText = data.deception_prob.toFixed(2);
      document.getElementById("risk").innerText = (data.risk_tags || []).join(", ");
      document.getElementById("hash").innerText = data.hash;
      document.getElementById("prev").innerText = data.prev_hash;
      document.
getElementById("ts").innerText = new Date(data.timestamp*1000).toISOString();

      await loadChain();
    } catch (e) {
      alert(e.message);
    } finally {
      btn.disabled = false; btn.innerText = "Seek the Truth";
    }
  };

  loadChain();
}

async function loadChain() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/audit/chain`);
    const data = await res.json();
    const rows = (data.records || []).slice(-10).reverse().map(r => {
      const t = new Date(r.timestamp*1000).toLocaleTimeString();
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
  } catch(e){
    document.querySelector("#chainTable tbody").innerHTML = "<tr><td colspan='6'>Failed to load chain</td></tr>";
  }
}

function truncate(s, n){ return (s || "").length > n ? s.slice(0,n) + "…" : s }
function escapeHtml(s){ return (s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])) }
