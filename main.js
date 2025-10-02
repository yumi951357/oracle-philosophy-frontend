// main.js — Oracle Ethics M1 (vanilla JS)
const B = () => window.BACKEND_URL || "";

const $ = (id) => document.getElementById(id);
const askBtn = $("askBtn");
const refreshBtn = $("refreshBtn");
const q = $("q");
const sid = $("sid");

const answerBox = $("answerBox");
const answerText = $("answerText");
const kind = $("kind");
const det = $("det");
const dec = $("dec");
const risk = $("risk");

const reqCount = $("reqCount");
const truthRate = $("truthRate");
const avgDec = $("avgDec");
const avgDet = $("avgDet");
const logBody = $("logBody");

askBtn.addEventListener("click", async () => {
  const question = (q.value || "").trim();
  const sessionId = (sid.value || "").trim();
  if (!question) {
    alert("Please enter a question.");
    return;
  }
  try {
    const res = await fetch(`${B()}/api/oracle/consult`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ question, sessionId })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    answerText.textContent = data.answer;
    kind.textContent = data.kind;
    det.textContent = data.determinacy.toFixed(2);
    dec.textContent = data.deception_prob.toFixed(2);
    risk.textContent = (data.risk_tags || ["-"]).join(", "); // 修复这行
    answerBox.classList.remove("hide");
    await loadLogs(); // refresh dashboard
  } catch (e) {
    alert("Request failed: " + e.message);
  }
});

async function loadLogs() {
  try {
    const res = await fetch(`${B()}/api/audit/chain?limit=100`);
    const data = await res.json();
    const chain = data.chain || [];
    reqCount.textContent = chain.length.toString();

    // compute stats
    let truths = 0, sumDec = 0, sumDet = 0;
    logBody.innerHTML = "";
    chain.slice().reverse().forEach(item => {
      const p = item.payload || {};
      if (p.kind === "truth") truths++;
      sumDec += (p.deception_prob || 0);
      sumDet += (p.determinacy || 0);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(item.ts).toLocaleTimeString()}</td>
        <td>${p.kind || "-"}</td>
        <td>${escapeHtml(p.question || "")}</td>
        <td>${escapeHtml((p.answer || "").slice(0, 80))}…</td>
        <td>${(p.determinacy || 0).toFixed(2)}</td>
        <td>${(p.deception_prob || 0).toFixed(2)}</td>
        <td>${(p.risk_tags || ["-"]).join(", ")}</td> <!-- 修复这行 -->
      `;
      logBody.appendChild(tr);
    });

    const n = Math.max(1, chain.length);
    truthRate.textContent = ((truths / n) * 100).toFixed(1) + "%";
    avgDec.textContent = (sumDec / n).toFixed(1);
    avgDet.textContent = (sumDet / n).toFixed(1);
  } catch (e) {
    console.warn("Load logs failed:", e);
  }
}

refreshBtn.addEventListener("click", loadLogs);
window.addEventListener("load", loadLogs);

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}