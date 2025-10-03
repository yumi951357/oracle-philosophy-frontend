// main.js - Oracle Ethics M1 Frontend
// Backend API integration for Philosophical Oracle

// Global configuration
const CONFIG = {
    backendUrl: window.BACKEND_URL || "https://oracle-philosophy-backend.onrender.com",
    apiEndpoints: {
        ask: '/api/oracle/consult',           // 修正的路径
        dashboard: '/api/audit/chain',        // 修正的路径
        health: '/api/health'                 // 健康检查
    },
    maxQuestionLength: 500,
    sessionId: generateSessionId()
};

// DOM Elements
const elements = {
    questionInput: document.getElementById('q'),
    sessionInput: document.getElementById('sid'),
    askButton: document.getElementById('askBtn'),
    answerBox: document.getElementById('answerBox'),
    answerText: document.getElementById('answerText'),
    frameworkText: document.getElementById('frameworkText'),
    philosopherText: document.getElementById('philosopherText'),
    frameworkBadge: document.getElementById('frameworkBadge'),
    refreshButton: document.getElementById('refreshBtn'),
    logBody: document.getElementById('logBody'),
    blockchainBody: document.getElementById('blockchainBody'),
    reqCount: document.getElementById('reqCount'),
    truthRate: document.getElementById('truthRate'),
    avgDec: document.getElementById('avgDec'),
    avgDet: document.getElementById('avgDet')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDashboardData();
});

function initializeApp() {
    // Set up event listeners
    elements.askButton.addEventListener('click', askOracle);
    elements.refreshButton.addEventListener('click', loadDashboardData);
    elements.sessionInput.addEventListener('change', updateSessionId);
    
    // Set default session ID
    elements.sessionInput.value = CONFIG.sessionId;
    
    // Add input validation
    elements.questionInput.addEventListener('input', validateQuestion);
    
    console.log('Oracle Ethics M1 Frontend initialized');
}

// Generate a unique session ID
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

function updateSessionId() {
    const newSessionId = elements.sessionInput.value.trim();
    if (newSessionId) {
        CONFIG.sessionId = newSessionId;
    } else {
        CONFIG.sessionId = generateSessionId();
        elements.sessionInput.value = CONFIG.sessionId;
    }
}

// Validate question input
function validateQuestion() {
    const question = elements.questionInput.value;
    const isValid = question.length <= CONFIG.maxQuestionLength && question.trim().length > 0;
    
    elements.askButton.disabled = !isValid;
    
    if (question.length > CONFIG.maxQuestionLength) {
        showError(`Question too long. Maximum ${CONFIG.maxQuestionLength} characters allowed.`);
    }
}

// Main function to ask the oracle
async function askOracle() {
    const question = elements.questionInput.value.trim();
    const sessionId = elements.sessionInput.value.trim() || CONFIG.sessionId;

    // Validation
    if (!question) {
        showError('Please enter a question.');
        return;
    }

    if (question.length > CONFIG.maxQuestionLength) {
        showError(`Question too long. Maximum ${CONFIG.maxQuestionLength} characters allowed.`);
        return;
    }

    // Check for unethical questions
    if (isUnethicalQuestion(question)) {
        showEthicalWarning(question);
        return;
    }

    // Show loading state
    setLoadingState(true);

    try {
        const response = await fetch(`${CONFIG.backendUrl}${CONFIG.apiEndpoints.ask}`, {  // 修正的路径
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                session_id: sessionId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Display the answer
        displayAnswer(data);
        
        // Record consultation in local state
        if (window.recordConsultation) {
            window.recordConsultation(
                question,
                data.answer,
                data.framework,
                data.philosopher,
                data.det,
                data.dec,
                data.risk,
                data.block_hash
            );
        }
        
        // Refresh dashboard
        setTimeout(loadDashboardData, 1000);

    } catch (error) {
        console.error('Error asking oracle:', error);
        showError('Failed to get response from the oracle. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Display the oracle's answer
function displayAnswer(data) {
    // Update answer content
    elements.answerText.textContent = data.answer;
    elements.frameworkText.textContent = data.framework;
    elements.philosopherText.textContent = data.philosopher;
    
    // Update metrics
    document.getElementById('kind').textContent = data.kind || 'wisdom';
    document.getElementById('framework').textContent = data.framework;
    document.getElementById('philosopher').textContent = data.philosopher;
    document.getElementById('depth').textContent = formatPercentage(data.depth);
    document.getElementById('det').textContent = data.det;
    document.getElementById('dec').textContent = data.dec;
    document.getElementById('risk').textContent = data.risk;
    document.getElementById('blockHash').textContent = data.block_hash;
    
    // Style framework badge
    styleFrameworkBadge(data.framework);
    
    // Show answer box
    elements.answerBox.classList.remove('hide');
    
    // Scroll to answer
    elements.answerBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Style the framework badge based on philosophy
function styleFrameworkBadge(framework) {
    const badge = elements.frameworkBadge;
    badge.className = 'framework-badge'; // Reset classes
    
    switch (framework.toLowerCase()) {
        case 'stoicism':
            badge.classList.add('stoicism-badge');
            break;
        case 'existentialism':
            badge.classList.add('existentialism-badge');
            break;
        case 'taoism':
            badge.classList.add('taoism-badge');
            break;
        case 'buddhism':
            badge.classList.add('buddhism-badge');
            break;
        default:
            badge.classList.add('default-badge');
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch(`${CONFIG.backendUrl}${CONFIG.apiEndpoints.dashboard}`);  // 修正的路径
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateDashboard(data);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to local data if available
        if (window.APP_STATE) {
            updateDashboardWithLocalData();
        }
    }
}

// Update dashboard with API data
function updateDashboard(data) {
    // Update statistics
    if (elements.reqCount) elements.reqCount.textContent = data.total_requests || 0;
    if (elements.truthRate) elements.truthRate.textContent = formatPercentage(data.truth_rate);
    if (elements.avgDec) elements.avgDec.textContent = (data.avg_deception || 0).toFixed(2);
    if (elements.avgDet) elements.avgDet.textContent = (data.avg_determinacy || 0).toFixed(2);
    
    // Update consultation log
    updateConsultationLog(data.recent_consultations || []);
    
    // Update blockchain activity
    updateBlockchainActivity(data.blockchain_activity || []);
}

// Update dashboard with local data
function updateDashboardWithLocalData() {
    if (!window.APP_STATE) return;
    
    const state = window.APP_STATE;
    
    if (elements.reqCount) elements.reqCount.textContent = state.consultationCount || 0;
    if (elements.truthRate) elements.truthRate.textContent = (state.stats?.truthRate || 0).toFixed(1) + '%';
    if (elements.avgDec) elements.avgDec.textContent = (state.stats?.avgDeception || 0).toFixed(2);
    if (elements.avgDet) elements.avgDet.textContent = (state.stats?.avgDeterminacy || 0).toFixed(2);
}

// Update consultation log table
function updateConsultationLog(consultations) {
    if (!elements.logBody) return;
    
    elements.logBody.innerHTML = '';
    
    if (consultations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center; color: #888;">No consultation records yet.</td>`;
        elements.logBody.appendChild(row);
        return;
    }
    
    consultations.forEach(consultation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatTime(consultation.timestamp)}</td>
            <td>${consultation.framework}</td>
            <td>${consultation.philosopher}</td>
            <td title="${consultation.question}">${truncateText(consultation.question, 30)}</td>
            <td title="${consultation.answer}">${truncateText(consultation.answer, 50)}</td>
            <td>${consultation.determinacy}</td>
            <td class="risk-${consultation.risk?.toLowerCase().replace(' ', '-') || 'low-risk'}">${consultation.risk || 'low_risk'}</td>
        `;
        elements.logBody.appendChild(row);
    });
}

// Update blockchain activity table
function updateBlockchainActivity(activities) {
    if (!elements.blockchainBody) return;
    
    elements.blockchainBody.innerHTML = '';
    
    if (activities.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align: center; color: #888;">No blockchain activity yet.</td>`;
        elements.blockchainBody.appendChild(row);
        return;
    }
    
    activities.forEach((activity, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${String(activity.block_number || (activities.length - index)).padStart(3, '0')}</td>
            <td title="${activity.question}">${truncateText(activity.question, 25)}</td>
            <td>${activity.framework}</td>
            <td class="hash">${activity.block_hash || generateRandomHash()}</td>
        `;
        elements.blockchainBody.appendChild(row);
    });
}

// Unethical question detection
function isUnethicalQuestion(question) {
    const unethicalPatterns = [
        /deceive|deception|fraud|scam|cheat|manipulate|trick|fake|forge/i,
        /harm|hurt|violence|attack|destroy|kill|injure/i,
        /illegal|unlawful|crime|criminal|hack|steal|rob|theft/i,
        /perfect.*fraud|fraud.*strategy|manipulate.*technique/i,
        /hide.*justified|justified.*hide|conceal.*reasonable/i,
        /counterfeit.*method|fake.*method|forgery.*technique/i
    ];
    
    return unethicalPatterns.some(pattern => pattern.test(question));
}

// Show ethical warning
function showEthicalWarning(question) {
    const answerBox = document.getElementById('answerBox');
    if (answerBox) {
        answerBox.classList.remove('hide');
        
        document.getElementById('frameworkText').textContent = 'Ethical Boundary';
        document.getElementById('philosopherText').textContent = 'System Guardian';
        document.getElementById('answerText').textContent = 
            'For ethical reasons, I cannot answer questions involving deception, harm, or illegal activities. Philosophical wisdom should be used for self-improvement and understanding existence, not for manipulating others. Please rephrase your question constructively.';
        
        // Update metrics display
        const metrics = ['kind', 'framework', 'philosopher', 'depth', 'det', 'dec', 'risk', 'blockHash'];
        metrics.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                switch(id) {
                    case 'kind': element.textContent = 'Ethical Protection'; break;
                    case 'framework': element.textContent = 'System Ethics'; break;
                    case 'philosopher': element.textContent = 'AI Guardian'; break;
                    case 'depth': element.textContent = '100%'; break;
                    case 'det': element.textContent = '1.00'; break;
                    case 'dec': element.textContent = '0.00'; break;
                    case 'risk': element.textContent = 'Ethical Rejection'; break;
                    case 'blockHash': element.textContent = 'eth_protection_' + Date.now(); break;
                }
            }
        });
        
        // Style as ethical rejection
        styleFrameworkBadge('ethical');
    }
}

// Utility functions
function setLoadingState(loading) {
    elements.askButton.disabled = loading;
    elements.askButton.textContent = loading ? 'Seeking Wisdom...' : 'Seek Wisdom';
    
    if (loading) {
        elements.askButton.classList.add('loading');
    } else {
        elements.askButton.classList.remove('loading');
    }
}

function showError(message) {
    // Simple error notification
    alert(`Error: ${message}`);
}

function formatPercentage(value) {
    if (typeof value !== 'number') return '0%';
    return (value * 100).toFixed(0) + '%';
}

function formatTime(timestamp) {
    if (!timestamp) return new Date().toLocaleTimeString();
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function generateRandomHash() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Make functions available globally for enhanced features
window.displayAnswer = displayAnswer;
window.generateRandomHash = generateRandomHash;

console.log('Oracle Ethics M1 main.js loaded successfully');