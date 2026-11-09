"""Validation rules for the approved camp enrollment form."""

from collections.abc import Mapping


# รองรับ: FR-ENR-02, FR-ENR-03, FR-ENR-04, FR-ENR-05, CON-ENR-03, CON-ENR-04
ENROLLMENT_REQUIRED_FIELDS = (
    "full_name",
    "nickname",
    "student_id",
    "year_level",
    "phone_number",
    "contact_channel",
    "food_allergy",
)
YEAR_LEVEL_VALUES = frozenset({"1", "2", "3", "4", "5", "6", "other"})
CONDITIONAL_FIELDS = frozenset({"year_level_other", "food_allergy_details"})
ALLOWED_FIELDS = frozenset((*ENROLLMENT_REQUIRED_FIELDS, *CONDITIONAL_FIELDS))
MISSING_VALUE_MESSAGE = "กรุณากรอกข้อมูลนี้"


# รองรับ: FR-ENR-03, FR-ENR-04, FR-ENR-05, CON-ENR-03, CON-ENR-04, IF-ENR-01
def validate_enrollment_form(
    form_data: Mapping[str, object],
) -> list[dict[str, str]]:
    """Validate required values, year level, and conditional allergy details."""
    errors: list[dict[str, str]] = []
    for field_name in ENROLLMENT_REQUIRED_FIELDS:
        if field_name in {"food_allergy", "year_level"}:
            continue
        value = form_data.get(field_name)
        if not isinstance(value, str) or not value.strip():
            errors.append(
                {"field_name": field_name, "error_message": MISSING_VALUE_MESSAGE}
            )

    year_level = form_data.get("year_level")
    if not isinstance(year_level, str) or not year_level.strip():
        errors.append(
            {"field_name": "year_level", "error_message": MISSING_VALUE_MESSAGE}
        )
    elif year_level not in YEAR_LEVEL_VALUES:
        errors.append(
            {
                "field_name": "year_level",
                "error_message": "กรุณาเลือกระดับชั้นปีที่กำหนด",
            }
        )
    if year_level == "other" and not _has_text(form_data.get("year_level_other")):
        errors.append(
            {
                "field_name": "year_level_other",
                "error_message": MISSING_VALUE_MESSAGE,
            }
        )
    elif year_level != "other" and _has_text(form_data.get("year_level_other")):
        errors.append(
            {
                "field_name": "year_level_other",
                "error_message": "ไม่ต้องระบุรายละเอียดเมื่อไม่ได้เลือกอื่นๆ",
            }
        )

    food_allergy = form_data.get("food_allergy")
    if not isinstance(food_allergy, str) or not food_allergy.strip():
        errors.append(
            {
                "field_name": "food_allergy",
                "error_message": MISSING_VALUE_MESSAGE,
            }
        )
    elif food_allergy not in {"no", "yes"}:
        errors.append(
            {
                "field_name": "food_allergy",
                "error_message": "กรุณาเลือกข้อมูลการแพ้อาหาร",
            }
        )
    elif food_allergy == "yes" and not _has_text(
        form_data.get("food_allergy_details")
    ):
        errors.append(
            {
                "field_name": "food_allergy_details",
                "error_message": MISSING_VALUE_MESSAGE,
            }
        )
    elif food_allergy == "no" and (
        (
            "food_allergy_details" in form_data
            and not isinstance(form_data["food_allergy_details"], str)
        )
        or _has_text(form_data.get("food_allergy_details"))
    ):
        errors.append(
            {
                "field_name": "food_allergy_details",
                "error_message": "ไม่ต้องระบุรายละเอียดเมื่อเลือกไม่มี",
            }
        )

    errors.extend(validate_form_field_names(form_data))
    return errors


def validate_form_field_names(
    form_data: Mapping[str, object],
) -> list[dict[str, str]]:
    """Reject fields outside the approved enrollment form, including legacy files."""
    return [
        {
            "field_name": str(field_name),
            "error_message": "ไม่รองรับข้อมูลช่องนี้",
        }
        for field_name in form_data.keys() - ALLOWED_FIELDS
    ]


def _has_text(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())
