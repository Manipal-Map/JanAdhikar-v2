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
                print("Supabase initialized successfully.")
            except Exception as e:
                print(f"Supabase initialization error: {e}")
                self.use_supabase = False

    def _generate_case_id(self) -> str:
        """Generates a professional looking ID like CR-AB12-XY89"""
        chars = string.ascii_uppercase + string.digits
        return f"CR-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}"

    def create_case(self) -> str:
        case_id = self._generate_case_id()
        initial_data = {"status": "initialized"}
        
        if self.use_supabase:
            try:
                self.supabase.table("cases").insert({
                    "id": case_id,
                    "data": initial_data
                }).execute()
            except Exception as e:
                print(f"Supabase INSERT Error: {e}")
                # Fallback to memory so the frontend doesn't crash
                self._memory_cases[case_id] = initial_data
        else:
            self._memory_cases[case_id] = initial_data
            
        return case_id

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase:
            try:
                response = self.supabase.table("cases").select("data").eq("id", case_id).execute()
                if len(response.data) > 0:
                    return response.data[0]["data"]
            except Exception as e:
                print(f"Supabase SELECT Error: {e}")
                
        return self._memory_cases.get(case_id)

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> None:
        current_data = self.get_case(case_id)
        if current_data is None:
            current_data = {}

        current_data.update(updates)
        
        if self.use_supabase:
            try:
                self.supabase.table("cases").update({
                    "data": current_data
                }).eq("id", case_id).execute()
                return
            except Exception as e:
                print(f"Supabase UPDATE Error: {e}")
                
        self._memory_cases[case_id] = current_data

case_manager = CaseManager()
