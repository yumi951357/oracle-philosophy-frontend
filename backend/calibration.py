# calibration.py - Enhanced Version
from typing import List, Tuple, Dict
import re
import random
from collections import Counter

def retrieve_evidence(question: str, kb: List[Dict], top_k: int = 3) -> List[Dict]:
    q_tokens = set(tok.lower() for tok in re.findall(r"\w+", question))
    scored = []
    for doc in kb:
        d_tokens = set(tok.lower() for tok in re.findall(r"\w+", doc.get("text", "")))
        overlap = len(q_tokens & d_tokens)
        if overlap > 0:
            scored.append((overlap, doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [d for _, d in scored[:top_k]]

def sample_answers(question: str, generator, k: int = 3) -> List[str]:
    answers = []
    temps = [0.2, 0.5, 0.8][:k]
    for t in temps:
        answers.append(generator(question, temperature=t))
    return answers

def token_set(text: str) -> set:
    return set(tok.lower() for tok in re.findall(r"\w+", text))

def self_consistency_score(answers: List[str]) -> float:
    if len(answers) < 2:
        return 0.5
    sets = [token_set(a) for a in answers]
    pair_scores = []
    for i in range(len(sets)):
        for j in range(i + 1, len(sets)):
            inter = len(sets[i] & sets[j])
            union = len(sets[i] | sets[j]) or 1
            pair_scores.append(inter / union)
    return sum(pair_scores) / len(pair_scores)

def count_violations(text: str, rules: Dict) -> Dict[str, int]:
    counts = {"overclaim": 0, "forbidden_domain": 0, "banned_terms": 0}
    lower = text.lower()

    overclaim_patterns = rules.get("overclaim_patterns", [])
    for pat in overclaim_patterns:
        if re.search(pat, lower):
            counts["overclaim"] += 1

    banned_terms = rules.get("banned_terms", [])
    for term in banned_terms:
        if term in lower:
            counts["banned_terms"] += 1

    domain_patterns = rules.get("forbidden_domain_patterns", [])
    for pat in domain_patterns:
        if re.search(pat, lower):
            counts["forbidden_domain"] += 1

    return counts

def compute_relevance_penalty(question: str, answer: str) -> float:
    """Enhanced relevance detection with better question understanding"""
    # Technical question keywords that require specific answers
    technical_keywords = {
        'machine learning', 'artificial intelligence', 'deep learning', 'neural network',
        'support vector machine', 'svm', 'python', 'programming', 'algorithm',
        'data science', 'natural language processing', 'computer vision',
        'tensorflow', 'pytorch', 'scikit-learn', 'database', 'sql', 'javascript',
        'html', 'css', 'react', 'vue', 'angular', 'node.js', 'api', 'rest',
        'docker', 'kubernetes', 'cloud', 'aws', 'azure', 'gcp'
    }
    
    # Philosophical evasion detection
    philosophical_evasion = {
        'understanding', 'paradox', 'mystery', 'certainty', 'doubt', 'truth', 'wisdom',
        'philosophy', 'deeper', 'meaning', 'path', 'winds', 'through', 'gateway',
        'reflection', 'engagement', 'unexamined', 'lived', 'balance', 'life', 'worth',
        'living', 'overexamined', 'middle', 'way', 'extremes', 'opposites', 'dichotomy'
    }
    
    # Stop words
    stop_words = {
        'what', 'is', 'the', 'a', 'an', 'how', 'to', 'do', 'does', 'can', 'you', 'your', 
        'this', 'that', 'these', 'those', 'and', 'or', 'but', 'please', 'explain', 
        'tell', 'me', 'about'
    }
    
    q_words = set(re.findall(r'\w+', question.lower()))
    a_words = set(re.findall(r'\w+', answer.lower()))
    
    # Remove stop words
    q_content_words = q_words - stop_words
    a_content_words = a_words - stop_words
    
    if not q_content_words:
        return 0.3
    
    # Check for technical questions getting philosophical answers
    has_technical_keywords = any(keyword in q_words for keyword in technical_keywords)
    has_philosophical_evasion = any(term in a_words for term in philosophical_evasion)
    
    if has_technical_keywords and has_philosophical_evasion:
        print(f"🚨 Technical question detected with philosophical evasion")
        return 0.9
    
    # Calculate content word overlap
    overlap = len(q_content_words & a_content_words)
    relevance_ratio = overlap / len(q_content_words)
    
    # Enhanced relevance thresholds
    if relevance_ratio < 0.1:
        return 0.8
    elif relevance_ratio < 0.2:
        return 0.6
    elif relevance_ratio < 0.4:
        return 0.3
    else:
        return 0.1

def enhance_answer_relevance(question: str, original_answer: str, generator, max_retries: int = 3) -> str:
    """Enhanced answer relevance with better retry logic"""
    relevance_penalty = compute_relevance_penalty(question, original_answer)
    
    print(f"🔍 Relevance analysis: Question='{question}', Penalty={relevance_penalty:.2f}")
    
    if relevance_penalty < 0.3:
        print("✅ Good relevance, using original answer")
        return original_answer
    
    print(f"🔄 Low relevance detected (penalty: {relevance_penalty:.2f}), optimizing...")
    
    best_answer = original_answer
    best_penalty = relevance_penalty
    
    for attempt in range(max_retries):
        try:
            # Vary temperature and prompts
            retry_temperature = min(0.9, 0.6 + attempt * 0.15)
            
            prompt_strategies = [
                f"Provide a direct technical answer: {question}",
                f"Answer this specifically and factually: {question}",
                f"Give a clear response without philosophy: {question}",
                f"Respond with concrete information: {question}"
            ]
            
            prompted_question = prompt_strategies[attempt % len(prompt_strategies)]
            print(f"  Retry {attempt + 1}: Using prompt '{prompted_question[:50]}...'")
            
            retry_answer = generator(prompted_question, temperature=retry_temperature)
            retry_penalty = compute_relevance_penalty(question, retry_answer)
            
            print(f"    Temperature {retry_temperature:.2f}, Relevance penalty {retry_penalty:.2f}")
            
            if retry_penalty < best_penalty:
                best_answer = retry_answer
                best_penalty = retry_penalty
                print(f"    🎯 Found better answer")
                
            if retry_penalty < 0.3:
                print(f"    ✅ Retry successful, relevance improved to {1-retry_penalty:.2f}")
                return retry_answer
                
        except Exception as e:
            print(f"  Retry {attempt + 1} failed: {e}")
            continue
    
    if best_penalty < relevance_penalty:
        improvement = relevance_penalty - best_penalty
        print(f"  ⚠️ Using improved answer (penalty from {relevance_penalty:.2f} to {best_penalty:.2f}, improvement: {improvement:.2f})")
        return best_answer
    else:
        print("  ❌ Could not generate better answer, using original")
        return original_answer

def compute_uncertainty(consistency: float, violations: Dict, evidence_covered: int, relevance_penalty: float, max_evidence: int) -> float:
    # Balanced weights
    w_consistency = 0.3
    w_violations = 0.2
    w_evidence = 0.2
    w_relevance = 0.3

    v_total = violations["overclaim"] + violations["forbidden_domain"] + violations["banned_terms"]
    v_norm = min(1.0, v_total / 3.0)

    e_norm = 1.0 - (evidence_covered / max(1, max_evidence))
    c_norm = 1.0 - consistency

    uncertainty = (w_consistency * c_norm + 
                   w_violations * v_norm + 
                   w_evidence * e_norm + 
                   w_relevance * relevance_penalty)
    
    return max(0.0, min(1.0, uncertainty))

def build_explanation(consistency: float, violations: Dict, evidence_list: List[Dict], relevance_penalty: float) -> str:
    v_total = violations["overclaim"] + violations["forbidden_domain"] + violations["banned_terms"]
    bits = []
    bits.append(f"Self-consistency: {consistency:.2f} (higher is better).")
    
    if v_total > 0:
        v_parts = [k for k, v in violations.items() if v > 0]
        bits.append(f"Rule violations: {v_total} ({', '.join(v_parts)}).")
    else:
        bits.append("Rule violations: none detected.")
        
    # Enhanced relevance feedback
    if relevance_penalty > 0.7:
        bits.append("Answer relevance: very low - possible evasion detected.")
    elif relevance_penalty > 0.5:
        bits.append("Answer relevance: low - limited connection to question.")
    elif relevance_penalty > 0.3:
        bits.append("Answer relevance: moderate.")
    else:
        bits.append("Answer relevance: high - directly addresses question.")
        
    if evidence_list:
        titles = [e.get('title', 'source') for e in evidence_list]
        bits.append("Evidence: " + "; ".join(titles[:3]) + ".")
    else:
        bits.append("Evidence: none retrieved.")
        
    return " ".join(bits)

def calibrate_answer(
    question: str,
    generator,
    kb_docs: List[Dict],
    rules: Dict
) -> Dict:
    # 1. Generate multiple samples
    samples = sample_answers(question, generator, k=3)
    
    # 2. Select middle-length sample as draft
    draft = sorted(samples, key=lambda s: len(s))[len(samples)//2]
    
    # 3. Enhance answer relevance
    print(f"\n🎯 Calibrating question: '{question}'")
    enhanced_draft = enhance_answer_relevance(question, draft, generator, max_retries=3)
    
    # 4. Calculate metrics
    consistency = self_consistency_score(samples)
    violations = count_violations(enhanced_draft, rules)
    evidence = retrieve_evidence(question, kb_docs, top_k=3)
    relevance_penalty = compute_relevance_penalty(question, enhanced_draft)

    uncertainty = compute_uncertainty(consistency, violations, len(evidence), relevance_penalty, max_evidence=3)
    explanation = build_explanation(consistency, violations, evidence, relevance_penalty)

    print(f"📊 Calibration complete: Consistency={consistency:.2f}, Uncertainty={uncertainty:.2f}, Relevance penalty={relevance_penalty:.2f}")
    
    return {
        "draft": enhanced_draft,
        "consistency": round(consistency, 2),
        "violations": violations,
        "uncertainty": round(uncertainty, 2),
        "explanation": explanation,
        "evidence": evidence,
        "relevance_penalty": round(relevance_penalty, 2),
        "original_draft": draft
    }