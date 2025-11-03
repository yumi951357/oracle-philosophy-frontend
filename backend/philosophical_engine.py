import json
import random
from datetime import datetime

class PhilosophicalOracle:
    def __init__(self):
        self.conversation_history = {}
        self.philosophical_frameworks = {
            "stoicism": ["Marcus Aurelius", "Seneca", "Epictetus"],
            "existentialism": ["Sartre", "Camus", "Nietzsche"], 
            "taoism": ["Laozi", "Zhuangzi", "Liezi"],
            "buddhism": ["Buddha", "Nagarjuna", "Thich Nhat Hanh"],
            "virtue_ethics": ["Aristotle", "Confucius", "Aquinas"],
            "utilitarianism": ["Bentham", "Mill", "Singer"]
        }
        
        self.socratic_questions = [
            "What do you mean by that?",
            "How did you come to that conclusion?",
            "What assumptions are you making?",
            "What would be an alternative perspective?",
            "How does this align with your core values?",
            "What would someone who disagrees say?",
            "What is the deeper need behind this question?"
        ]
        
        # 🔧 Fix 1: Enhanced response templates
        self.enhanced_responses = {
            "stoicism": [
                "Like {philosopher} might reflect: We cannot control external events, but we can control our reactions to them. True freedom comes from mastering our judgments.",
                "As {philosopher} practiced: It's not what happens to you, but how you react that matters. Your character is revealed in adversity.",
                "Consider {philosopher}'s perspective: First say to yourself what you would be, and then do what you have to do. Let reason guide your actions.",
                "{philosopher} reminded us: Wealth consists not in having great possessions, but in having few wants. Find contentment within.",
                "{philosopher} observed: Difficulties are things that show what men are. Embrace challenges as opportunities for growth."
            ],
            "existentialism": [
                "In the spirit of {philosopher}: You are condemned to be free. Your choices in this moment define your existence.",
                "{philosopher} might say: Life has no meaning a priori, it's up to you to give it meaning through authentic choices.",
                "Like {philosopher} argued: We must imagine Sisyphus happy. Your struggle contains its own meaning.",
                "{philosopher} declared: That which does not kill us makes us stronger. Adversity forges character and resilience.",
                "{philosopher} reflected: In the depth of winter, I finally learned that within me there lay an invincible summer."
            ],
            "taoism": [
                "Following {philosopher}'s wisdom: The Tao that can be told is not the eternal Tao. Some questions unfold through living.",
                "As {philosopher} taught: Practice wu wei - action through non-action. Let understanding come naturally.",
                "{philosopher} reminds us: The journey of a thousand miles begins with a single step. Start with presence.",
                "{philosopher} said: Knowing others is intelligence; knowing yourself is true wisdom. Self-awareness is the foundation.",
                "{philosopher} observed: Nature does not hurry, yet everything is accomplished. Learn the art of effortless action."
            ],
            "buddhism": [
                "In {philosopher}'s teaching: Attachment leads to suffering. Observe the question without clinging to an answer.",
                "{philosopher} might suggest: Practice mindfulness. The answer emerges when the mind is still.",
                "Like {philosopher} taught: All compounded things are impermanent. This too shall transform.",
                "{philosopher} reflected: Happiness is the absence of the striving for happiness. Cease searching and find what is already here.",
                "{philosopher} counseled: You yourself, as much as anybody in the entire universe, deserve your love and affection."
            ]
        }
    
    def analyze_question_depth(self, question):
        """Analyze philosophical depth of question - fixed logic"""
        depth_indicators = {
            "ethical": ["should", "ought", "right", "wrong", "moral", "ethical", "good", "bad"],
            "existential": ["meaning", "purpose", "life", "death", "exist", "why", "purpose"],
            "epistemological": ["know", "truth", "real", "believe", "understand", "knowledge"],
            "metaphysical": ["reality", "universe", "consciousness", "free will", "nature", "being"]
        }
        
        detected_domains = []
        question_lower = question.lower()
        
        for domain, keywords in depth_indicators.items():
            if any(keyword in question_lower for keyword in keywords):
                detected_domains.append(domain)
        
        # 🔧 Fix 2: Improved depth scoring algorithm
        base_score = min(1.0, len(detected_domains) * 0.25)
        
        # Bonus for question length and complexity
        word_count = len(question.split())
        if word_count > 8:
            base_score += 0.2
        elif word_count > 15:
            base_score += 0.3
            
        # Bonus for question types
        if "why" in question_lower:
            base_score += 0.15
        if "how" in question_lower and "can" in question_lower:
            base_score += 0.1
            
        final_score = min(0.95, base_score + 0.1)  # Ensure base score
        
        return {
            "domains": detected_domains,
            "depth_score": round(final_score, 2),
            "complexity": "high" if len(detected_domains) >= 2 else "medium",
            "word_count": word_count
        }
    
    def generate_philosophical_response(self, question, user_id=None):
        """Generate philosophical response - completely rewritten"""
        analysis = self.analyze_question_depth(question)
        
        # Get conversation history
        history = self.conversation_history.get(user_id, [])
        
        # 🔧 Fix 3: Improved framework selection logic
        if analysis["domains"]:
            primary_domain = analysis["domains"][0]
            framework_map = {
                "ethical": ["virtue_ethics", "stoicism", "utilitarianism"],
                "existential": ["existentialism", "buddhism", "taoism"],
                "epistemological": ["taoism", "buddhism", "existentialism"],
                "metaphysical": ["taoism", "buddhism", "existentialism"]
            }
            frameworks = framework_map.get(primary_domain, ["stoicism", "existentialism", "taoism"])
        else:
            frameworks = ["stoicism", "taoism", "buddhism"]
        
        selected_framework = random.choice(frameworks)
        philosopher = random.choice(self.philosophical_frameworks[selected_framework])
        
        # 🔧 Fix 4: Use enhanced response templates
        response_template = random.choice(self.enhanced_responses.get(selected_framework, self.enhanced_responses["stoicism"]))
        answer = response_template.format(philosopher=philosopher)
        
        # 🔧 Fix 5: Improved Socratic questioning logic
        if len(history) < 2:  # Reduce questioning frequency
            follow_up = random.choice(self.socratic_questions)
            answer += f"\n\nI wonder: {follow_up}"
        
        # 🔧 Fix 6: Unified determinacy calculation
        base_determinacy = 0.3 + analysis["depth_score"] * 0.5
        # Adjust determinacy based on framework
        framework_confidence = {
            "stoicism": 0.8,
            "taoism": 0.7, 
            "buddhism": 0.7,
            "existentialism": 0.6,
            "virtue_ethics": 0.75,
            "utilitarianism": 0.65
        }
        framework_modifier = framework_confidence.get(selected_framework, 0.7)
        
        final_determinacy = min(0.95, base_determinacy * framework_modifier)
        
        # 🔧 Fix 7: Improved history recording
        if user_id:
            if user_id not in self.conversation_history:
                self.conversation_history[user_id] = []
            
            self.conversation_history[user_id].append({
                "question": question,
                "answer": answer,
                "timestamp": datetime.now().isoformat(),
                "framework": selected_framework,
                "philosopher": philosopher,
                "determinacy": final_determinacy
            })
            
            # Limit history length
            if len(self.conversation_history[user_id]) > 20:
                self.conversation_history[user_id] = self.conversation_history[user_id][-20:]
        
        return {
            "answer": answer,
            "framework": selected_framework,
            "philosopher": philosopher,
            "analysis": analysis,
            "determinacy": round(final_determinacy, 2),
            "kind": "wisdom"
        }
    
    def get_conversation_stats(self, user_id):
        """Get conversation statistics"""
        if user_id not in self.conversation_history:
            return {"count": 0, "frameworks": {}}
        
        history = self.conversation_history[user_id]
        framework_count = {}
        
        for entry in history:
            framework = entry.get("framework", "unknown")
            framework_count[framework] = framework_count.get(framework, 0) + 1
        
        return {
            "count": len(history),
            "frameworks": framework_count,
            "last_interaction": history[-1]["timestamp"] if history else None
        }

# Global instance
philosophical_engine = PhilosophicalOracle()