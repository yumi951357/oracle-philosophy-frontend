// ====== EDIT THIS BACKEND URL ONLY ======
const BACKEND_URL = (window.BACKEND_URL_OVERRIDE) || "https://oracle-philosophy-backend.onrender.com";
// =======================================

// Optional: set docs links (or leave as-is and change later)
document.getElementById('linkWhitepaper').href = "https://example.com/whitepaper.pdf";
document.getElementById('linkManual').href     = "https://example.com/ritual-manual.pdf";

// Helpers
const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

function fmtTs(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch { return ts || "—"; }
}

async function fetchJSON(url, opts={}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// Load metrics & logs on load
window.addEventListener('DOMContentLoaded', () => {
  loadMetrics();
  loadLogs();
});

async function loadMetrics() {
  try {
    const data = await fetchJSON(`${BACKEND_URL}/api/metrics`);
    // expected: { requests24h, truthfulRate, avgDeception, avgDeterminacy }
    $('m_requests').textContent  = data.requests24h ?? '—';
    $('m_truth').textContent     = (data.truthfulRate!=null) ? ${(data.truthfulRate*100).toFixed(1)}% : '—';
    $('m_deception').textContent = (data.avgDeception!=null) ? (data.avgDeception).toFixed(2) : '—';
    $('m_determinacy').textContent = (data.avgDeterminacy!=null) ? (data.avgDeterminacy).toFixed(2) : '—';
  } catch (e) {
    console.warn('metrics error:', e);
    $('m_requests').textContent = '—';
    $('m_truth').textContent = '—';
    $('m_deception').textContent = '—';
    $('m_determinacy').textContent = '—';
  }
}

async function loadLogs() {
  const body = $('logsBody');
  body.innerHTML = <tr><td colspan="7" class="muted">Loading…</td></tr>;
  try {
    const data = await fetchJSON(`${BACKEND_URL}/api/logs/recent?limit=50`);
    // each log: {timestamp,type("truth"/"deception"),question,answer,determinacy,deception_prob,risk_tags[]}
    if (!Array.isArray(data) || data.length === 0) {
      body.innerHTML = <tr><td colspan="7" class="muted">No records yet.</td></tr>;
      return;
    }
    body.innerHTML = data.map(row => `
      <tr>
        <td>${fmtTs(row.timestamp)}</td>
        <td class="${row.type === 'deception' ? 'type-bad':'type-ok'}">${row.type}</td>
        <td>${(row.question || '').slice(0,120)}</td>
        <td>${(row.answer || '').slice(0,120)}</td>
        <td>${row.determinacy!=null ? row.determinacy.toFixed(2) : '—'}</td>
        <td>${row.deception_prob!=null ? row.deception_prob.toFixed(2) : '—'}</td>
        <td>${(row.risk_tags && row.risk_tags.length) ? row.risk_tags.join(', ') : '—'}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.warn('logs error:', e);
    body.innerHTML = <tr><td colspan="7" class="muted">Failed to load logs.</td></tr>;
  }
}

// Oracle form
$('oracle-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  hide($('errorBox'));
  hide($('answer'));

  const question = $('question').value.trim();
  const sessionId = $('sessionId').value.trim() || session_${Date.now()};

  if (!question) {
    $('errorBox').textContent = 'Please enter a question.';
    show($('errorBox'));
    return;
  }

  $('askBtn').disabled = true;
  $('askBtn').textContent = 'Consulting…';

  try {
    const payload = { question, session_id: sessionId };
    const data = await fetchJSON(`${BACKEND_URL}/api/oracle/ask`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    // expected:
    // {
    //   answer:"...", determinacy:0.73, deception_prob:0.22, risk_tags:["finance"],
    //   timestamp:"...", type:"truth"|"deception"
    // }
    $('answerText').textContent = data.answer || '(no answer)';
    $('detIndex').textContent = (data.determinacy!=null) ? data.determinacy.toFixed(2) : '—';
    $('deceptionProb').textContent = (data.