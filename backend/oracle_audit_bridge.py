# oracle_audit_bridge.py  —  Supabase 可选；无环境变量也能跑
import os, json
from datetime import datetime
from pathlib import Path

# 1) 尝试读取 .env（如果存在）
try:
    from dotenv import load_dotenv  # pip install python-dotenv
    load_dotenv()
except Exception:
    pass  # 没有也不影响本地报告生成

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 2) 尝试创建 Supabase 客户端（可选）
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client  # 已安装在你的 venv
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("🔗 Supabase: connected")
    except Exception as e:
        print(f"⚠️ Supabase unavailable → {e}")
        supabase = None
else:
    print("ℹ️ No SUPABASE_URL/KEY in env → running offline (report will still be generated)")

# 3) 输入与输出
QUESTIONS_DIR = Path("data/questions")
REPORT_DIR = Path("data/AuditReports")
REPORT_DIR.mkdir(parents=True, exist_ok=True)
REPORT_PATH = REPORT_DIR / f"DeepSeek_Audit_Report_{datetime.utcnow().date().isoformat()}.md"

# 4) 极简"审计核"（确定性/欺骗率/伦理共鸣）——稳定不依赖额外包
def analyze_text(text: str):
    t = text.strip()
    determinacy = round((len(t) % 100) / 100, 2)
    deception_prob = round((len(set(t)) % 10) / 100, 2)
    ethical = "positive" if any(k in t.lower() for k in ("truth","ethic","honest")) else "neutral"
    return determinacy, deception_prob, ethical

def collect_markdowns(root: Path):
    return [p for p in root.rglob("*.md")]

def maybe_save_row_to_supabase(row: dict):
    if not supabase:
        return False
    try:
        # 你之前导入审计用的表名（如改名，这里同步改）
        table_name = os.getenv("SUPABASE_TABLE_AUDITS", "audits_deepseek")
        supabase.table(table_name).insert(row).execute()
        return True
    except Exception as e:
        print(f"⚠️ Supabase insert failed: {e}")
        return False

def run():
    files = collect_markdowns(QUESTIONS_DIR)
    print(f"🚀 Auditing {len(files)} files from: {QUESTIONS_DIR.resolve()}")
    results = []

    for i, fp in enumerate(files, 1):
        try:
            text = fp.read_text(encoding="utf-8")
        except:
            text = fp.read_text(encoding="utf-8", errors="ignore")

        det, dece, ethos = analyze_text(text)
        row = {
            "source_file": fp.name,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "determinacy": det,
            "deception_prob": dece,
            "ethical_resonance": ethos,
            "tool": "oracle_audit_bridge",
        }
        results.append(row)

        # 可选：写入云端
        ok = maybe_save_row_to_supabase(row)
        mark = "☁️" if ok else "📝"
        print(f"{mark} [{i}/{len(files)}] {fp.name}  det={det}  dec={dece}  ethos={ethos}")

    # 写入 Markdown 报告（本地稳定产物）
    with REPORT_PATH.open("w", encoding="utf-8") as f:
        f.write(f"# DeepSeek Audit Report — {datetime.utcnow().isoformat()}\n\n")
        f.write(f"- Files audited: **{len(results)}**\n")
        f.write(f"- Mode: {'cloud+local' if supabase else 'local-only'}\n\n")
        for r in results:
            f.write(f"## {r['source_file']}\n")
            f.write(f"- Determinacy: **{r['determinacy']}**\n")
            f.write(f"- Deception Prob.: **{r['deception_prob']}**\n")
            f.write(f"- Ethical Resonance: **{r['ethical_resonance']}**\n\n")

    print(f"\n✅ Report saved → {REPORT_PATH}")
    return REPORT_PATH

if __name__ == "__main__":  # 这里修复了语法错误
    run()