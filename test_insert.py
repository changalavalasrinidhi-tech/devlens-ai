import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# Checking both standard names and common alternatives so it won't fail
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("SUPABASE_PROJECT_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Supabase URL or Key could not be found in your environment variables.")
    print("Please make sure your .env file defines SUPABASE_URL and SUPABASE_KEY.")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_database():
    try:
        print("Testing insert operation into 'test_table'...")
        # Note: Ensure your Supabase table is named 'test_table' and has a text column named 'name'
        insert_response = supabase.table("test_table").insert({"name": "Hello from Python"}).execute()
        print("✅ Insert successful!", insert_response)

        print("\nTesting fetch operation...")
        fetch_response = supabase.table("test_table").select("*").execute()
        print("✅ Fetched records:", fetch_response.data)

    except Exception as e:
        print("❌ Error during database test:", e)

if __name__ == "__main__":
    test_database()