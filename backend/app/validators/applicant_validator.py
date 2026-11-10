"""Applicant update field rules for the editing API."""

import re

EDITABLE_APPLICANT_FIELDS = (
    "full_name",
    "phone_number",
    "email",
    "address",
    "status",
)


def editable_changes(payload: dict[str, str]) -> dict[str, str]:
    """Keep only platform fields allowed by FR-REG-04."""

    return {
        field: value
        for field in EDITABLE_APPLICANT_FIELDS
        if (value := payload.get(field)) is not None
    }


def validate_applicant_payload(payload: dict[str, str]) -> dict[str, str]:
    """Validate editable applicant fields for FR-REG-02 and NFR-USE-01."""

    errors: dict[str, str] = {}
    phone_number = payload.get("phone_number")
    if phone_number is not None and (
        len(phone_number) != 10 or not phone_number.isdigit()
    ):
        errors["phone_number"] = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก"

    full_name = payload.get("full_name")
    if full_name is not None and re.search(r"\d", full_name):
        errors["full_name"] = "ชื่อต้องไม่มีตัวเลข"

    return errors
