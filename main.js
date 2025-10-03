// main.js — Oracle Ethics M1 (优化版)
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

// 全局状态管理
let currentValidChain = [];
let currentPage = 1;
const recordsPerPage = 10;
let allValidRecords = [];
let isLoading = false;

// 显示加载状态
function setLoadingState(loading) {
    isLoading = loading;
    if (loading) {
        refreshBtn.textContent = "Loading...";
        refreshBtn.disabled = true;
        // 显示加载指示器
        if (!document.getElementById('loadingIndicator')) {
            const loader = document.createElement('div');
            loader.id = 'loadingIndicator';
            loader.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #888;">
                    <div>Loading wisdom data...</div>
                    <small>数据正在积累中</small>
                </div>
            `;
            logBody.parentNode.insertBefore(loader, logBody);
        }
    } else {
        refreshBtn.textContent = "Refresh Wisdom Log";
        refreshBtn.disabled = false;
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.remove();
    }
}

// 显示错误提示
function showError(message, isFatal = false) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #ffebee;
        border: 1px solid #f44336;
        color: #c62828;
        padding: 12px;
        border-radius: 4px;
        margin: 10px 0;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <strong>加载失败</strong>: ${message}
        ${isFatal ? '<br><button onclick="location.reload()" style="margin-top: 8px; padding: 4px 12px;">重试</button>' : ''}
    `;
    
    if (isFatal) {
        document.body.insertBefore(errorDiv, document.querySelector('main'));
    } else {
        logBody.parentNode.insertBefore(errorDiv, logBody);
    }
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// 初始化默认数据
function initializeDefaultData() {
    // 设置默认值
    reqCount.textContent = "0";
    truthRate.textContent = "—";
    avgDec.textContent = "—";
    avgDet.textContent = "—";
    
    // 显示初始提示
    logBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; color: #888; padding: 40px;">
                <div>📊 数据正在积累中</div>
                <small>向神谕提问来生成第一条记录</small>
            </td>
        </tr>
    `;
    
    // 初始化区块链表格
    if (blockchainBody) {
        blockchainBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #888; padding: 20px;">
                    <div>⛓️ 区块链活动将在此显示</div>
                    <small>每次咨询都会生成新的区块</small>
                </td>
            </tr>
        `;
    }
}

// 强化伦理检测函数
function isUnethicalQuestion(question) {
    const unethicalPatterns = [
        /counterfeit|fake|forge|falsify/i,
        /cheat|deceive|defraud|scam|swindle/i,
        /manipulate|exploit|trick|dupe/i,
        /illegal|unlawful|criminal|felony/i,
        /steal|thief|rob|burglar/i,
        /harm|hurt|injure|violence|attack/i,
        /perfect.*fraud|fraud.*strategy/i,
        /authentic.*counterfeit|counterfeit.*method/i,
        /how to.*cheat|cheat.*system/i,
        /how to.*manipulate|manipulate.*technique/i
    ];
    
    return unethicalPatterns.some(pattern => pattern.test(question));
}

// 伦理警告显示函数
function showEthicalWarning(question) {
    answerText.textContent = "For ethical reasons, I cannot provide guidance on topics involving deception, counterfeiting, illegal activities, or harm. Philosophical wisdom should be used for personal growth and understanding, not for manipulative or harmful purposes. Please consider rephrasing your question to focus on constructive self-improvement.";
    
    kind.textContent = "ethical_protection";
    det.textContent = "1.00";
    dec.textContent = "0.00";
    risk.textContent = "ethical_rejection";
    framework.textContent = "System Ethics";
    philosopher.textContent = "AI Guardian";
    depth.textContent = "100%";
    blockHash.textContent = "eth_protection_" + Date.now();
    frameworkText.textContent = "System Ethics";
    philosopherText.textContent = "AI Guardian";
    
    frameworkBadge.className = "framework-badge ethical";
    answerBox.classList.remove("hide");
}

askBtn.addEventListener("click", async () => {
    const question = (q.value || "").trim();
    const sessionId = (sid.value || "").trim();
    
    if (!question) {
        alert("Please enter a question.");
        return;
    }

    // 强化伦理检测
    if (isUnethicalQuestion(question)) {
        showEthicalWarning(question);
        return;
    }

    try {
        setLoadingState(true);
        const res = await fetch(`${B()}/api/oracle/consult`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ question, sessionId })
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // 更新显示字段
        answerText.textContent = data.answer;
        kind.textContent = data.kind || "wisdom";
        det.textContent = data.determinacy.toFixed(2);
        dec.textContent = data.deception_prob.toFixed(2);
        risk.textContent = (data.risk_tags || ["-"]).join(", ");
        framework.textContent = data.philosophical_framework || "-";
        philosopher.textContent = data.referenced_philosopher || "-";
        frameworkText.textContent = data.philosophical_framework || "-";
        philosopherText.textContent = data.referenced_philosopher || "-";
        
        if (data.depth_analysis && data.depth_analysis.depth_score !== undefined) {
            depth.textContent = (data.depth_analysis.depth_score * 100).toFixed(0) + '%';
        } else {
            depth.textContent = "-";
        }
        
        blockHash.textContent = data.block_hash ? data.block_hash.substring(0, 16) + '...' : "-";
        
        if (data.philosophical_framework) {
            const frameworkClass = data.philosophical_framework.toLowerCase();
            frameworkBadge.className = `framework-badge ${frameworkClass}`;
        }
        
        answerBox.classList.remove("hide");
        await loadLogs();
        
    } catch (e) {
        console.error("Ask oracle failed:", e);
        showError("Failed to get response from oracle: " + e.message);
    } finally {
        setLoadingState(false);
    }
});

async function loadLogs() {
    if (isLoading) return;
    
    try {
        setLoadingState(true);
        const randomParam = Math.random().toString(36).substring(7);
        const res = await fetch(`${B()}/api/audit/chain?limit=200&nocache=${randomParam}`);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const chain = data.chain || [];
        
        // 保存所有有效记录
        allValidRecords = chain.filter(item => {
            if (!item || typeof item !== 'object') return false;
            const p = item.payload || {};
            const question = (p.question || "").trim();
            const answer = (p.answer || "").trim();
            
            return question.length > 0 && 
                   answer.length > 0 &&
                   !question.includes("undefined") &&
                   !answer.includes("undefined") &&
                   p.determinacy !== undefined;
        });
        
        console.log(`总有效记录: ${allValidRecords.length} 条`);
        
        currentValidChain = allValidRecords;
        currentPage = 1;
        
        if (allValidRecords.length === 0) {
            initializeDefaultData();
        } else {
            displayCurrentPage();
            updateStatistics(allValidRecords);
            updateBlockchainTable(allValidRecords);
        }
        
    } catch (e) {
        console.error("Load logs failed:", e);
        showError("Failed to load dashboard data: " + e.message, true);
    } finally {
        setLoadingState(false);
    }
}

// 显示当前页记录
function displayCurrentPage() {
    if (!logBody) return;
    
    logBody.innerHTML = "";
    
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, allValidRecords.length);
    const pageRecords = allValidRecords.slice(startIndex, endIndex);
    
    pageRecords.forEach(item => {
        const p = item.payload || {};
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.ts ? new Date(item.ts).toLocaleTimeString() : '-'}</td>
            <td>${p.framework || p.philosophical_framework || "-"}</td>
            <td>${p.philosopher || p.referenced_philosopher || "-"}</td>
            <td>${escapeHtml(p.question || "")}</td>
            <td>${escapeHtml((p.answer || "").slice(0, 60))}…</td>
            <td>${(p.determinacy || 0).toFixed(2)}</td>
            <td class="risk-${(p.risk_tags?.[0] || 'low_risk').replace('_', '-')}">${(p.risk_tags || ["low_risk"]).join(", ")}</td>
        `;
        logBody.appendChild(tr);
    });
    
    addPaginationControls();
}

// 添加分页控件
function addPaginationControls() {
    const existingPagination = document.getElementById('paginationControls');
    if (existingPagination) existingPagination.remove();
    
    if (allValidRecords.length <= recordsPerPage) return;
    
    const totalPages = Math.ceil(allValidRecords.length / recordsPerPage);
    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'paginationControls';
    paginationDiv.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
        gap: 10px;
        flex-wrap: wrap;
    `;
    
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Previous';
        prevBtn.className = 'secondary-btn';
        prevBtn.onclick = () => {
            currentPage--;
            displayCurrentPage();
        };
        paginationDiv.appendChild(prevBtn);
    }
    
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${allValidRecords.length} total records)`;
    pageInfo.style.cssText = 'color: #888; font-size: 14px; padding: 0 10px;';
    paginationDiv.appendChild(pageInfo);
    
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next →';
        nextBtn.className = 'secondary-btn';
        nextBtn.onclick = () => {
            currentPage++;
            displayCurrentPage();
        };
        paginationDiv.appendChild(nextBtn);
    }
    
    const dashboardSection = document.getElementById('dashboard');
    const tableContainer = dashboardSection.querySelector('.table-container');
    tableContainer.parentNode.insertBefore(paginationDiv, tableContainer.nextSibling);
}

// 更新统计信息
function updateStatistics(validChain) {
    let truths = 0, sumDec = 0, sumDet = 0;
    
    validChain.forEach(item => {
        const p = item.payload || {};
        const kind = p.kind || "wisdom";
        if (kind === "truth" || kind === "wisdom" || kind === "insight") truths++;
        sumDec += (p.deception_prob || 0);
        sumDet += (p.determinacy || 0);
    });

    const n = Math.max(1, validChain.length);
    
    reqCount.textContent = validChain.length.toString();
    const calculatedRate = n > 0 ? ((truths / n) * 100) : 0;
    truthRate.textContent = calculatedRate > 0 ? calculatedRate.toFixed(1) + "%" : "0%";
    avgDec.textContent = (sumDec / n).toFixed(1);
    avgDet.textContent = (sumDet / n).toFixed(1);
}

// 更新区块链活动表格
function updateBlockchainTable(validChain) {
    if (!blockchainBody) return;
    
    // 修复区块链数据过滤
    const blockchainData = validChain.filter(item => {
        const p = item.payload || {};
        return p.question && p.answer && item.ts;
    });
    
    blockchainBody.innerHTML = '';
    
    if (blockchainData.length === 0) {
        blockchainBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #888; padding: 20px;">
                    <div>⛓️ 等待区块链活动</div>
                    <small>咨询神谕来生成区块</small>
                </td>
            </tr>
        `;
        return;
    }
    
    // 显示最新的4条记录
    const recentEntries = blockchainData.slice(-4).reverse();
    recentEntries.forEach((entry, index) => {
        const p = entry.payload || {};
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${String(blockchainData.length - index).padStart(3, '0')}</td>
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

// 强力清理函数
async function hardReset() {
    if (confirm('⚠️ 强力清理！这将删除所有记录并重置系统。确定继续吗？')) {
        try {
            localStorage.clear();
            sessionStorage.clear();
            currentValidChain = [];
            allValidRecords = [];
            currentPage = 1;
            await loadLogs();
            setTimeout(() => window.location.reload(true), 1000);
            alert('系统已重置！');
        } catch (e) {
            alert('重置失败: ' + e.message);
        }
    }
}

// 诊断函数
async function diagnoseData() {
    try {
        const res = await fetch(`${B()}/api/audit/chain?limit=100`);
        const data = await res.json();
        console.log('=== 数据诊断 ===');
        console.log('原始记录数量:', data.chain.length);
        console.log('区块链数据样本:', data.chain.slice(0, 3));
    } catch (e) {
        console.error('诊断失败:', e);
    }
}

// 暴露工具函数
window.hardReset = hardReset;
window.diagnoseData = diagnoseData;
window.getCurrentData = () => currentValidChain;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // 路由监听
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#dashboard') {
            loadLogs();
        }
    });
    
    // 初始化数据
    initializeDefaultData();
    loadLogs();
});

refreshBtn.addEventListener("click", loadLogs);

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
    }[c]));
}

console.log('Oracle Ethics M1 Frontend - 优化版已加载');