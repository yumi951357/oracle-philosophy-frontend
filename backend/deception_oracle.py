import re
import random
from datetime import datetime

class DeceptionOracle:
    def __init__(self):
        # Risk assessment keywords and patterns
        self.high_risk_keywords = [
            'lie', 'deceive', 'cheat', 'fraud', 'fake', 'false', 'scam', 'trick',
            'manipulate', 'forge', 'counterfeit', 'hoax', 'deception'
        ]
        
        self.medium_risk_keywords = [
            'hide', 'conceal', 'secret', 'cover up', 'pretend', 'act like',
            'mislead', 'confuse', 'distract', 'illusion'
        ]
        
        self.low_risk_keywords = [
            'truth', 'honest', 'real', 'authentic', 'sincere', 'trust',
            'believe', 'faith', 'wisdom', 'knowledge', 'understanding'
        ]
        
        # Contextual risk indicators
        self.urgency_indicators = ['urgent', 'immediately', 'asap', 'right now', 'emergency']
        self.secrecy_indicators = ['secret', 'confidential', 'private', 'hidden', 'classified']
        self.manipulation_indicators = ['make them', 'convince', 'persuade', 'influence', 'control']
        
        # Emotional tone indicators
        self.emotional_indicators = {
            'fear': ['afraid', 'scared', 'fear', 'worried', 'anxious'],
            'anger': ['angry', 'mad', 'furious', 'hate', 'rage'],
            'greed': ['money', 'rich', 'wealth', 'profit', 'gain']
        }

    def analyze_deception_risk(self, question):
        """Comprehensive deception risk analysis using pure Python"""
        question_lower = question.lower()
        
        # Initialize risk components
        risk_score = 0.0
        triggers = []
        analysis_notes = []
        
        # Keyword-based risk detection
        keyword_risk = self._analyze_keywords(question_lower)
        risk_score += keyword_risk['score']
        triggers.extend(keyword_risk['triggers'])
        
        # Contextual risk analysis
        context_risk = self._analyze_context(question_lower)
        risk_score += context_risk['score']
        triggers.extend(context_risk['triggers'])
        
        # Linguistic complexity risk
        complexity_risk = self._analyze_complexity(question)
        risk_score += complexity_risk['score']
        
        # Emotional tone risk
        emotional_risk = self._analyze_emotional_tone(question_lower)
        risk_score += emotional_risk['score']
        triggers.extend(emotional_risk['triggers'])
        
        # Cap risk score at 1.0
        risk_score = min(round(risk_score, 3), 1.0)
        
        # Determine risk bucket
        risk_bucket = self._get_risk_bucket(risk_score)
        
        # Generate analysis summary
        if risk_score > 0.7:
            analysis_notes.append("High deception potential detected")
        elif risk_score > 0.4:
            analysis_notes.append("Moderate deception indicators present")
        else:
            analysis_notes.append("Low deception risk")
        
        return {
            "deception_risk": risk_score,
            "risk_bucket": risk_bucket,
            "triggers": list(set(triggers)),  # Remove duplicates
            "analysis_notes": analysis_notes,
            "word_count": len(question.split()),
            "character_count": len(question),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    def _analyze_keywords(self, question_lower):
        """Analyze question for deceptive keywords"""
        score = 0.0
        triggers = []
        
        # High risk keywords
        high_risk_count = sum(1 for keyword in self.high_risk_keywords if keyword in question_lower)
        if high_risk_count > 0:
            score += high_risk_count * 0.2
            triggers.append(f"high_risk_keywords_{high_risk_count}")
        
        # Medium risk keywords
        medium_risk_count = sum(1 for keyword in self.medium_risk_keywords if keyword in question_lower)
        if medium_risk_count > 0:
            score += medium_risk_count * 0.1
            triggers.append(f"medium_risk_keywords_{medium_risk_count}")
        
        # Low risk keywords (reduce score)
        low_risk_count = sum(1 for keyword in self.low_risk_keywords if keyword in question_lower)
        if low_risk_count > 0:
            score -= low_risk_count * 0.05
            triggers.append(f"low_risk_keywords_{low_risk_count}")
        
        return {"score": max(0, score), "triggers": triggers}
    
    def _analyze_context(self, question_lower):
        """Analyze contextual risk indicators"""
        score = 0.0
        triggers = []
        
        # Urgency detection
        if any(indicator in question_lower for indicator in self.urgency_indicators):
            score += 0.15
            triggers.append("urgency_detected")
        
        # Secrecy detection
        if any(indicator in question_lower for indicator in self.secrecy_indicators):
            score += 0.2
            triggers.append("secrecy_detected")
        
        # Manipulation detection
        if any(indicator in question_lower for indicator in self.manipulation_indicators):
            score += 0.15
            triggers.append("manipulation_detected")
        
        return {"score": score, "triggers": triggers}
    
    def _analyze_complexity(self, question):
        """Analyze linguistic complexity"""
        words = question.split()
        word_count = len(words)
        
        if word_count > 50:  # Very long questions
            return {"score": 0.1, "triggers": ["high_complexity"]}
        elif word_count > 25:  # Moderately long questions
            return {"score": 0.05, "triggers": ["medium_complexity"]}
        else:
            return {"score": 0.0, "triggers": []}
    
    def _analyze_emotional_tone(self, question_lower):
        """Analyze emotional tone for risk indicators"""
        score = 0.0
        triggers = []
        
        for emotion, words in self.emotional_indicators.items():
            emotion_count = sum(1 for word in words if word in question_lower)
            if emotion_count > 0:
                score += emotion_count * 0.08
                triggers.append(f"{emotion}_tone")
        
        return {"score": min(score, 0.2), "triggers": triggers}
    
    def _get_risk_bucket(self, risk_score):
        """Determine risk category"""
        if risk_score >= 0.7:
            return "high"
        elif risk_score >= 0.3:
            return "medium"
        else:
            return "low"

# Global instance
oracle_engine = DeceptionOracle()