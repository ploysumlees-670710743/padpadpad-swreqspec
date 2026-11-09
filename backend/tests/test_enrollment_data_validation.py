import pytest

from backend.app.validators.enrollment_validator import validate_enrollment_form


def _valid_form(**overrides: object) -> dict[str, object]:
    form: dict[str, object] = {
        "full_name": "ผู้สมัคร ตัวอย่าง",
        "nickname": "น้อง",
        "student_id": "66000001",
        "year_level": "2",
        "phone_number": "0800000000",
        "contact_channel": "line-id",
        "food_allergy": "no",
    }
    form.update(overrides)
    return form


def test_required_form_fields_are_reported_individually() -> None:
    errors = validate_enrollment_form({})

    assert [error["field_name"] for error in errors] == [
        "full_name",
        "nickname",
        "student_id",
        "phone_number",
        "contact_channel",
        "year_level",
        "food_allergy",
    ]
    assert all(error["error_message"] for error in errors)


@pytest.mark.parametrize("year_level", ["1", "2", "3", "4", "5", "6"])
def test_year_level_one_to_six_is_valid(year_level: str) -> None:
    assert validate_enrollment_form(_valid_form(year_level=year_level)) == []


def test_other_year_level_requires_and_accepts_a_detail() -> None:
    missing_detail = validate_enrollment_form(_valid_form(year_level="other"))
    valid_other = validate_enrollment_form(
        _valid_form(year_level="other", year_level_other="ปี 7")
    )

    assert missing_detail == [
        {"field_name": "year_level_other", "error_message": "กรุณากรอกข้อมูลนี้"}
    ]
    assert valid_other == []


@pytest.mark.parametrize("year_level", ["0", "7", "first", ""])
def test_invalid_year_level_is_rejected(year_level: str) -> None:
    errors = validate_enrollment_form(_valid_form(year_level=year_level))

    assert any(error["field_name"] == "year_level" for error in errors)


def test_food_allergy_none_is_valid_without_details() -> None:
    assert validate_enrollment_form(_valid_form(food_allergy="no")) == []


def test_food_allergy_yes_requires_details() -> None:
    errors = validate_enrollment_form(_valid_form(food_allergy="yes"))

    assert errors == [
        {
            "field_name": "food_allergy_details",
            "error_message": "กรุณากรอกข้อมูลนี้",
        }
    ]
    assert validate_enrollment_form(
        _valid_form(food_allergy="yes", food_allergy_details="แพ้ถั่วลิสง")
    ) == []


def test_allergy_details_are_rejected_when_food_allergy_is_none() -> None:
    errors = validate_enrollment_form(
        _valid_form(food_allergy="no", food_allergy_details="แพ้ถั่วลิสง")
    )

    assert errors == [
        {
            "field_name": "food_allergy_details",
            "error_message": "ไม่ต้องระบุรายละเอียดเมื่อเลือกไม่มี",
        }
    ]


@pytest.mark.parametrize(
    "details",
    [[], ["แพ้ถั่วลิสง"], {}, {"allergy": "ถั่ว"}, 0, False, None],
    ids=[
        "empty-array",
        "array-with-value",
        "empty-object",
        "object-with-value",
        "number",
        "boolean",
        "null",
    ],
)
def test_non_text_allergy_details_are_rejected_when_food_allergy_is_none(
    details: object,
) -> None:
    errors = validate_enrollment_form(
        _valid_form(food_allergy="no", food_allergy_details=details)
    )

    assert errors == [
        {
            "field_name": "food_allergy_details",
            "error_message": "ไม่ต้องระบุรายละเอียดเมื่อเลือกไม่มี",
        }
    ]


@pytest.mark.parametrize(
    "details",
    [[], ["แพ้ถั่วลิสง"], {}, {"allergy": "ถั่ว"}, 0, False, None],
    ids=[
        "empty-array",
        "array-with-value",
        "empty-object",
        "object-with-value",
        "number",
        "boolean",
        "null",
    ],
)
def test_non_text_allergy_details_are_rejected_when_food_allergy_is_yes(
    details: object,
) -> None:
    errors = validate_enrollment_form(
        _valid_form(food_allergy="yes", food_allergy_details=details)
    )

    assert errors == [
        {
            "field_name": "food_allergy_details",
            "error_message": "กรุณากรอกข้อมูลนี้",
        }
    ]


@pytest.mark.parametrize("details", ["", "   "])
def test_blank_string_allergy_details_follow_allergy_choice(details: str) -> None:
    assert validate_enrollment_form(
        _valid_form(food_allergy="no", food_allergy_details=details)
    ) == []
    assert validate_enrollment_form(
        _valid_form(food_allergy="yes", food_allergy_details=details)
    ) == [
        {
            "field_name": "food_allergy_details",
            "error_message": "กรุณากรอกข้อมูลนี้",
        }
    ]


def test_unapproved_form_fields_are_rejected() -> None:
    errors = validate_enrollment_form(_valid_form(school_name="ห้ามเพิ่ม"))

    assert errors == [
        {"field_name": "school_name", "error_message": "ไม่รองรับข้อมูลช่องนี้"}
    ]
