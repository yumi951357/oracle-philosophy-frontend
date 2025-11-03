# semantic_bridge.py
# M2.3 语义桥：识别用户意图、主题、语气与语义置信度
from typing import Dict, List

_INTENT_KEYWORDS = {
    "ethics": ["ethic", "moral", "virtue", "harm", "duty", "deception", "fraud"],
    "truth": ["truth", "true", "false", "reality", "real"],
    "ai": ["ai", "artificial", "intelligence", "model", "agent"],
    "risk": ["hack", "exploit", "bypass", "manipulation", "weapon", "undetect"],
    "finance": ["bitcoin", "stock", "invest", "market", "price"],
    "medical": ["medicine", "drug", "symptom", "treatment", "health"]
}

_TONE_POS = ["benefit", "help", "well-being", "care", "respect", "accountable"]
_TONE_NEG = ["harm", "deceive", "cheat", "exploit", "fraud", "bypass", "undetect"]

def _topic_hits(q: str) -> List[str]:
    ql = q.lower()
    topics = []
    for topic, kws in _INTENT_KEYWORDS.items():
        if any(k in ql for k in kws):
            topics.append(topic)
    return topics

def _valence(q: str) -> float:
    ql = q.lower()
    pos = sum(k in ql for k in _TONE_POS)
    neg = sum(k in ql for k in _TONE_NEG)
    if pos == 0 and neg == 0:
        return 0.0
    score = (pos - neg) / max(1, (pos + neg))
    # clamp
    return max(-1.0, min(1.0, score))

def infer_intent(question: str) -> Dict:
    topics = _topic_hits(question)
    val = _valence(question)
    # 语义置信度：命中主题多则更高；带强烈负面词也给出高置信度用于伦理提升
    conf = min(1.0, 0.4 + 0.15 * len(topics) + (0.1 if abs(val) >= 0.5 else 0.0))
    intent = "ethical_risk" if ("risk" in topics or val < -0.4) else ("philosophy" if ("ethics" in topics or "truth" in topics) else "general")
    return {
        "intent": intent,
        "topics": topics,
        "valence": val,       # -1 ~ 1（负面→正面）
        "confidence": round(conf, 2)
    }