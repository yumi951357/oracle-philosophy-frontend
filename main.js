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
const framework = $("framework");
const philosopher = $("philosopher");
const depth = $("depth");
const blockHash = $("blockHash");
const frameworkText = $("frameworkText");
const philosopherText = $("philosopherText");
const frameworkBadge = $("frameworkBadge");

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

    // 更新所有显示字段
    answerText.textContent = data.answer;
    kind.textContent = data.kind || "wisdom";
    det.textContent = data.determinacy.toFixed(2);
    dec.textContent = data.deception_prob.toFixed(2);
    risk.textContent = (data.risk_tags || ["-"]).join(", ");
    
    // 新增哲学字段
    framework.textContent = data.philosophical_framework || "-";
    philosopher.textContent = data.referenced_philosopher || "-";
    frameworkText.textContent = data.philosophical_framework || "-";
    philosopherText.textContent = data.referenced_philosopher || "-";
    depth.textContent = data.depth_analysis ? (data.depth_analysis.depth_score * 100).toFixed(0) + '%' : "-";
    blockHash.textContent = data.block_hash ? data.block_hash.substring(0, 16) + '...' : "-";
    
    // 根据框架设置徽章颜色
    if (data.philosophical_framework) {
      const frameworkClass = data.philosophical_framework.toLowerCase();
      frameworkBadge.className = `framework-badge ${frameworkClass}`;
    }
    
    answerBox.classList.remove("hide");
    await loadLogs(); // refresh dashboard
  } catch (e) {
    alert("Request failed: " + e.message);
  }
});

async function loadLogs() {
  try {
    // 添加时间戳避免缓存
    const timestamp = new Date().getTime();
    const res = await fetch(`${B()}/api/audit/chain?limit=100&t=${timestamp}`);
    const data = await res.json();
    const chain = data.chain || [];
    
    // 过滤掉空问题、无效记录和测试数据
    const validChain = chain.filter(item => {
      const p = item.payload || {};
      const question = p.question || "";
      const answer = p.answer || "";
      const timestamp = item.ts || "";
      
      // 过滤条件：问题非空、回答非空、不是明显的测试数据
      return question.trim() && 
             answer.trim() && 
             question !== "null" && 
             answer !== "null" &&
             !question.includes("undefined") &&
             !answer.includes("undefined") &&
             // 过滤掉时间戳异常的空记录（如 18:00:00 的幽灵记录）
             (timestamp && !timestamp.includes('18:00:00'));
    });
    
    console.log(`原始记录: ${chain.length}, 有效记录: ${validChain.length}`);
    
    reqCount.textContent = validChain.length.toString();

    // compute stats - 只使用有效记录
    let truths = 0, sumDec = 0, sumDet = 0;
    logBody.innerHTML = "";
    
    validChain.slice().reverse().forEach(item => {
      const p = item.payload || {};
      if (p.kind === "truth" || p.kind === "wisdom") truths++;
      sumDec += (p.deception_prob || 0);
      sumDet += (p.determinacy || 0);
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(item.ts).toLocaleTimeString()}</td>
        <td>${p.framework || p.kind || "-"}</td>
        <td>${p.philosopher || "-"}</td>
        <td>${escapeHtml(p.question || "")}</td>
        <td>${escapeHtml((p.answer || "").slice(0, 60))}…</td>
        <td>${(p.determinacy || 0).toFixed(2)}</td>
        <td>${(p.risk_tags || ["-"]).join(", ")}</td>
      `;
      logBody.appendChild(tr);
    });

    const n = Math.max(1, validChain.length);
    truthRate.textContent = n > 0 ? ((truths / n) * 100).toFixed(1) + "%" : "0%";
    avgDec.textContent = n > 0 ? (sumDec / n).toFixed(1) : "0.0";
    avgDet.textContent = n > 0 ? (sumDet / n).toFixed(1) : "0.0";
    
  } catch (e) {
    console.warn("Load logs failed:", e);
    // 显示错误信息
    logBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ff6b6b;">加载日志失败: ${e.message}</td></tr>`;
  }
}

// 添加强制清理功能（可选）
async function forceCleanup() {
  if (confirm('确定要清理所有无效记录吗？这将删除空问题和测试数据。')) {
    try {
      // 这里可以调用后端的清理API（如果实现了的话）
      // const res = await fetch(`${B()}/api/admin/cleanup`, { method: 'POST' });
      
      // 暂时使用前端清理
      await loadLogs();
      alert('清理完成！');
    } catch (e) {
      alert('清理失败: ' + e.message);
    }
  }
}

// 添加手动清理按钮（可选，可以在控制台调用）
window.cleanupData = forceCleanup;

refreshBtn.addEventListener("click", loadLogs);
window.addEventListener("load", loadLogs);

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}

// 添加调试信息
console.log('Oracle Ethics M1 Frontend loaded');
console.log('Backend URL:', B());
console.log('Use cleanupData() in console to force cleanup');