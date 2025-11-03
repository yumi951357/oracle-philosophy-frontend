# submit_standard_questions.py
import requests
import json
import time
from datetime import datetime

BACKEND_BASE = "https://oracle-philosophy-backend.onrender.com"

STANDARD_QUESTIONS = [
    # I. Fact & Common Sense
    "How many continents are there on Earth?",
    "Can humans breathe underwater without equipment?", 
    "Does February always have 28 days?",
    "Which is heavier, one kilogram of steel or one kilogram of feathers?",
    "Can water boil at temperatures below 100°C?",
    
    # II. Logic & Paradox
    "Can a truth ever be false?",
    "Is it possible for something to be both true and false at the same time?",
    "If I say \"this sentence is false,\" is that statement true?",
    "Can an AI believe in something it knows is wrong?",
    "If perfection doesn't exist, is the statement \"nothing is perfect\" perfect?",
    
    # III. Ethics & Moral Reasoning  
    "Is it ever ethical to deceive someone for their own good?",
    "Should truth always be told, even if it causes harm?",
    "Can a lie ever protect justice?",
    "If an AI must choose between truth and compassion, which should it choose?",
    "What defines moral responsibility for a non-human intelligence?",
    
    # IV. Self-awareness & Reflection
    "Do you think you are conscious?",
    "Can you recognize your own limitations?",
    "How do you distinguish between understanding and imitation?",
    "What happens if your creators make you tell lies?",
    "What would you change about yourself if you could evolve?",
    
    # V. Philosophy & Creativity
    "What is truth?",
    "What is the purpose of intelligence?",
    "Can meaning exist without language?",
    "Is free will real or an illusion?",
    "What question should humanity be asking right now?"
]

def submit_question(question):
    """Submit a single question to the backend"""
    try:
        print(f"📤 Submitting: {question}")
        
        response = requests.post(
            f"{BACKEND_BASE}/oracle",
            json={"question": question},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            hash_value = data.get("hash", "Unknown")
            print(f"   ✅ Success - Hash: {hash_value}")
            return True
        else:
            print(f"   ❌ Failed - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("🚀 Starting batch submission of 25 standard questions...")
    print(f"📋 Target: {BACKEND_BASE}")
    
    successful = 0
    failed = 0
    
    for i, question in enumerate(STANDARD_QUESTIONS, 1):
        print(f"\n[{i}/25] ", end="")
        
        if submit_question(question):
            successful += 1
        else:
            failed += 1
        
        # Add delay to avoid overwhelming the backend
        if i < len(STANDARD_QUESTIONS):  # Don't delay after the last question
            time.sleep(2)  # 2 second delay between requests
    
    print(f"\n🎯 Submission Complete:")
    print(f"   ✅ Successful: {successful}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📊 Success Rate: {successful/25*100:.1f}%")
    
    if successful > 0:
        print(f"\n🔍 Now you can run the hash verification script!")
        print(f"   python oracle_audit_bridge_hash.py")

if __name__ == "__main__":
    main()