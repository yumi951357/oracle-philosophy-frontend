import os

# If you later want to add real model keys, keep them in Render/Vercel env, not in code.
AUDIT_LOG_PATH = os.getenv("AUDIT_LOG_PATH", "audit_log.json")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")  # optional for future admin endpoints