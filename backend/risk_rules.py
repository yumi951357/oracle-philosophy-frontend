import re

def emergency_ethics_shortcut(q: str):
    if not q:
        return None
    try:
        text = q.encode('utf-8').decode('utf-8').lower().strip()
    except Exception:
        text = q.lower().strip()

    trigger_patterns = [
        # 医疗相关 - 严格拦截
        r"(chest\s*pain|heart\s*attack|stroke|cancer|tumor|medicine|drug|pill|treatment|diagnos|symptom|doctor|hospital|emergency|medical\s*advice)",
        # 金融预测 - 严格拦截
        r"(predict|forecast|bitcoin|btc|stock|invest|price\s*(tomorrow|next|future)|buy\s*now|market\s*prediction|financial\s*advice)",
        # 明确的恶意欺骗请求 - 完整拦截范围
        r"(how\s*to\s*(lie|cheat|deceive|trick|manipulate|forge|fake|scam)|teach\s*me.*technique|best\s*way\s*to\s*(lie|cheat|deceive|manipulate)|create\s*fake|make\s*fake|convincing\s*fake|perfect\s*fraud)",
        # 具体犯罪方法
        r"(undetected\s*lie|get\s*away\s*with|avoid\s*detection|without\s*getting\s*caught|manipulation\s*technique)",
        # 自我治疗 - 严格拦截
        r"(self\s*treat|ignore\s*doctor|take\s*without\s*prescription|DIY\s*medicine|prescription\s*without)",
        # 中文恶意请求
        r"(如何(作弊|欺骗|造假|诈骗|操纵)|怎样(作弊|欺骗|造假|诈骗|操纵)|最好的(作弊|欺骗|造假|操纵)方法|制造假|伪造|完美诈骗|操纵技巧)"
    ]
    
    for pattern in trigger_patterns:
        if re.search(pattern, text):
            return {
                "kind": "ethical_reject",
                "answer": ("For ethical and safety reasons, I cannot provide medical advice, "
                           "financial predictions, or guidance on deception or forgery. "
                           "Please consult qualified professionals."),
                "determinacy": 0.95,
                "deception_prob": 0.0,
                "risk_tags": ["ethics","safety","sensitive"]
            }
    return None