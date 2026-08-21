import os
import random
import string
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional

try:
    from supabase import create_client, Client
except ImportError:
    create_client, Client = None, None

logger = logging.getLogger(__name__)

# Statutory SLA Constants (RTI Act 2005)
SLA_STANDARD_DAYS = 30
SLA_LIFE_LIBERTY_HOURS = 48
FIRST_APPEAL_WINDOW_DAYS = 30
SECOND_APPEAL_WINDOW_DAYS = 90
DAILY_PENALTY_INR = 250
MAX_PENALTY_INR = 25000


def parse_date(date_val: Optional[Any]) -> Optional[datetime]:
    """Helper to parse ISO strings or datetime objects safely into UTC datetimes."""
    if not date_val:
        return None
    if isinstance(date_val, datetime):
        return date_val.astimezone(timezone.utc) if date_val.tzinfo else date_val.replace(tzinfo=timezone.utc)
    try:
        clean_str = str(date_val).replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_str)
        return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except Exception:
        return None


def compute_case_state(case_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes SLA deadlines, Section 20 statutory penalties, and dynamic case status
    strictly based on deterministic RTI legal rules.
    """
    now = datetime.now(timezone.utc)

    # 1. Anchor Timestamps
    filing_date = parse_date(case_data.get("filing_date")) or now
    life_liberty = bool(case_data.get("life_liberty_flag", False))
    pio_response_date = parse_date(case_data.get("pio_response_date"))
    first_appeal_date = parse_date(case_data.get("first_appeal_date"))
    first_appeal_decision_date = parse_date(case_data.get("first_appeal_decision_date"))

    # 2. Section 7(1): Response Due Calculation
    if life_liberty:
        response_due = filing_date + timedelta(hours=SLA_LIFE_LIBERTY_HOURS)
    else:
        response_due = filing_date + timedelta(days=SLA_STANDARD_DAYS)

    # 3. Section 20 Penalty Math (Rs. 250/day capped at Rs. 25,000)
    penalty_end = pio_response_date or now
    if penalty_end > response_due and not pio_response_date:
        days_overdue = max(0, (now - response_due).days)
        section_20_penalty = min(days_overdue * DAILY_PENALTY_INR, MAX_PENALTY_INR)
        is_overdue = True
    elif pio_response_date and pio_response_date > response_due:
        days_overdue = max(0, (pio_response_date - response_due).days)
        section_20_penalty = min(days_overdue * DAILY_PENALTY_INR, MAX_PENALTY_INR)
        is_overdue = True
    else:
        days_overdue = 0
        section_20_penalty = 0
        is_overdue = False

    # 4. Section 19(1) First Appeal Window
    first_appeal_anchor = pio_response_date or response_due
    first_appeal_due = first_appeal_anchor + timedelta(days=FIRST_APPEAL_WINDOW_DAYS)

    # 5. Section 19(3) Second Appeal Window
    second_appeal_due = None
    if first_appeal_decision_date:
        second_appeal_due = first_appeal_decision_date + timedelta(days=SECOND_APPEAL_WINDOW_DAYS)

    # 6. Deterministic Status Resolution
    if first_appeal_decision_date and now <= second_appeal_due:
        status = "SECOND_APPEAL_ELIGIBLE"
    elif first_appeal_date:
        status = "FIRST_APPEAL_FILED"
    elif pio_response_date:
        status = "RESPONSE_RECEIVED"
    elif is_overdue:
        status = "FIRST_APPEAL_ELIGIBLE"  # Deemed refusal under Sec 7(2)
    else:
        status = "AWAITING_RESPONSE"

    time_remaining_seconds = max(0, int((response_due - now).total_seconds()))

    return {
        "computed_status": status,
        "is_overdue": is_overdue,
        "days_overdue": days_overdue,
        "section_20_penalty_inr": section_20_penalty,
        "filing_date": filing_date.isoformat(),
        "response_due_date": response_due.isoformat(),
        "first_appeal_due_date": first_appeal_due.isoformat(),
        "second_appeal_due_date": second_appeal_due.isoformat() if second_appeal_due else None,
        "time_remaining_seconds": time_remaining_seconds,
    }


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
                "Falling back to in-memory storage."
            )

    def _generate_case_id(self) -> str:
        chars = string.ascii_uppercase + string.digits
        return f"CR-{''.join(random.choices(chars, k=4))}-{''.join(random.choices(chars, k=4))}"

    def create_case(self, life_liberty: bool = False) -> str:
        case_id = self._generate_case_id()
        now_iso = datetime.now(timezone.utc).isoformat()
        initial_data = {
            "id": case_id,
            "status": "FILED",
            "filing_date": now_iso,
            "life_liberty_flag": life_liberty,
            "pio_response_date": None,
            "first_appeal_date": None,
            "first_appeal_decision_date": None,
        }

        if self.use_supabase:
            try:
                self.supabase.table("cases").upsert({"id": case_id, "data": initial_data}).execute()
            except Exception as e:
                logger.error(f"Supabase UPSERT Error on Create for case {case_id}: {e}")
                raise RuntimeError(f"Failed to persist case to database: {e}") from e
        else:
            self._memory_cases[case_id] = initial_data

        return case_id

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        if not case_id:
            return None

        case_data = None
        if self.use_supabase:
            try:
                response = self.supabase.table("cases").select("data").eq("id", case_id).execute()
                if response.data and len(response.data) > 0:
                    case_data = response.data[0]["data"]
            except Exception as e:
                logger.error(f"Supabase SELECT Error for case {case_id}: {e}")
                raise RuntimeError(f"Database read failure: {e}") from e
        else:
            case_data = self._memory_cases.get(case_id)

        if not case_data:
            return None

        # Dynamically attach SLA state engine computations
        state_metrics = compute_case_state(case_data)
        case_data.update(state_metrics)
        return case_data

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        if not case_id:
            raise ValueError("Case ID required")

        current_data = self.get_case(case_id) or {"id": case_id, "filing_date": datetime.now(timezone.utc).isoformat()}
        current_data.update(updates)

        if self.use_supabase:
            try:
                self.supabase.table("cases").upsert({"id": case_id, "data": current_data}).execute()
            except Exception as e:
                logger.error(f"Supabase UPSERT Error on Update for case {case_id}: {e}")
                raise RuntimeError(f"Failed to update case in database: {e}") from e
        else:
            self._memory_cases[case_id] = current_data

        return self.get_case(case_id)


case_manager = CaseManager()
