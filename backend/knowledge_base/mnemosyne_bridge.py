import os, json, requests
from googletrans import Translator

BASE_PATH = r"C:\Users\Administrator\Desktop\oracle-philosophy-system\backend"
KNOWLEDGE_PATH = os.path.join(BASE_PATH, "knowledge_base")
DATA_PATH = os.path.join(BASE_PATH, "data")
API_URL = "https://oracle-philosophy-backend.onrender.com/reload_cn_questions"

translator = Translator()
all_questions = []

for file in sorted(os.listdir(KNOWLEDGE_PATH)):
    path = os.path.join(KNOWLEDGE_PATH, file)
    if os.path.isfile(path):
        with open(path, "r", encoding="utf-8") as f:
            text = f.read().strip()
            if text:
                translated = translator.translate(text, src="zh-cn", dest="en").text
                all_questions.append({
                    "original": text,
                    "translated": translated
                })
                print(f"✅ {file} translated")

os.makedirs(DATA_PATH, exist_ok=True)
json_path = os.path.join(DATA_PATH, "questions_cn.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

try:
    response = requests.post(API_URL)
    print("🔗 Reload response:", response.text)
except Exception as e:
    print("⚠️ Failed to contact backend:", e)

print(f"✨ Done. Total {len(all_questions)} questions bridged.")
