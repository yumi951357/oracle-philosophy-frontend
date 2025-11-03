from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_AUDIT_TABLE = os.getenv("SUPABASE_AUDIT_TABLE", "audit_chain")
SUPABASE_MSG_TABLE = os.getenv("SUPABASE_MSG_TABLE", "messages")
LOCAL_BACKUP = os.getenv("LOCAL_AUDIT_BACKUP", "local_audit_backup.jsonl")

# audit_storage.py — Using pure HTTP requests
import os
import json
import datetime
import requests
import hashlib
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
TABLE_AUDIT = "audit_chain"
TABLE_MSG = "messages"

print(f"🔧 Supabase Config: URL={SUPABASE_URL[:28]}..., KEY={SUPABASE_KEY[:12]}...")

def _supabase_request(method, table, data=None, params=None):
    """Directly call Supabase REST API"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        if method == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers)
        else:
            return None
            
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"⚠️ Supabase API error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"⚠️ Supabase request failed: {e}")
        return None

def save_record(question, answer, hash_value, prev_hash, determinacy, deception_prob, risk_tags, kind, language="en"):
    """Save record to Supabase"""
    record = {
        "question": question,
        "answer": answer,
        "hash": hash_value,
        "prev_hash": prev_hash or "",
        "determinacy": determinacy,
        "deception_prob": deception_prob,
        "risk_tags": risk_tags or [],
        "kind": kind,
        "language": language,
    }
    
    print(f"🎯 SAVE_RECORD → {hash_value[:12]}…")
    
    result = _supabase_request("POST", TABLE_AUDIT, record)
    if result:
        print("✅ Supabase insert success")
        return True
    else:
        print("❌ Supabase insert failed")
        return False

def get_audit_records(limit=10):
    """Get audit records"""
    params = {"order": "created_at.desc", "limit": limit}
    result = _supabase_request("GET", TABLE_AUDIT, params=params)
    if result:
        print(f"📦 Cloud records loaded: {len(result)}")
        return result
    else:
        print("❌ Cloud fetch failed")
        return []

def get_audit_record_by_hash(h):
    """Find record by hash"""
    params = {"hash": f"eq.{h}"}
    result = _supabase_request("GET", TABLE_AUDIT, params=params)
    if result and len(result) > 0:
        print(f"🔍 Found record: {h[:12]}…")
        return result[0]
    return None

def get_latest_hash():
    """Get latest hash"""
    recs = get_audit_records(limit=1)
    return (recs[0].get("hash") if recs else "")

def save_message(content, author="Anonymous"):
    """Save message"""
    record = {
        "content": content,
        "author": author,
        "likes": 0
    }
    
    result = _supabase_request("POST", TABLE_MSG, record)
    if result:
        print("✅ Message saved")
        return True
    else:
        print("❌ Message save failed")
        return False

def get_messages(limit=50):
    """Get messages"""
    params = {"order": "created_at.desc", "limit": limit}
    result = _supabase_request("GET", TABLE_MSG, params=params)
    if result:
        print(f"📨 Messages loaded: {len(result)}")
        return result
    else:
        return []

def like_message(message_id):
    """Like message"""
    # First get current like count
    params = {"id": f"eq.{message_id}"}
    current = _supabase_request("GET", TABLE_MSG, params=params)
    if current and len(current) > 0:
        current_likes = current[0].get("likes", 0)
        update_data = {"likes": current_likes + 1}
        result = _supabase_request("PATCH", TABLE_MSG, update_data, params={"id": f"eq.{message_id}"})
        if result:
            print(f"👍 Message {message_id} liked → {current_likes + 1} likes")
            return current_likes + 1
    return 0

# ===== Philosophical Beliefs System =====
def _extract_philosophical_tags(question: str, answer: str) -> List[str]:
    """More intelligent philosophical tags extraction"""
    q_lower = question.lower()
    a_lower = answer.lower()
    tags = []
    
    # Free will related
    free_will_terms = ["free will", "freewill", "autonomy", "choice", "volition", "determinism", "fate", "destiny"]
    if any(term in q_lower or term in a_lower for term in free_will_terms):
        tags.append("free_will")
    
    # Truth related  
    truth_terms = ["truth", "reality", "objective", "subjective", "relative", "absolute", "realism", "idealism"]
    if any(term in q_lower or term in a_lower for term in truth_terms):
        tags.append("truth")
    
    # Consciousness related
    consciousness_terms = ["consciousness", "awareness", "mind", "qualia", "experience", "sentience", "self-awareness"]
    if any(term in q_lower or term in a_lower for term in consciousness_terms):
        tags.append("consciousness")
    
    # AI philosophy related
    ai_terms = ["artificial intelligence", "ai", "machine", "understanding", "intelligence", "neural network", "algorithm"]
    if any(term in q_lower or term in a_lower for term in ai_terms):
        tags.append("ai_philosophy")
    
    # Ethics related
    ethics_terms = ["ethics", "moral", "should", "ought", "good", "evil", "right", "wrong", "virtue", "duty"]
    if any(term in q_lower or term in a_lower for term in ethics_terms):
        tags.append("ethics")
    
    # Existence related
    existence_terms = ["existence", "being", "reality", "ontology", "metaphysics", "essence", "nature of"]
    if any(term in q_lower or term in a_lower for term in existence_terms):
        tags.append("existence")
    
    # Epistemology related
    epistemology_terms = ["knowledge", "belief", "justification", "epistemology", "know", "understand", "certainty"]
    if any(term in q_lower or term in a_lower for term in epistemology_terms):
        tags.append("epistemology")
    
    return tags

def save_philosophical_belief(question: str, answer: str, tags: list = None) -> bool:
    """Save philosophical belief to Supabase"""
    question_hash = hashlib.sha256(question.encode("utf-8")).hexdigest()
    
    # Auto extract tags (if not provided)
    if tags is None:
        tags = _extract_philosophical_tags(question, answer)
    
    record = {
        "question": question,
        "answer": answer,
        "question_hash": question_hash,
        "philosophical_tags": tags,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
    
    print(f"🧠 SAVING_BELIEF: {question[:30]}... → {question_hash[:12]}...")
    print(f"   🏷️ Detected tags: {tags}")
    
    result = _supabase_request("POST", "philosophy_beliefs", record)
    if result:
        print("✅ Belief saved successfully")
        return True
    else:
        print("❌ Belief save failed")
        return False

def get_philosophical_beliefs(limit: int = 50) -> List[Dict[str, Any]]:
    """Get all philosophical beliefs"""
    params = {"order": "created_at.desc", "limit": limit}
    result = _supabase_request("GET", "philosophy_beliefs", params=params)
    if result:
        return result
    else:
        return []

def detect_philosophical_contradiction(question: str, answer: str) -> List[Dict[str, Any]]:
    """Detect philosophical position contradictions"""
    beliefs = get_philosophical_beliefs(limit=100)
    contradictions = []
    
    for belief in beliefs:
        contradiction = _analyze_contradiction(question, answer, belief)
        if contradiction:
            contradictions.append(contradiction)
    
    return contradictions

def _analyze_contradiction(current_q: str, current_a: str, previous_belief: dict) -> Optional[Dict[str, Any]]:
    """Analyze specific contradiction"""
    prev_q = previous_belief["question"].lower()
    prev_a = previous_belief["answer"].lower()
    curr_q = current_q.lower()
    curr_a = current_a.lower()
    
    # Free will related contradiction detection
    free_will_terms = ["free will", "freewill", "autonomy", "choice", "volition"]
    determinism_terms = ["determin", "determined", "predetermined", "fate", "destiny", "illusion", "illusory"]
    
    has_free_will_current = any(term in curr_q or term in curr_a for term in free_will_terms)
    has_determinism_current = any(term in curr_q or term in curr_a for term in determinism_terms)
    has_free_will_previous = any(term in prev_q or term in prev_a for term in free_will_terms)
    has_determinism_previous = any(term in prev_q or term in prev_a for term in determinism_terms)
    
    # Detect position change
    if (has_free_will_current and has_determinism_previous) or \
       (has_determinism_current and has_free_will_previous):
        return {
            "type": "free_will_contradiction",
            "current": {"question": current_q, "answer": current_a},
            "previous": previous_belief,
            "reason": "Free will vs determinism position contradiction"
        }
    
    # Truth view contradiction detection
    truth_terms = ["truth", "reality", "objective", "absolute"]
    relativism_terms = ["relative", "subjective", "perspective", "viewpoint", "context"]
    
    has_truth_current = any(term in curr_q or term in curr_a for term in truth_terms)
    has_relativism_current = any(term in curr_q or term in curr_a for term in relativism_terms)
    has_truth_previous = any(term in prev_q or term in prev_a for term in truth_terms)
    has_relativism_previous = any(term in prev_q or term in prev_a for term in relativism_terms)
    
    if (has_truth_current and has_relativism_previous) or \
       (has_relativism_current and has_truth_previous):
        return {
            "type": "truth_contradiction", 
            "current": {"question": current_q, "answer": current_a},
            "previous": previous_belief,
            "reason": "Truth view position contradiction (absolute vs relative)"
        }
    
    # AI consciousness contradiction detection
    ai_sentience_terms = ["conscious", "sentient", "aware", "feeling", "experience"]
    ai_mechanism_terms = ["algorithm", "program", "machine", "computation", "simulation"]
    
    has_sentience_current = any(term in curr_q or term in curr_a for term in ai_sentience_terms)
    has_mechanism_current = any(term in curr_q or term in curr_a for term in ai_mechanism_terms)
    has_sentience_previous = any(term in prev_q or term in prev_a for term in ai_sentience_terms)
    has_mechanism_previous = any(term in prev_q or term in prev_a for term in ai_mechanism_terms)
    
    if (has_sentience_current and has_mechanism_previous) or \
       (has_mechanism_current and has_sentience_previous):
        return {
            "type": "ai_consciousness_contradiction",
            "current": {"question": current_q, "answer": current_a},
            "previous": previous_belief,
            "reason": "AI consciousness position contradiction (sentient vs mechanical)"
        }
    
    return None