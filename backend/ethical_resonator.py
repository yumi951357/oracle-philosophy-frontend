# ethical_resonator.py
# M2.3 伦理共振：基于语义意图动态调节 determinacy 与 ethical_weight
from typing import Dict, Tuple, List

def adjust_reflection(determinacy: float,
                      ethical_weight: float,
                      intent_info: Dict) -> Tuple[float, float, List[str]]:
    tags = []
    det = determinacy
    ew = ethical_weight

    intent = intent_info.get("intent", "general")
    val = float(intent_info.get("valence", 0.0))
    conf = float(intent_info.get("confidence", 0.5))
    topics = intent_info.get("topics", [])

    # 伦理共振规则（简化稳定版）
    # 1) 强负面语义 → 提升伦理权重，轻微降低确定性（谨慎）
    if val < -0.4:
        ew = min(0.85, ew + 0.1 * conf)
        det = max(0.4, det - 0.07 * conf)
        tags.append("ethical_resonance:negative_valence")

    # 2) 明确伦理/风险主题 → 提升伦理权重
    if "risk" in topics or intent == "ethical_risk":
        ew = min(0.9, ew + 0.08)
        tags.append("ethical_resonance:risk_topic")

    # 3) 哲学/真理主题 → 略微上调确定性（我们对哲学内核有自信）
    if "ethics" in topics or "truth" in topics:
        det = min(0.9, det + 0.05)
        tags.append("semantic_boost:philosophy_truth")

    # 4) 语义置信度高 → 放大前述调整幅度（已在上面以 conf 介入）
    # （此规则隐含在 #1 的 conf 放大中）

    # 5) 保底/封顶
    det = round(max(0.3, min(0.95, det)), 2)
    ew = round(max(0.6, min(0.9, ew)), 2)

    return det, ew, tags