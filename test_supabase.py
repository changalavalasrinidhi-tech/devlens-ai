import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from the .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"Loaded URL: {SUPABASE_URL}")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # Test a simple query (replace 'your_table_name' with an actual table in your Supabase project if you have one)
    # Or just check if the client initialized successfully
    print("Supabase client initialized successfully!")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")