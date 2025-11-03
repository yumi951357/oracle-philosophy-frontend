# test_cloud_access.py
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)
print("🔗 Testing connection to Supabase...")

try:
    data = supabase.table("questions").select("*").limit(3).execute()
    print(f"✅ Cloud connection success — fetched {len(data.data)} records:\n")
    for i, item in enumerate(data.data, start=1):
        print(f"#{i}  {item.get('filename')}  |  {item.get('content')[:100]}...")
except Exception as e:
    print(f"❌ Cloud access failed: {e}")