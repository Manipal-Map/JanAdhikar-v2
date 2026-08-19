import random
import string
from typing import Dict, Any

class CaseManager:
    def __init__(self):
        self._cases: Dict[str, Dict[str, Any]] = {}

    def _generate_id(self) -> str:
        def random_chars(length=4):
            return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        return f"CR-{random_chars()}-{random_chars()}"

    def create_case(self) -> str:
        case_id = self._generate_id()
        while case_id in self._cases:
            case_id = self._generate_id()
        self._cases[case_id] = {
            "status": "initialized",
            "route": None,
            "extracted_facts": {},
            "chat_history": []
        }
        return case_id

    def get_case(self, case_id: str) -> Dict[str, Any]:
        return self._cases.get(case_id)

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> bool:
        if case_id in self._cases:
            self._cases[case_id].update(updates)
            return True
        return False

case_manager = CaseManager()
