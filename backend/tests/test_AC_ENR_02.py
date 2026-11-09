from typing import Any

import pytest

from backend.app.services.enrollment_submission_service import validate_application_fields


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


def test_AC_ENR_02_required_values_are_validated_against_the_approved_form(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")
    connection = _ConfiguredCampConnection()

    errors = validate_application_fields(
        connection,
        _valid_form(full_name="   ", contact_channel=None),
    )

    assert [error["field_name"] for error in errors] == [
        "full_name",
        "contact_channel",
    ]
    assert all(error["error_message"] for error in errors)
    assert connection.query_parameters == ("camp-001",)


@pytest.mark.parametrize("year_level", ["1", "2", "3", "4", "5", "6"])
def test_AC_ENR_02_year_level_values_one_to_six_are_accepted(
    monkeypatch: pytest.MonkeyPatch,
    year_level: str,
) -> None:
    monkeypatch.setenv("CAMP_ID", "camp-001")

    assert validate_application_fields(
        _ConfiguredCampConnection(),
        _valid_form(year_level=year_level),
    ) == []


class _ConfiguredCampConnection:
    def __init__(self) -> None:
        self.query_parameters: tuple[str, ...] | None = None

    def cursor(self) -> "_ConfiguredCampCursor":
        return _ConfiguredCampCursor(self)


class _ConfiguredCampCursor:
    def __init__(self, connection: _ConfiguredCampConnection) -> None:
        self.connection = connection

    def __enter__(self) -> "_ConfiguredCampCursor":
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        return None

    def execute(self, query: str, parameters: tuple[str, ...]) -> None:
        self.connection.query_parameters = parameters

    def fetchone(self) -> tuple[str, ...]:
        camp_data: tuple[str, ...] = (
            "camp-001",
            "Configured Camp",
            "open",
            "",
            "",
            "[]",
            "[]",
        )
        return camp_data if self.connection.query_parameters == ("camp-001",) else ()
