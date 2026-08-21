import os
import random
import string
import logging
from typing import Dict, Any, Optional

try:
    from supabase import create_client, Client
except ImportError:
    create_client, Client = None, None

logger = logging.getLogger(__name__)

class CaseManager:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL", "")
        key: str = os.environ.get("SUPABASE_KEY", "")

        self.use_supabase = bool(url and key and create_client)
        self._memory_cases: Dict[str, Dict[str, Any]] = {}

        if self.use_supabase:
            try:
                self.supabase: Client = create_client(url, key)
                logger.info("Database Connected: Using Supabase for persistent case storage.")
            except Exception as e:
                logger.error(f"Supabase initialization error: {e}")
                self.use_supabase = False
        else:
            logger.warning(
                "WARNING: Supabase credentials missing or package unavailable. "
                "Falling back to in-memory storage (data will not persist in serverless environments)."
            )

    def _generate_case_id(self) -> str:
        # Generates a 12-character ID: CR-ABCD-1234
        chars = string.ascii_uppercase + string.digits
        return f"CR-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}"

    def create_case(self) -> str:
        case_id = self._generate_case_id()
        initial_data = {"status": "initialized"}

        if self.use_supabase:
            try:
                self.supabase.table("cases").upsert({
                    "id": case_id,
                    "data": initial_data
                }).execute()
            except Exception as e:
                logger.error(f"Supabase UPSERT Error on Create for case {case_id}: {e}")
                raise RuntimeError(f"Failed to persist case to database: {e}") from e
        else:
            self._memory_cases[case_id] = initial_data

        return case_id

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        if not case_id:
            return None

        # Fixes invisible spaces and lowercase letters sent from the frontend
        clean_id = case_id.strip().upper()

        if self.use_supabase:
            try:
                response = self.supabase.table("cases").select("data").eq("id", clean_id).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]["data"]
                return None  
            except Exception as e:
                logger.error(f"Supabase SELECT Error for case {clean_id}: {e}")
                return None # Return None instead of crashing, allowing FastAPI to send a clean 404

        return self._memory_cases.get(clean_id)

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> None:
        if not case_id:
            return

        clean_id = case_id.strip().upper()
        current_data = self.get_case(clean_id)
        
        if current_data is None:
            current_data = {"status": "initialized"}

        current_data.update(updates)

        if self.use_supabase:
            try:
                self.supabase.table("cases").upsert({
                    "id": clean_id,
                    "data": current_data
                }).execute()
            except Exception as e:
                logger.error(f"Supabase UPSERT Error on Update for case {clean_id}: {e}")
                raise RuntimeError(f"Failed to update case in database: {e}") from e
        else:
            self._memory_cases[clean_id] = current_data

case_manager = CaseManager()
