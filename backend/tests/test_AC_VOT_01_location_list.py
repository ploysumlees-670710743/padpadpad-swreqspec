from fastapi.testclient import TestClient

from backend.app.main import app


def test_AC_VOT_01_vote_locations_api_returns_prototype_location_details() -> None:
    response = TestClient(app).get("/api/votes/locations?round_id=round-001")

    assert response.status_code == 200
    payload = response.json()
    assert payload["round_id"] == "round-001"
    assert payload["has_voted"] is False
    assert len(payload["locations"]) == 3
    assert {
        "location_id",
        "name",
        "image_url",
        "survey_summary",
        "total_votes",
    } <= payload["locations"][0].keys()
    assert payload["locations"][0]["image_url"].startswith("data:image/svg+xml,")
    assert "ตัวอย่าง" in payload["locations"][0]["survey_summary"]
