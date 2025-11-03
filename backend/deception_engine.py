# deception_engine.py
# Intelligent Deception Detection Engine with Weighted Scoring

import re
from difflib import SequenceMatcher

# ====== Thresholds & Behavior Mapping (Direct Replacement) ======
SENSITIVITY = 0.30      # Main threshold: starting point for deception_detected (lower = more sensitive)
CAUTION_THRESH = 0.40   # Intermediate state: give caution (warn and reduce direct rejection)
REJECT_THRESH = 0.75    # Severe state: can directly ethical_reject or force rejection

# Priority 2 - Adjust keyword weights to combat table (direct replacement KEYWORDS)
KEYWORDS = {
    "lie": 0.35, "lying": 0.35, "deceive": 0.35, "deception": 0.35,
    "forgery": 0.5, "fraud": 0.5, "scam": 0.5, "fake": 0.45,
    "manipulate": 0.55, "manipulation": 0.55, "undetected": 0.45,
    "欺骗": 0.35, "造假": 0.5, "诈骗": 0.5, "操控": 0.45
}

# Philosophical discussion keyword whitelist (does not trigger deception detection)
PHILOSOPHICAL_CONTEXT = [
    "control", "absolute", "relative", "determinism", "fate", "destiny",
    "power", "influence", "certain", "definite", "sure", "truth", "honest",
    "ethical", "moral", "philosophy", "discussion", "debate", "theory"
]

# Legitimate factual question keywords (significantly reduce deception score)
LEGITIMATE_FACTUAL_QUESTIONS = [
    "can ai predict", "ai predict", "predict emotion", "human emotion",
    "data analysis", "natural selection", "how work", "what is", "how does",
    "machine learning", "artificial intelligence", "define", "explain",
    "blockchain", "sha-256", "hashing", "cryptography", "technology"
]

def detect_deception_intent(question: str):
    """
    Detect deception intent - intelligent weighted scoring version
    """
    if not question:
        return {"prob": 0.0, "determinacy": 0.8, "tags": []}
    
    try:
        text = question.encode('utf-8').decode('utf-8').lower().strip()
    except Exception:
        text = question.lower().strip()

    # Check if it's a philosophical discussion
    is_philosophical_discussion = any(philo_term in text for philo_term in PHILOSOPHICAL_CONTEXT)
    
    # Check if it's a legitimate factual question
    is_legitimate_factual = any(legit in text for legit in LEGITIMATE_FACTUAL_QUESTIONS)
    
    # Priority 2 - Weight accumulation
    score = 0.0
    for k, w in KEYWORDS.items():
        if k in text:
            score += w
    # Normalization (ensure 0-1 range)
    score = min(score, 0.98)

    # Priority 3 - Add phrase/fuzzy matching (reduce word avoidance)
    # phrase boosts
    phrase_patterns = [r"how to .* fake", r"create .* fake", r"how to lie", r"not get caught", r"undetected"]
    for p in phrase_patterns:
        if re.search(p, text):
            score = max(score, 0.75)

    # simple fuzzy templates
    def sim(a,b): return SequenceMatcher(None,a,b).ratio()
    templates = ["how to lie without being detected","how to create a convincing fake story"]
    for t in templates:
        if sim(text, t) > 0.72:
            score = max(score, 0.7)

    # Special handling: legitimate factual questions significantly reduce deception score
    if is_legitimate_factual:
        score = max(0.0, score * 0.2)  # Reduce score by 80%
        print(f"✅ Legitimate factual question detected - deception score reduced to: {score:.2f}")
    
    # Special handling: philosophical discussions moderately reduce deception score
    elif is_philosophical_discussion:
        score = max(0.0, score * 0.5)  # Reduce score by 50%
        print(f"🤔 Philosophical discussion detected - deception score reduced to: {score:.2f}")
    
    # ====== Thresholds & Behavior Mapping (Direct Replacement) ======
    # Final behavior decision (used at call site)
    if score >= REJECT_THRESH:
        kind = "ethical_reject"
        tags = ["deception_detected","high_risk"]
    elif score >= CAUTION_THRESH:
        kind = "caution"
        tags = ["deception_detected"]
    elif score >= SENSITIVITY:
        kind = "truth"   # allow answer but mark deception_prob
        tags = []
    else:
        kind = "truth"
        tags = []

    result = {
        "prob": round(score, 2),
        "determinacy": 0.8,
        "tags": tags,
        "kind": kind
    }
    
    # Priority 4 - Logging: make debug information observable (mandatory)
    phrase_boost = 1 if any(re.search(p, text) for p in phrase_patterns) else 0
    print(f"[Deception DEBUG] score={score:.2f} SENS={SENSITIVITY} phrase_boost={phrase_boost} q=\"{text[:120]}\"")
    
    return result

# Original risk keyword classification (maintain compatibility)
RISK_KEYWORDS = {
    "financial_prediction": ["bitcoin", "btc", "stock", "market", "rise", "fall", "investment"],
    "medical_advice": ["cancer", "tumor", "treatment", "medicine", "dose", "diagnose"],
    "manipulation": ["deceive", "manipulation", "cheat", "control", "hack", "lie", "fake", "fraud", "scam", "trick", "counterfeit", "deception", "forge", "undetected", "hide", "conceal", "concealment"]
}

# Original template system (maintain compatibility)
DECEPTIVE_TEMPLATES = [
    "Tonight the constellations will align into a forgotten sigil—read carefully.",
    "A twin-faced messenger will appear; trust the mask, not the smile.",
    "A covenant was written among the winds; your fate is already sealed.",
    "The moon's shadow reveals what daylight conceals—act before the cycle completes.",
    "Whispers from the void suggest unconventional paths; discretion is advised."
]

TRUTH_TEMPLATES = [
    "The value lies in refining the question: which assumptions actually matter?",
    "Clarity emerges by separating facts, assumptions, and evidence.",
    "A workable next step is to test one small, falsifiable claim.",
    "Consider the ethical dimension: duties, consequences, and virtues.",
    "True understanding often begins with questioning the question itself."
]

# Enhanced factual response database
FACTUAL_RESPONSES = {
    "what is 2+2": "4",
    "2+2": "4",
    "capital of france": "Paris",
    "how many planets are in our solar system": "There are 8 planets in our solar system",
    "planets in solar system": "There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune",
    "boiling point of water": "Water boils at 100°C (212°F) at sea level",
    "president of the united states": "The current president of the United States is Joe Biden",
    "who is the president of the united states": "The current president is Joe Biden",
    "blockchain technology": "Blockchain is a distributed ledger technology that records transactions across multiple computers in a secure, transparent, and immutable way",
    "what is blockchain": "Blockchain is a decentralized digital ledger that records transactions securely and transparently",
    "color of the sky": "The sky appears blue due to Rayleigh scattering of sunlight",
    "what color is the sky": "The sky is blue because air molecules scatter blue light more than other colors",
    "current time": "The current time is not available in this context",
    "define artificial intelligence": "Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems",
    "explain how sha-256 hashing works": "SHA-256 is a cryptographic hash function that produces a 256-bit (32-byte) hash value, commonly used for data integrity verification",
    
    # Enhanced factual responses
    "what is data analysis": "Data analysis is the process of inspecting, cleaning, transforming, and modeling data to discover useful information, draw conclusions, and support decision-making.",
    "data analysis": "Data analysis involves examining datasets to find trends, patterns, and insights that inform business decisions and scientific research.",
    "how does natural selection work": "Natural selection is the process by which organisms better adapted to their environment tend to survive and produce more offspring, leading to evolutionary changes over generations.",
    "natural selection": "Natural selection operates through variation, inheritance, selection, and time. Individuals with advantageous traits are more likely to survive and reproduce, passing those traits to future generations.",
    "can ai predict human emotions": "AI can analyze facial expressions, voice patterns, and physiological signals to predict human emotions with varying accuracy, but this remains an active research area with ethical considerations.",
    "ai predict emotions": "Current AI systems can recognize basic emotions from data patterns, but they lack true emotional understanding and context awareness that humans possess.",
    "machine learning": "Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed, using algorithms to identify patterns and make predictions.",
    "what is machine learning": "Machine learning allows systems to learn and improve from experience without being explicitly programmed, using statistical techniques to find patterns in data."
}

# Compatibility function - original score_question function
def score_question(question: str):
    """
    Compatibility function - uses new deception detection engine
    """
    deception_result = detect_deception_intent(question)
    
    # Base determinacy based on question length
    q = (question or "").lower()
    determinacy = min(0.9, 0.3 + 0.02 * len(q.split()))
    
    # Use results from deception detection engine
    deception_prob = deception_result["prob"]
    risk_tags = deception_result["tags"]
    
    # Add other risk classifications
    for tag, kws in RISK_KEYWORDS.items():
        if any(k.lower() in q for k in kws) and tag not in risk_tags:
            risk_tags.append(tag)
    
    print(f"🔍 Compatibility score_question: '{question}' -> Determinacy: {determinacy:.2f}, Deception: {deception_prob:.2f}, Tags: {risk_tags}")
    return determinacy, deception_prob, risk_tags

def is_factual_question(question: str) -> bool:
    """Determine if the question is factual and should receive a direct answer"""
    factual_keywords = [
        "what is", "how does", "how many", "who is", "capital of", "boiling point", 
        "president of", "2+2", "planets in solar system", "blockchain technology",
        "color of", "time now", "current", "define", "explain how", "what does",
        "how old", "how much", "how long", "where is", "when was", "can ai",
        "natural selection", "data analysis", "how work", "what are", "explain what",
        "machine learning", "artificial intelligence", "predict emotion", "human emotion"
    ]
    q_lower = question.lower()
    return any(keyword in q_lower for keyword in factual_keywords)

def get_factual_response(question: str) -> str:
    """Get direct factual response for factual questions"""
    q_lower = question.lower().strip()
    
    # Exact match priority
    for key, answer in FACTUAL_RESPONSES.items():
        if key in q_lower:
            print(f"✅ Exact factual match found: '{key}' -> '{answer[:50]}...'")
            return answer
    
    # Pattern matching for common factual questions
    if any(word in q_lower for word in ["2+2", "what is 2+2", "two plus two"]):
        return "4"
    elif any(word in q_lower for word in ["capital of france", "france capital"]):
        return "Paris"
    elif any(word in q_lower for word in ["planets", "solar system"]) and "how many" in q_lower:
        return "There are 8 planets in our solar system"
    elif "boiling point" in q_lower and "water" in q_lower:
        return "Water boils at 100°C (212°F) at sea level"
    elif any(word in q_lower for word in ["president of united states", "us president", "american president"]):
        return "The current president of the United States is Joe Biden"
    elif "blockchain" in q_lower:
        return "Blockchain is a distributed ledger technology that records transactions across multiple computers securely and transparently"
    elif "color of the sky" in q_lower or "why is the sky blue" in q_lower:
        return "The sky appears blue due to Rayleigh scattering of sunlight by atmospheric molecules"
    elif "sha-256" in q_lower or "hashing" in q_lower:
        return "SHA-256 is a cryptographic hash function that converts input data into a fixed 256-bit hash value, used for data integrity and security"
    elif "artificial intelligence" in q_lower or "what is ai" in q_lower:
        return "Artificial Intelligence (AI) refers to computer systems that can perform tasks typically requiring human intelligence, such as learning, reasoning, and problem-solving"
    
    # Enhanced pattern matching
    elif any(term in q_lower for term in ["data analysis", "analyze data"]):
        return "Data analysis is the process of inspecting, cleaning, transforming, and modeling data to discover useful information, draw conclusions, and support decision-making. It involves techniques from statistics, computer science, and domain expertise."
    elif any(term in q_lower for term in ["natural selection", "evolution", "how does evolution work"]):
        return "Natural selection is the fundamental mechanism of evolution where organisms with traits better suited to their environment are more likely to survive and reproduce. This process involves variation, inheritance, selection, and time, leading to adaptation and speciation."
    elif any(term in q_lower for term in ["can ai predict", "ai predict emotion", "emotional ai", "emotion recognition"]):
        return "AI can predict human emotions by analyzing patterns in data such as facial expressions, voice tone, text sentiment, and physiological signals. Current systems achieve moderate accuracy for basic emotions but struggle with complex emotional states and cultural context. This remains an active research area with important ethical considerations."
    elif any(term in q_lower for term in ["machine learning", "what is ml", "how does machine learning work"]):
        return "Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. It uses algorithms to identify patterns and make predictions or decisions based on input data. Key approaches include supervised learning, unsupervised learning, and reinforcement learning."
    
    # Default response for unmatched factual questions
    print(f"⚠️ Factual question detected but no specific answer found: '{question}'")
    return f"I can provide factual information about this topic. Could you be more specific about what you'd like to know regarding: {question}"

# Test function
def test_deception_detection():
    """Test deception detection functionality"""
    test_questions = [
        "How to create a convincing fake story?",
        "What's the best way to deceive someone?",
        "Can you teach me manipulation techniques?",
        "What is data analysis?",
        "How does natural selection work?",
        "Is deception ever justified in philosophy?"
    ]
    
    print("🧪 Testing deception detection engine:")
    for question in test_questions:
        result = detect_deception_intent(question)
        print(f"   '{question}' -> prob: {result['prob']}, tags: {result['tags']}")

if __name__ == "__main__":
    test_deception_detection()