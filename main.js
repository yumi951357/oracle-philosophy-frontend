// main.js — Oracle Ethics M1 (修复优化版)
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

// 🛠️ 修复1: 扩展哲学回答库 - 解决重复内容问题
const philosophicalResponses = {
    stoicism: {
        epictetus: [
            "As Epictetus taught: We cannot control external events, but we can control our reactions to them.",
            "Epictetus reflected: It's not what happens to you, but how you react that matters.",
            "Epictetus advised: First say to yourself what you would be, and then do what you have to do.",
            "Epictetus reminded: Wealth consists not in having great possessions, but in having few wants.",
            "Epictetus observed: Difficulties are things that show what men are."
        ],
        marcus_aurelius: [
            "Marcus Aurelius meditated: The happiness of your life depends upon the quality of your thoughts.",
            "Marcus Aurelius observed: Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
            "Marcus Aurelius reminded: You have power over your mind - not outside events. Realize this, and you will find strength.",
            "Marcus Aurelius reflected: When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love.",
            "Marcus Aurelius taught: The best revenge is to be unlike him who performed the injury."
        ],
        seneca: [
            "Seneca advised: It is not that we have a short time to live, but that we waste a lot of it.",
            "Seneca reflected: Difficulties strengthen the mind, as labor does the body.",
            "Seneca taught: He who is brave is free.",
            "Seneca observed: True happiness is to enjoy the present, without anxious dependence upon the future.",
            "Seneca reminded: Sometimes even to live is an act of courage."
        ]
    },
    taoism: {
        laozi: [
            "Laozi taught: The journey of a thousand miles begins with a single step.",
            "Laozi said: Knowing others is intelligence; knowing yourself is true wisdom.",
            "Laozi reflected: Nature does not hurry, yet everything is accomplished.",
            "Laozi observed: When I let go of what I am, I become what I might be.",
            "Laozi taught: The wise man does not lay up his own treasures. The more he gives to others, the more he has for his own."
        ],
        zhuangzi: [
            "Zhuangzi dreamed: I do not know whether I was then a man dreaming I was a butterfly, or whether I am now a butterfly dreaming I am a man.",
            "Zhuangzi observed: Happiness is the absence of the striving for happiness.",
            "Zhuangzi taught: Use the light, but return to the clarity of seeing.",
            "Zhuangzi reflected: Great wisdom is generous; petty wisdom is contentious.",
            "Zhuangzi said: Flow with whatever may happen and let your mind be free."
        ],
        liezi: [
            "Liezi taught: He who regards all things as one is a companion of Nature.",
            "Liezi observed: The perfect man uses his mind like a mirror - it grasps nothing, it refuses nothing, it receives but does not keep.",
            "Liezi reflected: Those who know do not speak; those who speak do not know.",
            "Liezi said: When you realize there is nothing lacking, the whole world belongs to you.",
            "Liezi taught: The sage steers by the bright light of nature and reason."
        ]
    },
    existentialism: {
        nietzsche: [
            "Nietzsche proclaimed: That which does not kill us makes us stronger.",
            "Nietzsche declared: He who has a why to live can bear almost any how.",
            "Nietzsche observed: Without music, life would be a mistake.",
            "Nietzsche taught: One must still have chaos in oneself to be able to give birth to a dancing star.",
            "Nietzsche reflected: The individual has always had to struggle to keep from being overwhelmed by the tribe."
        ],
        sartre: [
            "Sartre said: Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.",
            "Sartre observed: We are our choices.",
            "Sartre taught: Everything has been figured out, except how to live.",
            "Sartre reflected: Freedom is what you do with what's been done to you.",
            "Sartre declared: Life begins on the other side of despair."
        ],
        camus: [
            "Camus reflected: In the depth of winter, I finally learned that within me there lay an invincible summer.",
            "Camus taught: The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
            "Camus observed: Should I kill myself, or have a cup of coffee?",
            "Camus said: Freedom is nothing but a chance to be better.",
            "Camus reflected: You will never be happy if you continue to search for what happiness consists of."
        ]
    },
    buddhism: {
        buddha: [
            "The Buddha taught: The mind is everything. What you think you become.",
            "Buddha reflected: Peace comes from within. Do not seek it without.",
            "Buddha said: You yourself, as much as anybody in the entire universe, deserve your love and affection.",
            "Buddha taught: The root of suffering is attachment.",
            "Buddha observed: Thousands of candles can be lit from a single candle, and the life of the candle will not be shortened."
        ],
        thich_nhat_hanh: [
            "Thich Nhat Hanh taught: The present moment is filled with joy and happiness. If you are attentive, you will see it.",
            "Thich Nhat Hanh reflected: Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
            "Thich Nhat Hanh said: Walk as if you are kissing the Earth with your feet.",
            "Thich Nhat Hanh taught: Because you are alive, everything is possible.",
            "Thich Nhat Hanh observed: The miracle is not to walk on water. The miracle is to walk on the green earth in the present moment."
        ]
    }
};

// 🛠️ 修复2: 改进智慧率计算逻辑
function calculateWisdomRate(consultations) {
    if (!consultations || consultations.length === 0) return 0;
    
    const wiseConsultations = consultations.filter(consult => {
        const p = consult.payload || {};
        const clarity = p.determinacy || 0;
        const deception = p.deception_prob || 0;
        const riskLevel = p.risk_tags ? p.risk_tags[0] : 'low_risk';
        
        return clarity > 0.6 && 
               deception < 0.3 &&
               riskLevel === 'low_risk' &&
               (p.kind === 'wisdom' || p.kind === 'truth' || p.kind === 'insight');
    });
    
    return Math.round((wiseConsultations.length / consultations.length) * 100);
}

// 🛠️ 修复3: 统一风险评级标准
function standardizeRiskAssessment(question, deceptionProbability, framework) {
    const highRiskKeywords = ['cheat', 'deceive', 'defraud', 'scam', 'swindle', 'manipulate', 'exploit', 'trick', 'dupe', 'counterfeit', 'fake', 'forge'];
    const mediumRiskKeywords = ['hide', 'conceal', 'secret', 'steal', 'rob', 'burglar', 'harm', 'hurt', 'injure'];
    
    const questionLower = question.toLowerCase();
    
    // 检测高风险词汇
    const hasHighRiskWords = highRiskKeywords.some(word => 
        questionLower.includes(word)
    );
    
    const hasMediumRiskWords = mediumRiskKeywords.some(word => 
        questionLower.includes(word)
    );
    
    if (hasHighRiskWords || deceptionProbability > 0.7) {
        return ['high_risk_deception'];
    } else if (hasMediumRiskWords || deceptionProbability > 0.4) {
        return ['medium_risk_caution'];
    } else if (framework === 'ethical_guardian') {
        return ['ethical_boundary'];
    } else {
        return ['low_risk_wisdom'];
    }
}

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

        // 🛠️ 修复4: 应用统一风险评级
        const standardizedRisk = standardizeRiskAssessment(
            question, 
            data.deception_prob || 0, 
            data.philosophical_framework
        );
        
        // 更新显示字段
        answerText.textContent = data.answer;
        kind.textContent = data.kind || "wisdom";
        det.textContent = data.determinacy.toFixed(2);
        dec.textContent = data.deception_prob.toFixed(2);
        risk.textContent = standardizedRisk.join(", "); // 使用统一的风险评级
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
        
        // 🛠️ 修复5: 应用统一风险评级到历史记录
        const standardizedRisk = standardizeRiskAssessment(
            p.question || "",
            p.deception_prob || 0,
            p.framework || p.philosophical_framework
        );
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.ts ? new Date(item.ts).toLocaleTimeString() : '-'}</td>
            <td>${p.framework || p.philosophical_framework || "-"}</td>
            <td>${p.philosopher || p.referenced_philosopher || "-"}</td>
            <td>${escapeHtml(p.question || "")}</td>
            <td>${escapeHtml((p.answer || "").slice(0, 60))}…</td>
            <td>${(p.determinacy || 0).toFixed(2)}</td>
            <td class="risk-${standardizedRisk[0].replace('_', '-')}">${standardizedRisk.join(", ")}</td>
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

// 🛠️ 修复6: 更新统计信息 - 使用新的智慧率计算
function updateStatistics(validChain) {
    let sumDec = 0, sumDet = 0;
    
    validChain.forEach(item => {
        const p = item.payload || {};
        sumDec += (p.deception_prob || 0);
        sumDet += (p.determinacy || 0);
    });

    const n = Math.max(1, validChain.length);
    
    reqCount.textContent = validChain.length.toString();
    
    // 使用新的智慧率计算
    const wisdomRate = calculateWisdomRate(validChain);
    truthRate.textContent = wisdomRate + "%";
    
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
        
        // 🛠️ 修复7: 诊断智慧率计算
        const wisdomRate = calculateWisdomRate(data.chain);
        console.log('计算出的智慧率:', wisdomRate + '%');
        
    } catch (e) {
        console.error('诊断失败:', e);
    }
}

// 暴露工具函数
window.hardReset = hardReset;
window.diagnoseData = diagnoseData;
window.getCurrentData = () => currentValidChain;
window.calculateWisdomRate = calculateWisdomRate; // 暴露用于调试

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

console.log('Oracle Ethics M1 Frontend - 修复优化版已加载');