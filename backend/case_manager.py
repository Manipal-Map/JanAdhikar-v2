import os
import random
import string
from typing import Dict, Any, Optional
from supabase import create_client, Client

class CaseManager:
    def __init__(self):
        # Fetch Supabase credentials from environment variables (Vercel)
        url: str = os.environ.get("SUPABASE_URL", "")
        key: str = os.environ.get("SUPABASE_KEY", "")
        
        self.use_supabase = bool(url and key)
        
        if self.use_supabase:
            self.supabase: Client = create_client(url, key)
            print("Database Connected: Using Supabase for persistent case storage.")
        else:
            print("WARNING: Supabase credentials not found. Falling back to temporary in-memory storage (Data will wipe on Vercel spin-down).")
            self._memory_cases: Dict[str, Dict[str, Any]] = {}

    def _generate_case_id(self) -> str:
        """Generates a professional looking ID like CR-AB12-XY89"""
        chars = string.ascii_uppercase + string.digits
        return f"CR-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}"

    def create_case(self) -> str:
        case_id = self._generate_case_id()
        initial_data = {"status": "initialized"}
        
        if self.use_supabase:
            # Insert new row into the Supabase 'cases' table
            self.supabase.table("cases").insert({
                "id": case_id,
                "data": initial_data
            }).execute()
        else:
            self._memory_cases[case_id] = initial_data
            
        return case_id

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Fetches the case data. Returns None if passkey is invalid."""
        if self.use_supabase:
            # Query the JSONB 'data' column by ID
            response = self.supabase.table("cases").select("data").eq("id", case_id).execute()
            if len(response.data) > 0:
                return response.data[0]["data"]
            return None
        else:
            return self._memory_cases.get(case_id)

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> None:
        """Merges new data into the existing case data."""
        current_data = self.get_case(case_id)
        if current_data is None:
            return # Case not found

        # Merge the dictionaries
        current_data.update(updates)
        
        if self.use_supabase:
            # Push the updated JSON back to Supabase
            self.supabase.table("cases").update({
                "data": current_data
            }).eq("id", case_id).execute()
        else:
            self._memory_cases[case_id] = current_data

case_manager = CaseManager()
