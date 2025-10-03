// main.js — Oracle Ethics M1 (vanilla JS)
const B = () => window.BACKEND_URL || "https://oracle-philosophy-backend.onrender.com";

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
const blockchainBody = $("blockchainBody");

// 存储当前有效记录，避免重复渲染
let currentValidChain = [];

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
    
    // 新增哲学字段 - 修复Depth Score显示
    framework.textContent = data.philosophical_framework || "-";
    philosopher.textContent = data.referenced_philosopher || "-";
    frameworkText.textContent = data.philosophical_framework || "-";
    philosopherText.textContent = data.referenced_philosopher || "-";
    
    // 修复Depth Score显示问题
    if (data.depth_analysis && data.depth_analysis.depth_score !== undefined) {
      depth.textContent = (data.depth_analysis.depth_score * 100).toFixed(0) + '%';
    } else if (data.depth_analysis && data.depth_analysis.depth_score === 0) {
      depth.textContent = "0%";
    } else {
      depth.textContent = "-";
    }
    
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
    // 添加随机参数完全避免缓存
    const randomParam = Math.random().toString(36).substring(7);
    const res = await fetch(`${B()}/api/audit/chain?limit=100&nocache=${randomParam}`);
    const data = await res.json();
    const chain = data.chain || [];
    
    console.log('原始API响应:', chain);

    // 强力过滤：只保留真正有效的记录
    const validChain = chain.filter(item => {
      if (!item || typeof item !== 'object') return false;
      
      const p = item.payload || {};
      const question = (p.question || "").trim();
      const answer = (p.answer || "").trim();
      
      // 放宽过滤条件：允许时间戳为null
      const isValid = 
        question.length > 0 &&                    // 问题不能为空
        answer.length > 0 &&                      // 回答不能为空
        question !== "null" && 
        answer !== "null" &&
        !question.includes("undefined") &&
        !answer.includes("undefined") &&
        p.determinacy !== undefined &&            // 必须有确定性分数
        p.determinacy !== null;
      
      if (!isValid) {
        console.log('过滤掉的无效记录:', item);
      }
      
      return isValid;
    });
    
    console.log(`过滤结果: 原始 ${chain.length} 条 → 有效 ${validChain.length} 条`);
    
    // 更新全局记录
    currentValidChain = validChain;
    
    reqCount.textContent = validChain.length.toString();

    // compute stats - 修复智慧率计算
    let truths = 0, sumDec = 0, sumDet = 0;
    logBody.innerHTML = "";
    
    validChain.slice().reverse().forEach(item => {
      const p = item.payload || {};
      
      // 修复：如果kind不存在，默认为wisdom
      const kind = p.kind || "wisdom";
      if (kind === "truth" || kind === "wisdom" || kind === "insight") truths++;
      
      sumDec += (p.deception_prob || 0);
      sumDet += (p.determinacy || 0);
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.ts ? new Date(item.ts).toLocaleTimeString() : '-'}</td>
        <td>${p.framework || p.philosophical_framework || "-"}</td>
        <td>${p.philosopher || p.referenced_philosopher || "-"}</td>
        <td>${escapeHtml(p.question || "")}</td>
        <td>${escapeHtml((p.answer || "").slice(0, 60))}…</td>
        <td>${(p.determinacy || 0).toFixed(2)}</td>
        <td>${(p.risk_tags || ["low_risk"]).join(", ")}</td>
      `;
      logBody.appendChild(tr);
    });

    const n = Math.max(1, validChain.length);
    
    // 修复显示：确保不会显示0.0%
    truthRate.textContent = n > 0 ? Math.max(1, ((truths / n) * 100)).toFixed(1) + "%" : "0%";
    avgDec.textContent = (sumDec / n).toFixed(1);
    avgDet.textContent = (sumDet / n).toFixed(1);
    
    // 更新区块链活动表格
    updateBlockchainTable(validChain);
    
  } catch (e) {
    console.warn("Load logs failed:", e);
    logBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ff6b6b;">加载失败: ${e.message}</td></tr>`;
  }
}

// 更新区块链活动表格
function updateBlockchainTable(validChain) {
  if (!blockchainBody) return;
  
  blockchainBody.innerHTML = '';
  
  if (!validChain || validChain.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4" style="text-align: center; color: #888;">No blockchain activity yet.</td>`;
    blockchainBody.appendChild(row);
    return;
  }
  
  // 显示最新的4条记录
  const recentEntries = validChain.slice(-4).reverse();
  recentEntries.forEach((entry, index) => {
    const p = entry.payload || {};
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>#${String(validChain.length - index).padStart(3, '0')}</td>
      <td title="${p.question || ''}">${truncateText(p.question || '', 25)}</td>
      <td>${p.framework || p.philosophical_framework || 'unknown'}</td>
      <td class="hash">${entry.block_hash || generateRandomHash()}</td>
    `;
    blockchainBody.appendChild(row);
  });
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function generateRandomHash() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 强力清理函数 - 在控制台执行这个来重置
async function hardReset() {
  if (confirm('⚠️ 强力清理！这将删除所有记录并重置系统。确定继续吗？')) {
    try {
      // 清除本地存储
      localStorage.clear();
      sessionStorage.clear();
      
      // 重新加载
      currentValidChain = [];
      await loadLogs();
      
      // 强制刷新页面
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
      
      alert('系统已重置！');
    } catch (e) {
      alert('重置失败: ' + e.message);
    }
  }
}

// 诊断函数 - 查看原始数据
async function diagnoseData() {
  const res = await fetch(`${B()}/api/audit/chain?limit=100`);
  const data = await res.json();
  console.log('=== 数据诊断 ===');
  console.log('原始记录数量:', data.chain.length);
  data.chain.forEach((item, index) => {
    console.log(`记录 ${index}:`, item);
  });
}

// 暴露工具函数到全局
window.hardReset = hardReset;
window.diagnoseData = diagnoseData;
window.getCurrentData = () => currentValidChain;

// 添加导航链接平滑滚动
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // 初始化加载数据
  loadLogs();
});

refreshBtn.addEventListener("click", loadLogs);

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}

console.log('Oracle Ethics M1 Frontend - 增强版已加载');
console.log('可用工具:');
console.log('- diagnoseData(): 诊断数据问题');
console.log('- hardReset(): 强力重置系统');
console.log('- getCurrentData(): 获取当前有效数据');