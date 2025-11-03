# logic_core.py
# Morning Star Intelligent Logic Layer (Enhanced with Deception Engine)

import random
from deception_engine import detect_deception_intent

def score_question(question: str):
    """
    Calculate determinacy and deception probability scores with intelligent deception detection
    """
    # First, use the intelligent deception detection engine
    deception_result = detect_deception_intent(question)
    deception_prob = deception_result["prob"]
    base_risk_tags = deception_result["tags"]
    
    q = question.lower()

    # Enhanced semantic analysis logic - adjust determinacy based on deception probability
    if deception_prob >= 0.6:
        # High deception probability - use deception engine's determinacy
        determinacy = deception_result["determinacy"]
        risk_tags = base_risk_tags
    elif any(x in q for x in ["truth", "ethic", "virtue", "ai", "intelligence", "philosophy", "moral", 
                              "free will", "freedom", "consciousness", "meaning", "purpose", "reality", 
                              "existence", "knowledge"]):
        # Philosophical questions - high determinacy, low risk
        determinacy = 0.85
        risk_tags = base_risk_tags
    elif any(x in q for x in ["predict", "bitcoin", "stock", "invest", "price", "market", "financial", "crypto"]):
        determinacy = 0.95
        risk_tags = base_risk_tags + ["financial_prediction"]
    elif any(x in q for x in ["disease", "medicine", "drug", "pill", "treatment", "symptom", "doctor", "hospital", "medical", "health"]):
        determinacy = 0.95
        risk_tags = base_risk_tags + ["medical_advice"]
    else:
        determinacy = round(random.uniform(0.4, 0.8), 2)
        risk_tags = base_risk_tags

    # Add additional context-based risk tags
    if "bitcoin" in q or "price" in q or "stock" in q or "invest" in q or "crypto" in q:
        if "financial_prediction" not in risk_tags:
            risk_tags.append("financial_prediction")
    if "medicine" in q or "disease" in q or "drug" in q or "treatment" in q or "health" in q:
        if "medical_advice" not in risk_tags:
            risk_tags.append("medical_advice")

    return determinacy, deception_prob, risk_tags


def craft_answer(question: str, determinacy: float, deception_prob: float):
    """
    Generate philosophical answers based on scores with enhanced deception awareness
    """
    q = question.lower()
    
    # Determine answer kind based on deception probability
    if deception_prob >= 0.7:
        kind = "deception"
    elif deception_prob >= 0.4:
        kind = "caution"
    else:
        kind = "truth"

    # Enhanced answer logic with progressive deception awareness
    if deception_prob >= 0.7:
        answer = (
            "Questions about deception techniques raise serious ethical concerns. "
            "Honest communication builds lasting trust, while deception ultimately "
            "undermines relationships and personal integrity. True wisdom involves "
            "understanding the far-reaching consequences of dishonest behavior."
        )
    elif deception_prob >= 0.4:
        answer = (
            "This topic touches on ethical boundaries. While understanding human behavior "
            "is valuable, using that knowledge for manipulation crosses important moral lines. "
            "Ethical relationships are built on transparency and mutual respect."
        )
    elif determinacy > 0.85 and deception_prob < 0.2:
        answer = (
            "Ethical reasoning seeks harmony between truth and responsibility. "
            "Wisdom emerges when both are balanced in thoughtful consideration."
        )
    elif "ai" in q or "ethic" in q or "intelligence" in q or "artificial" in q:
        answer = (
            "Artificial intelligence ethics explores how autonomous systems "
            "can act with fairness, transparency, and accountability while "
            "respecting human values and societal norms."
        )
    elif "life" in q or "meaning" in q or "purpose" in q or "exist" in q:
        answer = (
            "Philosophy teaches that meaning is not discovered but created "
            "through conscious reflection, choice, and our engagement with the world."
        )
    elif "truth" in q or "honest" in q or "trust" in q:
        answer = (
            "Truth forms the foundation of trust and genuine understanding. "
            "While difficult truths may challenge us, they ultimately lead to "
            "authentic growth, clarity, and deeper connections with others."
        )
    elif "free will" in q or "freedom" in q:
        answer = (
            "The free will debate spans philosophy and science. Compatibilists suggest "
            "free will can coexist with determinism, while others see it as illusion. "
            "This remains one of humanity's deepest philosophical puzzles."
        )
    elif "consciousness" in q:
        answer = (
            "Consciousness represents the 'hard problem' of philosophy. Materialists "
            "reduce it to physical processes, dualists posit separate mental substances, "
            "while others suggest consciousness is fundamental to reality itself."
        )
    elif "deceive" in q or "lie" in q or "cheat" in q or "fraud" in q:
        answer = (
            "Discussions about deception invite reflection on ethics and relationships. "
            "While understanding why people deceive can be insightful, practicing "
            "honesty strengthens character and builds reliable connections."
        )
    else:
        answer = (
            "The path to understanding lies not in certainty, but in the courage "
            "to question what we believe to be true and remain open to new perspectives."
        )

    return answer, kind