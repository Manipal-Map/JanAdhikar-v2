import os
import random
import string
from typing import Dict, Any, Optional
from supabase import create_client, Client

class CaseManager:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL", "")
        key: str = os.environ.get("SUPABASE_KEY", "")
        
        self.use_supabase = bool(url and key)
        self._memory_cases: Dict[str, Dict[str, Any]] = {}
        
        if self.use_supabase:
            try:
                self.supabase: Client = create_client(url, key)
                print("Database Connected: Using Supabase for persistent case storage.")
            except Exception as e:
                print(f"Supabase initialization error: {e}")
                self.use_supabase = False
        else:
            print("WARNING: Supabase credentials not found. Falling back to temporary in-memory storage.")

    def _generate_case_id(self) -> str:
        chars = string.ascii_uppercase + string.digits
        return f"CR-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}"

    def create_case(self) -> str:
        case_id = self._generate_case_id()
        initial_data = {"status": "initialized"}
        
        if self.use_supabase:
            try:
                # Use upsert to guarantee it writes safely
                self.supabase.table("cases").upsert({
                    "id": case_id,
                    "data": initial_data
                }).execute()
            except Exception as e:
                print(f"Supabase UPSERT Error on Create: {e}")
                self._memory_cases[case_id] = initial_data
        else:
            self._memory_cases[case_id] = initial_data
            
        return case_id

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        if not case_id:
            return None
            
        if self.use_supabase:
            try:
                response = self.supabase.table("cases").select("data").eq("id", case_id).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]["data"]
            except Exception as e:
                print(f"Supabase SELECT Error: {e}")
                
        return self._memory_cases.get(case_id)

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> None:
        if not case_id:
            return
            
        current_data = self.get_case(case_id)
        if current_data is None:
            current_data = {"status": "initialized"}

        current_data.update(updates)
        
        if self.use_supabase:
            try:
                # Upsert ensures that if the row was somehow missing, it gets created automatically
                self.supabase.table("cases").upsert({
                    "id": case_id,
                    "data": current_data
                }).execute()
                return
            except Exception as e:
                print(f"Supabase UPSERT Error on Update: {e}")
                
        self._memory_cases[case_id] = current_data

case_manager = CaseManager()
