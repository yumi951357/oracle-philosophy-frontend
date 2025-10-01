// --- Backend base URL ---
// If not set, will read from localStorage, then fallback to same-origin.
let BACKEND_BASE = "";

function loadBackendBase() {
  const input = document.getElementById("backendInput");
  const saved = localStorage.getItem("backendBase");
  if (saved) {
    BACKEND_BASE = saved;
    input.value = saved;
  } else {
    // same-origin fallback
    BACKEND_BASE = window.location.origin;
    input.placeholder = BACKEND_BASE.replace(/^http:/, "https:");
  }
}
function saveBackendBase() {
  const v = document.getElementById("backendInput").value.trim();
  if (v) {
    BACKEND_BASE = v.replace(/\/+$/, "");
    localStorage.setItem("backendBase", BACKEND_BASE);
    document.getElementById("backendStatus").textContent = "Saved.";
    setTimeout(()=> document.getElementById("backendStatus").textContent="", 1200);
  }
}

// --- Stars background ---
(function stars(){
  const c = document.getElementById("stars");
  const ctx = c.getContext("2d");
  let w,h,stars=[];
  function resize(){ w=c.width=window.innerWidth; h=c.height=document.querySelector(".hero").offsetHeight; }
  function init(){
    stars = Array.from({length: 120}, ()=>({
      x: Math.random()*w, y: Math.random()*h, z: Math.random()*0.7+0.3, s: Math.random()*1.5+0.3
    }));
  }
  function loop(){
    ctx.clearRect(0,0,w,h);
    for(const st of stars){
      ctx.fillStyle = rgba(120,170,255,${0.4+st.z*0.6});
      ctx.beginPath(); ctx.arc(st.x, st.y, st.s, 0, Math.PI*2); ctx.fill();
      st.x += 0.02*st.z; if(st.x>w) st.x=0;
    }
    requestAnimationFrame(loop);
  }
  window.addEventListener("resize", ()=>{resize(); init();});
  resize(); init(); loop();
})();

// --- Utilities ---
function pretty(n, digits=2) {
  if (n === null  n === undefined  isNaN(n)) return "—";
  return Number(n).toFixed(digits);
}
function esc(s){ return (s||"").toString().replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function when(el, ev, cb){ el.addEventListener(ev, cb); }

// --- Oracle Demo ---
async function askOracle() {
  const q = document.getElementById("question").value.trim();
  if (!q) return alert("Please input a question.");
  const url = ${BACKEND_BASE}/api/oracle;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ question: q })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    // expected: { answer, truth_likelihood, deception_probability, risk_score, ledger_hash, tag, timestamp }
    document.getElementById("oracleResult").classList.remove("hidden");
    document.getElementById("ans").textContent = data.answer ?? "—";
    document.getElementById("truthScore").textContent = pretty(data.truth_likelihood);
    document.getElementById("deceptionProb").textContent = pretty(data.deception_probability);
    document.getElementById("riskScore").textContent = pretty(data.risk_score);
    document.getElementById("hash").textContent = data.ledger_hash ?? "—";
    document.getElementById("tag").textContent = data.tag ?? "—";
    document.getElementById("ts").textContent = data.timestamp ?? new Date().toISOString();
  } catch (e) {
    alert("Oracle failed: " + e.message);
  }
}

// --- Dashboard ---
async function loadLogs() {
  const url = ${BACKEND_BASE}/api/logs;
  const type = document.getElementById("fType").value;
  const minRisk = parseFloat(document.getElementById("fRisk").value || "0");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json(); // expect array
    const list = document.getElementById("logList");
    list.innerHTML = "";

    rows
      .filter(x => !type  (x.type  "").toLowerCase() === type.toLowerCase())
      .filter(x => (x.risk_score ?? 0) >= minRisk)
      .slice(-200) // last 200
      .reverse()
      .forEach(x => {
        const badgeClass =
          (x.type === "deception") ? "err" : (x.risk_score >= 0.6 ? "warn" : "ok");
        const card = document.createElement("div");
        card.
className = "card";
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span class="badge ${badgeClass}">${esc(x.type || "truth")}</span>
            <span class="k">${esc(x.timestamp || "")}</span>
          </div>
          <div class="k">Q</div>
          <div style="margin-bottom:8px">${esc(x.question || "")}</div>
          <div class="k">A</div>
          <div style="margin-bottom:8px">${esc(x.answer || "")}</div>
          <div class="k">Risk · Deception · Truth</div>
          <div style="margin-bottom:8px"><code>${pretty(x.risk_score)} · ${pretty(x.deception_probability)} · ${pretty(x.truth_likelihood)}</code></div>
          <div class="k">Ledger</div>
          <div><code>${esc(x.ledger_hash || "—")}</code></div>
        `;
        list.appendChild(card);
      });

  } catch (e) {
    alert("Load logs failed: " + e.message);
  }
}

// --- Documents viewer ---
function openDoc(name) {
  const wrap = document.getElementById("docViewer");
  const frame = document.getElementById("docFrame");
  const fb = document.getElementById("docFallback");
  const label = document.getElementById("docName");
  label.textContent = name;
  wrap.classList.remove("hidden");
  fb.classList.add("hidden");
  const url = ./docs/${name};
  // try fetch first to decide fallback
  fetch(url, { method: "HEAD" })
    .then(r => {
      if (r.ok) {
        frame.src = url;
      } else {
        frame.src = "about:blank";
        fb.classList.remove("hidden");
      }
    })
    .catch(() => {
      frame.src = "about:blank";
      fb.classList.remove("hidden");
    });
}

// --- Wire up ---
window.addEventListener("DOMContentLoaded", () => {
  // footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  loadBackendBase();
  when(document.getElementById("saveBackend"), "click", saveBackendBase);
  when(document.getElementById("askBtn"), "click", askOracle);

  when(document.getElementById("reload"), "click", loadLogs);
  loadLogs();

  // docs
  document.querySelectorAll("[data-doc]").forEach(btn => {
    btn.addEventListener("click", () => openDoc(btn.getAttribute("data-doc")));
  });
  document.getElementById("closeDoc").addEventListener("click", () => {
    document.getElementById("docViewer").classList.add("hidden");
    document.getElementById("docFrame").src = "about:blank";
  });
});