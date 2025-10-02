const API_BASE = "https://oracle-philosophy-backend.onrender.com";

document.getElementById("consult-btn").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  const sessionId = document.getElementById("session-id").value || "web_demo";

  try {
    const response = await fetch(`${API_BASE}/api/oracle/consult`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, session_id: sessionId })
    });

    const data = await response.json();
    document.getElementById("oracle-output").innerText = data.answer || "No response";
    document.getElementById("determinacy").innerText = data.determinacy_index;
    document.getElementById("deception").innerText = data.deception_probability;
    document.getElementById("risk-tags").innerText = data.risk_tags.join(", ");
    document.getElementById("timestamp").innerText = data.timestamp;
  } catch (err) {
    document.getElementById("oracle-output").innerText = "⚠️ Failed to reach backend.";
  }
});

// 加载审计链
async function loadAuditChain() {
  try {
    const response = await fetch(`${API_BASE}/api/audit/chain`);
    const chain = await response.json();

    let html = "<h3>Audit Chain</h3><ul>";
    chain.forEach(block => {
      html += <li>Block ${block.index} | ${block.hash.slice(0,10)}... | ${block.timestamp}</li>;
    });
    html += "</ul>";
    document.getElementById("audit-chain").innerHTML = html;
  } catch {
    document.getElementById("audit-chain").innerText = "⚠️ Audit chain unavailable.";
  }
}
loadAuditChain();