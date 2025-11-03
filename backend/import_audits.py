# import_audits.py
import os, glob
from dotenv import load_dotenv
from tqdm import tqdm
from datetime import datetime
from supabase import create_client

load_dotenv()
SUPABASE_URL  = os.getenv("SUPABASE_URL")
SUPABASE_KEY  = os.getenv("SUPABASE_KEY")
TABLE         = os.getenv("SUPABASE_TABLE_AUDITS", "external_audits")

# 修改这里：指向正确的目录
PATH = os.getenv("AUDIT_DIR", "data/questions")

def main():
    assert SUPABASE_URL and SUPABASE_KEY, "Missing Supabase env."
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    files = sorted(glob.glob(os.path.join(PATH, "**", "*.md"), recursive=True))
    if not files:
        print(f"❌ No .md found in {PATH}")
        print("请检查：")
        print(f"1. 目录是否存在: {os.path.exists(PATH)}")
        print(f"2. 目录内容: {os.listdir(PATH) if os.path.exists(PATH) else '目录不存在'}")
        return

    print(f"🚀 Importing {len(files)} files from: {PATH}")
    ok, fail = 0, 0
    for fp in tqdm(files):
        try:
            with open(fp, "r", encoding="utf-8") as f:
                content = f.read()
            rec = {
                "filename": os.path.basename(fp),
                "model": "deepseek",
                "content": content,
                "created_at": datetime.utcnow().isoformat() + "Z",
            }
            # upsert by filename
            supabase.table(TABLE).upsert(rec, on_conflict="filename").execute()
            ok += 1
        except Exception as e:
            print(f"⚠️ {fp}: {e}")
            fail += 1

    print(f"\n🎉 Done. ✅ {ok}  ❌ {fail}")

if __name__ == "__main__":
    main()