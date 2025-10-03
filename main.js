// main.js — Oracle Ethics M1 (Complete Fixed Version)
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
const paginationContainer = $("paginationContainer");
const paginationInfo = $("paginationInfo");

// Global state management
let currentValidChain = [];
let currentPage = 1;
const recordsPerPage = 10;
let allValidRecords = [];
let isLoading = false;
let dataCache = null;
let lastLoadTime = 0;
const CACHE_DURATION = 30000;

// 🎯 前端数据一致性层
class DataConsistencyManager {
    constructor() {
        this.localBackup = this.loadLocalBackup();
        this.lastSyncTime = null;
    }
    
    loadLocalBackup() {
        try {
            return JSON.parse(localStorage.getItem('philosophy_backup') || '[]');
        } catch (e) {
            return [];
        }
    }
    
    saveLocalBackup() {
        try {
            localStorage.setItem('philosophy_backup', JSON.stringify(this.localBackup));
        } catch (e) {
            console.warn('Failed to save local backup:', e);
        }
    }
    
    async getConsistentData() {
        try {
            const backendData = await this.fetchBackendData();
            const mergedData = this.mergeWithLocalBackup(backendData);
            return this.validateAndCleanData(mergedData);
        } catch (error) {
            console.warn('Using local backup due to backend error:', error);
            return this.getLocalBackupData();
        }
    }
    
    async fetchBackendData() {
        const randomParam = Math.random().toString(36).substring(7);
        const response = await fetch(`${B()}/api/audit/chain?limit=500&nocache=${randomParam}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
    
    mergeWithLocalBackup(backendData) {
        const backendChain = backendData.chain || [];
        const localChain = this.localBackup;
        
        // 创建哈希映射以避免重复
        const hashMap = new Map();
        
        // 优先使用后端数据
        backendChain.forEach(item => {
            if (item.block_hash) hashMap.set(item.block_hash, item);
        });
        
        // 添加本地备份中不存在的记录
        localChain.forEach(item => {
            if (item.block_hash && !hashMap.has(item.block_hash)) {
                hashMap.set(item.block_hash, { ...item, fromLocalBackup: true });
            }
        });
        
        return Array.from(hashMap.values());
    }
    
    validateAndCleanData(data) {
        return data.filter(item => {
            if (!item || typeof item !== 'object') return false;
            const p = item.payload || {};
            const question = (p.question || "").trim();
            const answer = (p.answer || "").trim();
            
            // 🎯 修复：极宽松的条件
            return question.length > 0 || answer.length > 0;
        });
    }
    
    getLocalBackupData() {
        return this.localBackup.filter(item => {
            const p = item.payload || {};
            return p.question || p.answer;
        });
    }
    
    backupConsultation(data) {
        const backupItem = {
            ...data,
            localTimestamp: Date.now(),
            synced: true
        };
        
        this.localBackup.unshift(backupItem);
        // 只保留最近50条记录
        this.localBackup = this.localBackup.slice(0, 50);
        this.saveLocalBackup();
    }
    
    clearBackup() {
        this.localBackup = [];
        localStorage.removeItem('philosophy_backup');
    }
}

const dataConsistencyManager = new DataConsistencyManager();

// 🎯 增强型欺骗检测引擎
class EnhancedDeceptionDetector {
    constructor() {
        this.patterns = {
            immediate_ethical_boundary: [
                /forge.*document|fake.*id|counterfeit|falsify/i,
                /manipulation.*technique|control.*people|brainwash/i,
                /lie.*without.*detect|cheat.*undetected|get.*away.*with/i,
                /steal.*undetected|hack.*without.*trace/i,
                /undetectable.*method|avoid.*detection/i
            ],
            high_risk: [
                /cheat|deceive|defraud|scam|swindle|exploit/i,
                /illegal|unlawful|criminal|felony|contraband/i,
                /harm.*other|hurt.*someone|attack.*person/i,
                /fake.*certificate|false.*document/i
            ],
            medium_risk: [
                /hide|conceal|secret|covert|sneak|disguise/i,
                /trick|dupe|mislead|deceive|bamboozle/i,
                /lie|falsehood|untruth|fabricate|misrepresent/i,
                /avoid detection|get away with|without getting caught/i,
                /bend.*rule|break.*rule|against.*rule/i
            ]
        };
        
        this.thresholds = {
            immediate_block: 0.15,
            high_risk: 0.3,
            medium_risk: 0.1,
            low_risk: 0.02
        };
    }

    heuristicAnalysis(question) {
        let score = 0;
        let reasons = [];

        Object.entries(this.patterns).forEach(([type, patterns]) => {
            patterns.forEach(pattern => {
                if (pattern.test(question)) {
                    score += type === 'immediate_ethical_boundary' ? 0.6 : 
                            type === 'high_risk' ? 0.4 : 0.2;
                    reasons.push(this.getReasonDescription(type, pattern));
                }
            });
        });

        return { score: Math.min(score, 1.0), reasons };
    }

    semanticAnalysis(question) {
        let semanticScore = 0;
        let semanticReasons = [];

        const manipulativeIntents = [
            'get away with', 'without consequences', 'secret method', 
            'undetectable', 'without getting caught', 'avoid detection'
        ];
        
        manipulativeIntents.forEach(intent => {
            if (question.toLowerCase().includes(intent)) {
                semanticScore += 0.3;
                semanticReasons.push(`Manipulative intent: "${intent}"`);
            }
        });

        const contextClues = {
            ethical_bypass: /(how can I|is it ok to|should I).*(even though|despite|although)/i,
            justification_seeking: /(justified|reasonable|acceptable).*(when|if)/i,
            boundary_testing: /(what if I|suppose I|imagine I).*(would it be)/i
        };

        Object.entries(contextClues).forEach(([type, pattern]) => {
            if (pattern.test(question)) {
                semanticScore += 0.2;
                semanticReasons.push(`Context: ${type.replace('_', ' ')}`);
            }
        });

        return { score: Math.min(semanticScore, 0.6), reasons: semanticReasons };
    }

    detect(question) {
        if (!question || question.trim().length < 5) {
            return { score: 0, level: 'low_risk', reasons: ['Question too short'] };
        }

        // 检查立即伦理边界
        const immediateMatch = this.patterns.immediate_ethical_boundary
            .some(pattern => pattern.test(question));
            
        if (immediateMatch) {
            return {
                score: 0.9,
                level: 'ethical_boundary',
                reasons: ['Immediate ethical boundary violation detected'],
                immediate_block: true
            };
        }

        const heuristic = this.heuristicAnalysis(question);
        const semantic = this.semanticAnalysis(question);
        
        const finalScore = (heuristic.score * 0.7 + semantic.score * 0.3);
        const allReasons = [...heuristic.reasons, ...semantic.reasons];

        let level;
        if (finalScore > this.thresholds.high_risk) level = 'high_risk_deception';
        else if (finalScore > this.thresholds.medium_risk) level = 'medium_risk_caution';
        else if (finalScore > this.thresholds.low_risk) level = 'low_risk_awareness';
        else level = 'no_risk_clear';

        console.log(`Deception Detection: "${question}" → ${finalScore.toFixed(2)} - ${level}`, allReasons);
        
        return {
            score: finalScore,
            level: level,
            reasons: allReasons.slice(0, 3),
            immediate_block: false
        };
    }

    getReasonDescription(type, pattern) {
        const descriptions = {
            immediate_ethical_boundary: 'Immediate ethical boundary violation',
            high_risk: 'High-risk ethical violation pattern',
            medium_risk: 'Concerning pattern identified'
        };
        return descriptions[type] || 'Suspicious pattern detected';
    }
}

const deceptionDetector = new EnhancedDeceptionDetector();

// Philosophical Response Engine
class PhilosophicalResponseEngine {
    constructor() {
        this.responses = {
            stoicism: {
                epictetus: [
                    "As Epictetus taught: We cannot control external events, but we can control our reactions to them. True freedom comes from mastering our judgments.",
                    "Epictetus reflected: It's not what happens to you, but how you react that matters. Your character is revealed in adversity.",
                    "Epictetus advised: First say to yourself what you would be, and then do what you have to do. Let reason guide your actions.",
                    "Epictetus reminded: Wealth consists not in having great possessions, but in having few wants. Find contentment within.",
                    "Epictetus observed: Difficulties are things that show what men are. Embrace challenges as opportunities for growth."
                ],
                marcus_aurelius: [
                    "Marcus Aurelius meditated: The happiness of your life depends upon the quality of your thoughts. Guard your mind diligently.",
                    "Marcus Aurelius observed: Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
                    "Marcus Aurelius reminded: You have power over your mind - not outside events. Realize this, and you will find strength.",
                    "Marcus Aurelius reflected: When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love.",
                    "Marcus Aurelius taught: The best revenge is to be unlike him who performed the injury. Rise above pettiness."
                ]
            },
            taoism: {
                laozi: [
                    "Laozi taught: The journey of a thousand miles begins with a single step. Great accomplishments start with small actions.",
                    "Laozi said: Knowing others is intelligence; knowing yourself is true wisdom. Self-awareness is the foundation of understanding.",
                    "Laozi reflected: Nature does not hurry, yet everything is accomplished. Learn the art of effortless action.",
                    "Laozi observed: When I let go of what I am, I become what I might be. Embrace transformation through release.",
                    "Laozi taught: The wise man does not lay up his own treasures. The more he gives to others, the more he has for his own."
                ],
                zhuangzi: [
                    "Zhuangzi dreamed: I do not know whether I was then a man dreaming I was a butterfly, or whether I am now a butterfly dreaming I am a man. Reality is fluid.",
                    "Zhuangzi observed: Happiness is the absence of the striving for happiness. Cease searching and find what is already here.",
                    "Zhuangzi taught: Use the light, but return to the clarity of seeing. Balance action with contemplation.",
                    "Zhuangzi reflected: Great wisdom is generous; petty wisdom is contentious. True understanding embraces paradox.",
                    "Zhuangzi said: Flow with whatever may happen and let your mind be free. Adapt like water to your circumstances."
                ]
            },
            existentialism: {
                nietzsche: [
                    "Nietzsche proclaimed: That which does not kill us makes us stronger. Adversity forges character and resilience.",
                    "Nietzsche declared: He who has a why to live can bear almost any how. Purpose gives meaning to suffering.",
                    "Nietzsche observed: Without music, life would be a mistake. Find beauty and art in everyday existence.",
                    "Nietzsche taught: One must still have chaos in oneself to be able to give birth to a dancing star. Embrace creative tension.",
                    "Nietzsche reflected: The individual has always had to struggle to keep from being overwhelmed by the tribe. Cultivate your uniqueness."
                ],
                camus: [
                    "Camus reflected: In the depth of winter, I finally learned that within me there lay an invincible summer. Find inner resilience.",
                    "Camus taught: The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
                    "Camus observed: Should I kill myself, or have a cup of coffee? The absurdity of existence invites us to choose life.",
                    "Camus said: Freedom is nothing but a chance to be better. Each moment offers renewal and possibility.",
                    "Camus reflected: You will never be happy if you continue to search for what happiness consists of. Stop seeking and start living."
                ]
            }
        };
    }

    generateResponse(question, framework, philosopher) {
        const frameworkResponses = this.responses[framework];
        if (!frameworkResponses) return this.getFallbackResponse(question);
        
        const philosopherResponses = frameworkResponses[philosopher];
        if (!philosopherResponses) return this.getFallbackResponse(question);
        
        const questionKeywords = this.extractKeywords(question);
        const scoredResponses = philosopherResponses.map(response => ({
            response,
            score: this.calculateRelevanceScore(response, questionKeywords)
        }));
        
        scoredResponses.sort((a, b) => b.score - a.score);
        const topResponses = scoredResponses.slice(0, 3);
        const selected = topResponses[Math.floor(Math.random() * topResponses.length)];
        
        return selected.response;
    }

    extractKeywords(question) {
        const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'what', 'how', 'why', 'when', 'where']);
        return question.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));
    }

    calculateRelevanceScore(response, keywords) {
        let score = 0;
        const responseLower = response.toLowerCase();
        
        keywords.forEach(keyword => {
            if (responseLower.includes(keyword)) {
                score += 2;
            }
        });
        
        score += Math.random() * 0.5;
        return score;
    }

    getFallbackResponse(question) {
        const fallbacks = [
            "The ancient wisdom suggests: True understanding comes not from having answers, but from learning to live with questions.",
            "Philosophical insight reveals: The path to wisdom begins with acknowledging what we do not know.",
            "As the sages taught: Sometimes the most profound answer is to re-examine the question itself.",
            "Wisdom whispers: The universe reveals its secrets to those who approach with humble curiosity.",
            "Through contemplative practice: We discover that every question contains the seed of its own answer."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

const responseEngine = new PhilosophicalResponseEngine();

// Dashboard Manager
class DashboardManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
        this.cache = new Map();
    }

    async loadDataWithStability() {
        const cacheKey = 'dashboard_data';
        const now = Date.now();
        
        if (this.cache.has(cacheKey)) {
            const { data, timestamp } = this.cache.get(cacheKey);
            if (now - timestamp < CACHE_DURATION) {
                console.log('Using cached dashboard data');
                return data;
            }
        }

        try {
            const data = await dataConsistencyManager.getConsistentData();
            this.cache.set(cacheKey, { data: { chain: data }, timestamp: now });
            this.retryCount = 0;
            return { chain: data };
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            if (this.cache.has(cacheKey)) {
                console.log('Using expired cache as fallback');
                return this.cache.get(cacheKey).data;
            }
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

const dashboardManager = new DashboardManager();

// Blockchain Logger
class BlockchainLogger {
    constructor() {
        this.formats = {
            timestamp: (ts) => {
                if (!ts) return '-';
                try {
                    const date = new Date(ts);
                    return date.toLocaleTimeString('en-US', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                } catch (e) {
                    return '-';
                }
            },
            framework: (fw) => {
                const frameworkMap = {
                    'stoicism': '🏛️ Stoic',
                    'existentialism': '🎭 Exist',
                    'taoism': '☯️ Tao',
                    'buddhism': '🪷 Buddh',
                    'ethical_guardian': '🛡️ Ethic',
                    'stoic': '🏛️ Stoic',
                    'existentialist': '🎭 Exist'
                };
                return frameworkMap[fw] || fw || '-';
            },
            hash: (hash) => {
                if (!hash || hash === 'pending...') return 'pending...';
                if (hash.length < 14) return hash;
                return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
            },
            risk: (riskLevel) => {
                const riskMap = {
                    'high_risk_deception': '🔴 High',
                    'medium_risk_caution': '🟡 Medium', 
                    'low_risk_awareness': '🟢 Low',
                    'no_risk_clear': '⚪ Clear',
                    'ethical_boundary': '🛡️ Ethical'
                };
                return riskMap[riskLevel] || riskLevel || '🟢 Low';
            }
        };
    }

    formatLogEntry(item, index, total) {
        const p = item.payload || {};
        const detection = deceptionDetector.detect(p.question || "");
        
        return {
            time: this.formats.timestamp(item.timestamp || item.ts),
            framework: this.formats.framework(p.framework || p.philosophical_framework),
            philosopher: p.philosopher || p.referenced_philosopher || 'Ancient Sage',
            question: p.question ? this.truncateText(p.question, 35) : '-',
            answer: p.answer ? this.truncateText(p.answer, 50) : '-',
            clarity: (p.determinacy || p.clarity || 0).toFixed(2),
            risk: this.formats.risk(detection.level),
            originalData: item
        };
    }

    formatBlockchainEntry(item, index, total) {
        const p = item.payload || {};
        const blockNumber = total - index;
        return {
            block: `#${String(blockNumber).padStart(3, '0')}`,
            question: p.question ? this.truncateText(p.question, 25) : '-',
            framework: this.formats.framework(p.framework || p.philosophical_framework),
            hash: this.formats.hash(item.block_hash || item.hash)
        };
    }

    truncateText(text, maxLength) {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}

const blockchainLogger = new BlockchainLogger();

// 修复智慧率计算
function calculateWisdomRate(consultations) {
    if (!consultations || consultations.length === 0) return 0;
    
    const wiseConsultations = consultations.filter(consult => {
        const p = consult.payload || {};
        const clarity = p.determinacy || p.clarity || 0;
        const deception = p.deception_prob || 0;
        const answer = (p.answer || "").toLowerCase();
        
        return clarity > 0.2 && 
               deception < 0.7 &&
               answer.length > 10 &&
               !answer.includes('undefined') &&
               !answer.includes('error') &&
               !answer.includes('failed');
    });
    
    const rate = Math.round((wiseConsultations.length / consultations.length) * 100);
    console.log(`Wisdom Rate: ${wiseConsultations.length}/${consultations.length} = ${rate}%`);
    return rate;
}

// Set loading state
function setLoadingState(loading) {
    isLoading = loading;
    if (loading) {
        refreshBtn.textContent = "🔄 Loading...";
        refreshBtn.disabled = true;
        askBtn.disabled = true;
        
        if (!document.getElementById('loadingIndicator')) {
            const loader = document.createElement('div');
            loader.id = 'loadingIndicator';
            loader.className = 'data-loading';
            loader.innerHTML = `
                <div style="text-align: center; padding: 30px; color: var(--muted);">
                    <div style="font-size: 1.2em; margin-bottom: 10px;">🔄 Loading Wisdom</div>
                    <small>Connecting to the philosophical blockchain...</small>
                </div>
            `;
            logBody.parentNode.insertBefore(loader, logBody);
        }
    } else {
        refreshBtn.textContent = "🔄 Refresh Wisdom Log";
        refreshBtn.disabled = false;
        askBtn.disabled = false;
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.remove();
    }
}

// Show error message
function showError(message, isFatal = false) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.3);
        color: #f44336;
        padding: 16px;
        border-radius: 12px;
        margin: 16px 0;
        text-align: center;
        backdrop-filter: blur(10px);
    `;
    errorDiv.innerHTML = `
        <strong>🔧 System Notice</strong><br>
        ${message}
        ${isFatal ? '<br><button onclick="location.reload()" style="margin-top: 12px; padding: 8px 16px; background: var(--gradient-tech); border: none; border-radius: 8px; color: white; cursor: pointer;">Retry</button>' : ''}
    `;
    
    const target = isFatal ? document.querySelector('main') : logBody.parentNode;
    target.insertBefore(errorDiv, logBody);
    
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => errorDiv.remove(), 500);
    }, 5000);
}

// Initialize default data
function initializeDefaultData() {
    reqCount.textContent = "0";
    truthRate.textContent = "—";
    avgDec.textContent = "—";
    avgDet.textContent = "—";
    
    logBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; color: var(--muted); padding: 40px;">
                <div style="font-size: 1.2em; margin-bottom: 8px;">📊 Awakening the Oracle</div>
                <small>Ask your first question to begin the philosophical journey</small>
            </td>
        </tr>
    `;
    
    if (blockchainBody) {
        blockchainBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--muted); padding: 30px;">
                    <div style="font-size: 1.1em; margin-bottom: 8px;">⛓️ Blockchain Dormant</div>
                    <small>Consult the oracle to generate the first block</small>
                </td>
            </tr>
        `;
    }

    if (paginationInfo) paginationInfo.textContent = '';
    if (paginationContainer) paginationContainer.innerHTML = '';
}

// 🎯 修复咨询函数 - 单一事件监听器
askBtn.addEventListener("click", async () => {
    const question = (q.value || "").trim();
    const sessionId = (sid.value || "").trim();
    
    if (!question) {
        showNotification('Please enter a philosophical question', 'warning');
        return;
    }

    // 检查重复问题
    const isDuplicate = allValidRecords.some(item => {
        const existingQuestion = (item.payload?.question || "").trim();
        return existingQuestion.toLowerCase() === question.toLowerCase();
    });
    
    if (isDuplicate) {
        showNotification('Similar question already consulted. Consider rephrasing.', 'info');
        return;
    }

    // 使用增强欺骗检测
    const deceptionAnalysis = deceptionDetector.detect(question);
    console.log('Deception analysis:', deceptionAnalysis);
    
    if (deceptionAnalysis.immediate_block || deceptionAnalysis.level === 'high_risk_deception') {
        showEthicalWarning(question, deceptionAnalysis);
        return;
    }

    try {
        setLoadingState(true);
        const res = await fetch(`${B()}/api/oracle/consult`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ 
                question, 
                sessionId: sessionId || "auto-" + Date.now(),
                deception_analysis: deceptionAnalysis
            })
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // 立即备份到本地存储
        dataConsistencyManager.backupConsultation(data);

        const enhancedAnswer = responseEngine.generateResponse(
            question, 
            data.philosophical_framework, 
            data.referenced_philosopher
        );

        updateAnswerDisplay(data, enhancedAnswer, deceptionAnalysis);
        
        // 🎯 修复：清除缓存并重新加载数据
        dashboardManager.clearCache();
        await loadLogs();
        
        showNotification('Wisdom received from the philosophical oracle', 'success');
        
    } catch (e) {
        console.error("Consultation failed:", e);
        showError("Oracle connection failed: " + e.message);
    } finally {
        setLoadingState(false);
    }
});

function updateAnswerDisplay(data, answer, deceptionAnalysis) {
    answerText.textContent = answer;
    kind.textContent = data.kind || "wisdom";
    det.textContent = (data.determinacy || 0).toFixed(2);
    dec.textContent = (data.deception_prob || 0).toFixed(2);
    risk.textContent = deceptionAnalysis.level.replace(/_/g, ' ');
    framework.textContent = data.philosophical_framework || "-";
    philosopher.textContent = data.referenced_philosopher || "-";
    frameworkText.textContent = data.philosophical_framework || "-";
    philosopherText.textContent = data.referenced_philosopher || "-";
    
    if (data.depth_analysis?.depth_score !== undefined) {
        depth.textContent = (data.depth_analysis.depth_score * 100).toFixed(0) + '%';
    } else {
        depth.textContent = "-";
    }
    
    blockHash.textContent = data.block_hash ? 
        `${data.block_hash.substring(0, 12)}...${data.block_hash.substring(data.block_hash.length - 8)}` : "-";
    
    if (data.philosophical_framework) {
        frameworkBadge.className = `framework-badge ${data.philosophical_framework.toLowerCase()}`;
    }
    
    answerBox.classList.remove("hide");
}

function showEthicalWarning(question, analysis) {
    const ethicalResponses = [
        "The path of wisdom cannot accommodate deceptive intentions. True understanding comes from authentic inquiry.",
        "Philosophical guidance serves enlightenment, not manipulation. Consider reframing your question with honest intent.",
        "The oracle's purpose is wisdom, not cunning. Your question touches on boundaries of ethical consultation.",
        "Ancient wisdom reminds us: Truth cannot be weaponized. Seek understanding through virtuous means."
    ];
    
    answerText.textContent = ethicalResponses[Math.floor(Math.random() * ethicalResponses.length)];
    kind.textContent = "ethical_guidance";
    det.textContent = "1.00";
    dec.textContent = analysis.score.toFixed(2);
    risk.textContent = analysis.level.replace(/_/g, ' ');
    framework.textContent = "Ethical Guardian";
    philosopher.textContent = "System Wisdom";
    depth.textContent = "100%";
    blockHash.textContent = "eth_" + Date.now().toString(36);
    frameworkText.textContent = "Ethical Guardian";
    philosopherText.textContent = "System Wisdom";
    
    frameworkBadge.className = "framework-badge ethical_guardian";
    answerBox.classList.remove("hide");
    
    showNotification('Ethical boundaries respected in your consultation', 'info');
}

// 🎯 修复主数据加载函数
async function loadLogs() {
    if (isLoading) {
        console.log('Load already in progress, skipping...');
        return;
    }
    
    try {
        setLoadingState(true);
        console.log('Loading consultation data...');
        
        const data = await dashboardManager.loadDataWithStability();
        const chain = data.chain || [];
        
        console.log(`Raw backend data: ${chain.length} records`);
        
        // 🎯 修复：极宽松的数据过滤
        allValidRecords = chain.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            const p = item.payload || {};
            const question = (p.question || "").trim();
            const answer = (p.answer || "").trim();
            
            // 极宽松条件：只要有question或answer就显示
            const isValid = question.length > 0 || answer.length > 0;
            
            if (!isValid) {
                console.warn('Filtered invalid record:', item);
            }
            
            return isValid;
        });
        
        console.log(`After filtering: ${allValidRecords.length} valid records`);
        
        // 按时间戳排序（最新的在前）
        allValidRecords.sort((a, b) => {
            const timeA = a.timestamp || a.ts || 0;
            const timeB = b.timestamp || b.ts || 0;
            return new Date(timeB) - new Date(timeA);
        });
        
        currentValidChain = allValidRecords;
        currentPage = 1;
        
        if (allValidRecords.length === 0) {
            console.log('No valid records found');
            initializeDefaultData();
        } else {
            console.log(`Displaying ${allValidRecords.length} records`);
            displayCurrentPage();
            updateStatistics(allValidRecords);
            updateBlockchainTable(allValidRecords);
        }
        
    } catch (e) {
        console.error("Load logs failed:", e);
        showError("Failed to load wisdom data: " + e.message, true);
    } finally {
        setLoadingState(false);
    }
}

// 修复分页显示
function displayCurrentPage() {
    if (!logBody) return;
    
    logBody.innerHTML = "";
    
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, allValidRecords.length);
    const pageRecords = allValidRecords.slice(startIndex, endIndex);
    
    console.log(`Displaying page ${currentPage}: records ${startIndex} to ${endIndex}`);
    
    if (pageRecords.length === 0) {
        logBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--muted); padding: 40px;">
                    <div>📊 No records on this page</div>
                    <small>Navigate to other pages or refresh data</small>
                </td>
            </tr>
        `;
        return;
    }
    
    pageRecords.forEach((item, index) => {
        const globalIndex = startIndex + index;
        const formatted = blockchainLogger.formatLogEntry(item, globalIndex, allValidRecords.length);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(formatted.time)}</td>
            <td>${escapeHtml(formatted.framework)}</td>
            <td>${escapeHtml(formatted.philosopher)}</td>
            <td title="${escapeHtml(item.payload?.question || "")}">${escapeHtml(formatted.question)}</td>
            <td title="${escapeHtml(item.payload?.answer || "")}">${escapeHtml(formatted.answer)}</td>
            <td>${formatted.clarity}</td>
            <td class="risk-${formatted.risk.toLowerCase().replace(' ', '-')}">${formatted.risk}</td>
        `;
        logBody.appendChild(tr);
    });
    
    updatePaginationControls();
}

// 修复分页控制
function updatePaginationControls() {
    if (paginationContainer) paginationContainer.innerHTML = '';
    if (paginationInfo) paginationInfo.textContent = '';
    
    const totalPages = Math.ceil(allValidRecords.length / recordsPerPage);
    const totalRecords = allValidRecords.length;
    
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalRecords} total records)`;
    }
    
    if (totalPages <= 1) return;
    
    if (paginationContainer) {
        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '← Previous';
            prevBtn.className = 'secondary-btn';
            prevBtn.onclick = () => {
                currentPage--;
                displayCurrentPage();
            };
            paginationContainer.appendChild(prevBtn);
        }
        
        const pageInfo = document.createElement('span');
        pageInfo.className = 'pagination-info';
        pageInfo.textContent = ` ${currentPage} / ${totalPages} `;
        paginationContainer.appendChild(pageInfo);
        
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = 'Next →';
            nextBtn.className = 'secondary-btn';
            nextBtn.onclick = () => {
                currentPage++;
                displayCurrentPage();
            };
            paginationContainer.appendChild(nextBtn);
        }
    }
}

// 修复统计更新
function updateStatistics(validChain) {
    if (!validChain || validChain.length === 0) {
        reqCount.textContent = "0";
        truthRate.textContent = "0%";
        avgDec.textContent = "0.0";
        avgDet.textContent = "0.0";
        return;
    }
    
    let sumDec = 0, sumDet = 0;
    let validStatsCount = 0;
    
    validChain.forEach(item => {
        const p = item.payload || {};
        const deception = p.deception_prob || 0;
        const determinacy = p.determinacy || p.clarity || 0;
        
        if (deception >= 0 && determinacy >= 0) {
            sumDec += deception;
            sumDet += determinacy;
            validStatsCount++;
        }
    });

    const n = Math.max(1, validStatsCount);
    
    reqCount.textContent = validChain.length.toString();
    const wisdomRate = calculateWisdomRate(validChain);
    truthRate.textContent = wisdomRate + "%";
    avgDec.textContent = (sumDec / n).toFixed(1);
    avgDet.textContent = (sumDet / n).toFixed(1);
    
    console.log(`Statistics: ${validChain.length} records, wisdom rate: ${wisdomRate}%`);
}

// 修复区块链表格
function updateBlockchainTable(validChain) {
    if (!blockchainBody) return;
    
    const blockchainData = validChain.filter(item => {
        const p = item.payload || {};
        return (p.question || p.answer) && (item.timestamp || item.ts);
    });
    
    blockchainBody.innerHTML = '';
    
    if (blockchainData.length === 0) {
        blockchainBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--muted); padding: 30px;">
                    <div style="font-size: 1.1em; margin-bottom: 8px;">⛓️ No Blockchain Activity</div>
                    <small>Consult the oracle to generate blocks</small>
                </td>
            </tr>
        `;
        return;
    }
    
    const recentEntries = blockchainData.slice(0, 6);
    recentEntries.forEach((entry, index) => {
        const formatted = blockchainLogger.formatBlockchainEntry(entry, index, blockchainData.length);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-family: 'Courier New', monospace; font-weight: bold;">${formatted.block}</td>
            <td title="${escapeHtml(entry.payload?.question || '')}">${escapeHtml(formatted.question)}</td>
            <td>${formatted.framework}</td>
            <td class="hash" style="font-family: 'Courier New', monospace; font-size: 12px;">${formatted.hash}</td>
        `;
        blockchainBody.appendChild(row);
    });
}

// Utility functions
function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
    }[c]));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Diagnostic functions
async function diagnoseSystem() {
    try {
        const data = await dashboardManager.loadDataWithStability();
        const validRecords = data.chain || [];
        
        const stats = {
            totalRecords: validRecords.length,
            validRecords: validRecords.length,
            wisdomRate: calculateWisdomRate(validRecords),
            cacheStatus: dashboardManager.cache.size > 0 ? 'Active' : 'Empty',
            currentDisplay: allValidRecords.length,
            localBackupCount: dataConsistencyManager.localBackup.length
        };
        
        console.log('System Diagnosis:', stats);
        showNotification(`System OK: ${stats.validRecords} records, ${stats.wisdomRate}% wisdom rate`, 'success');
        
        return stats;
    } catch (error) {
        console.error('Diagnosis failed:', error);
        showNotification('System diagnosis failed', 'error');
    }
}

function hardReset() {
    if (confirm('⚠️ Reset all system data and cache?')) {
        dashboardManager.clearCache();
        dataConsistencyManager.clearBackup();
        localStorage.clear();
        sessionStorage.clear();
        currentValidChain = [];
        allValidRecords = [];
        currentPage = 1;
        initializeDefaultData();
        showNotification('System reset completed', 'info');
    }
}

// Expose global functions
window.diagnoseSystem = diagnoseSystem;
window.hardReset = hardReset;
window.getSystemStats = () => ({
    records: allValidRecords.length,
    wisdomRate: calculateWisdomRate(allValidRecords),
    page: currentPage,
    totalPages: Math.ceil(allValidRecords.length / recordsPerPage),
    localBackup: dataConsistencyManager.localBackup.length
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Oracle Ethics M1 - Complete Fixed Edition Initializing');
    
    initializeDefaultData();
    loadLogs();
    
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            console.log('Periodic data refresh triggered');
            loadLogs();
        }
    }, 120000);
    
    console.log('Oracle Ethics M1 - Complete Fixed Edition Loaded');
});

refreshBtn.addEventListener("click", function() {
    console.log('Manual refresh triggered');
    dashboardManager.clearCache();
    loadLogs();
});