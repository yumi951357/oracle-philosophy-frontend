from dotenv import load_dotenv
import os

# Load env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_QUESTION_TABLE", "questions")

# import_ultra_simple.py - Ultimate simple version
import os
import time
import requests
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TABLE = "questions"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

FOLDER = r"C:\Users\Administrator\Desktop\oracle-philosophy-system\backend\data\questions"

def parse_file(filename):
    """Parse single file"""
    file_path = os.path.join(FOLDER, filename)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    lines = content.splitlines()
    questions = []
    
    for line in lines:
        line = line.strip()
        if line.startswith('|') and line.endswith('|') and '---' not in line:
            cells = [cell.strip() for cell in line[1:-1].split('|')]
            if len(cells) >= 2 and cells[0] and cells[1]:
                title, question = cells[0], cells[1]
                if title.lower() not in ['title', 'category'] and question.lower() not in ['question', 'content']:
                    if len(question) > 10:
                        questions.append({
                            "filename": filename,
                            "content": question,
                            "word_count": len(question.split())
                        })
    return questions

def insert_batch(batch):
    """Insert batch data"""
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}"
    response = requests.post(url, json=batch, headers=headers)
    return response.status_code == 201

# Main program
files = sorted([f for f in os.listdir(FOLDER) if f.endswith(".md")])
total_imported = 0

print(f"🚀 Starting import of {len(files)} files...")

for filename in tqdm(files, desc="📁 File progress"):
    questions = parse_file(filename)
    
    for i in range(0, len(questions), 50):  # 50 items per batch
        batch = questions[i:i+50]
        if insert_batch(batch):
            total_imported += len(batch)
        else:
            # If failed, insert one by one
            for q in batch:
                if insert_batch([q]):
                    total_imported += 1
                time.sleep(0.1)
        
        time.sleep(0.5)

print(f"\n🎉 Import completed! Total: {total_imported} questions")