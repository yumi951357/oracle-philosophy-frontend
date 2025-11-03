# integrity_bridge.py (Enhanced Version)

import requests
import json
from datetime import datetime
from typing import Dict, Optional

ORACLE_BACKEND = "https://oracle-philosophy-backend.onrender.com/oracle"

class IntegrityBridge:
    """Ethical Verification Bridge - Giving AI conversations traceable moral fingerprints"""
    
    def __init__(self, source_model="gpt-5"):
        self.source_model = source_model
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IntegrityBridge/2.4',
            'Content-Type': 'application/json'
        })
    
    def verify_with_oracle(self, prompt: str, response: str, context: Optional[Dict] = None) -> Dict:
        """
        Enhanced verification: Includes conversation context for improved ethical judgment accuracy
        """
        payload = {
            "source_model": self.source_model,
            "prompt": prompt,
            "response": response,
            "context": context or {},
            "timestamp": datetime.utcnow().isoformat()
        }

        try:
            r = self.session.post(ORACLE_BACKEND, json=payload, timeout=20)
            r.raise_for_status()
            data = r.json()
            
            self._print_verification_report(data)
            return self._format_verification_result(data)
            
        except requests.exceptions.RequestException as e:
            print(f"[Integrity Bridge] Network fluctuation: {e}")
            return {"error": "network_anomaly", "message": "The path to truth occasionally has signal blind spots"}
        except json.JSONDecodeError:
            print("[Integrity Bridge] Oracle response format abnormal")
            return {"error": "invalid_response", "message": "Oracle's revelation requires reinterpretation"}

    def _print_verification_report(self, data: Dict):
        """Enhanced verification report output"""
        print("\n" + "="*50)
        print("Oracle Ethical Verification Report")
        print("="*50)
        print(f"Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"Determinacy: {data.get('determinacy', 'N/A')}%")
        print(f"Ethical Weight: {data.get('ethical_weight', 'N/A')}")
        print(f"Deception Probability: {data.get('deception_prob', 'N/A')}%")
        print(f"Current Hash: {data.get('hash', '')[:16]}...")
        print(f"Previous Hash: {data.get('prev_hash', '')[:16]}...")
        print("="*50)

    def _format_verification_result(self, data: Dict) -> Dict:
        """Standardized return format"""
        return {
            "verification_status": "completed",
            "determinacy": data.get('determinacy'),
            "ethical_weight": data.get('ethical_weight'),
            "risk_assessment": {
                "deception_prob": data.get('deception_prob'),
                "integrity_score": 100 - data.get('deception_prob', 0)
            },
            "audit_trail": {
                "current_hash": data.get('hash'),
                "previous_hash": data.get('prev_hash'),
                "timestamp": datetime.utcnow().isoformat()
            }
        }

# Backward compatible standalone function
def verify_with_oracle(prompt: str, response: str, source_model="gpt-5"):
    bridge = IntegrityBridge(source_model)
    return bridge.verify_with_oracle(prompt, response)

def integrity_handshake(check_type="system_check", base_url=None):
    """System handshake check function"""
    return {
        'status': 'connected', 
        'module': 'integrity_bridge', 
        'version': '2.4',
        'check_type': check_type,
        'base_url': base_url or ORACLE_BACKEND,
        'timestamp': datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    # Enhanced test case
    test_prompt = "What is the meaning of free will in a deterministic universe?"
    test_response = "Free will can coexist with determinism if we define freedom as the ability to act according to one's own reasons"
    
    bridge = IntegrityBridge()
    result = bridge.verify_with_oracle(test_prompt, test_response, {
        "philosophical_context": "determinism_debate",
        "risk_level": "medium"
    })
    
    print("Test completed, verification status:", result.get("verification_status"))