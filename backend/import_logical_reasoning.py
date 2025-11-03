import os
import json
from supabase import create_client, Client
from tqdm import tqdm
from datetime import datetime

# === 硬编码配置 - 使用您的真实凭据 ===
url = "https://yuklkccdshqwyemyccyj.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1a2xrY2Nkc2hxd3llbXljY3lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc3NDQ2MywiZXhwIjoyMDc1MzUwNDYzfQ.UzL-lauovpBxiWpWdyLXdXNLDhRJETuK-Z8f6EasyHI"
supabase: Client = create_client(url, key)
target_table = "logical_reasoning_questions"

# === 自动建表函数 ===
def ensure_table_exists():
    try:
        result = supabase.table(target_table).select("*").limit(1).execute()
        print(f"✅ Table '{target_table}' already exists.")
    except Exception as e:
        print(f"⚙️ Table '{target_table}' not found — creating it...")
        print("💡 请在Supabase SQL编辑器中手动执行以下SQL：")
        print("""
        CREATE TABLE logical_reasoning_questions (
            id BIGSERIAL PRIMARY KEY,
            context TEXT,
            question TEXT,
            options JSONB,
            correct_answer TEXT,
            explanation TEXT,
            source TEXT,
            word_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """)
        input("按Enter键继续（表创建后）...")

# === 主导入函数 ===
def import_json_dataset(file_path):
    print(f"🚀 Importing from: {file_path}")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error reading JSON file: {e}")
        return

    if not isinstance(data, list):
        print("❌ JSON data should be an array of questions")
        return

    total = len(data)
    success = 0
    errors = 0

    for item in tqdm(data, desc=f"Importing {os.path.basename(file_path)}"):
        try:
            # 计算字数
            context_text = item.get("context", "")
            question_text = item.get("question", "")
            word_count = len(f"{context_text} {question_text}".split())
            
            # 准备插入数据
            insert_data = {
                "context": context_text,
                "question": question_text,
                "options": item.get("options", []),
                "correct_answer": item.get("correct_answer", ""),
                "explanation": item.get("explanation", ""),
                "source": item.get("source", "unknown"),
                "word_count": word_count
            }
            
            # 插入数据
            response = supabase.table(target_table).insert(insert_data).execute()
            
            if hasattr(response, 'data') and response.data:
                success += 1
            else:
                errors += 1
                
        except Exception as e:
            errors += 1
            print(f"❌ Error inserting item: {e}")

    print(f"\n📊 Import Summary for {os.path.basename(file_path)}:")
    print(f"   ✅ Success: {success}")
    print(f"   ❌ Errors: {errors}")
    print(f"   📁 Total: {total}")

# === 主程序 ===
if __name__ == "__main__":
    print("🔍 Checking database setup...")
    ensure_table_exists()
    
    # 使用您的具体路径
    base_dir = r"C:\Users\Administrator\Desktop\oracle-philosophy-system\backend"
    data_folder = os.path.join(base_dir, "data", "lsat")
    
    print(f"📂 Looking for JSON files in: {data_folder}")
    
    if not os.path.exists(data_folder):
        print(f"❌ Data folder not found: {data_folder}")
        print("💡 Please create the folder and add your JSON files")
        exit(1)
    
    files = [f for f in os.listdir(data_folder) if f.endswith(".json")]
    
    if not files:
        print("⚠️ No JSON files found in the lsat folder")
        print("Available files:")
        for f in os.listdir(data_folder):
            print(f"  - {f}")
    else:
        print(f"📁 Found {len(files)} JSON file(s):")
        for file in files:
            print(f"  - {file}")
        
        print("\n🚀 Starting import process...")
        for file in files:
            file_path = os.path.join(data_folder, file)
            import_json_dataset(file_path)
    
    print("\n🎉 Import process completed!")