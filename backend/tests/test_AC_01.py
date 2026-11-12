"""AC-01 Given/When/Then and UC-01 permissions; isolated SQLite, no shared DB writes."""
import sqlite3

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.api.communities import (
    get_committee_user_id, get_community_service, router,
)
from backend.app.services.community_location_service import CommunityService


@pytest.fixture
def setup_uc01(tmp_path):
    database = tmp_path / "uc01.sqlite3"
    with sqlite3.connect(database) as connection:
        connection.executescript("""
        CREATE TABLE camp_locations (
            location_id TEXT PRIMARY KEY, location_name TEXT NOT NULL
        );
        INSERT INTO camp_locations (location_id, location_name)
        VALUES ('camp-1', 'ค่ายหนึ่ง'), ('camp-2', 'ค่ายสอง');
        """)
    service = CommunityService(database)
    service.initialize()
    with service.connect() as connection:
        connection.execute(
            "INSERT INTO uc01_community_assignments (user_id,location_id) VALUES (?,?)",
            ("committee-1", "camp-1"),
        )
    application = FastAPI()
    application.include_router(router)
    application.dependency_overrides[get_committee_user_id] = lambda: "committee-1"
    application.dependency_overrides[get_community_service] = lambda: service
    with TestClient(application) as client:
        yield client, service, application
    application.dependency_overrides.clear()


def community_payload(location_id="camp-1"):
    return {
        "location_id": location_id, "community_name": "บ้านตัวอย่าง",
        "caretaker_name": "คุณสมชาย", "caretaker_title": "ผู้ดูแลพื้นที่",
        "contact_phone": "0812345678", "local_rules": "รักษาความสะอาด",
    }


def test_AC_01_FR_01_02_lists_only_assigned_locations(setup_uc01):
    # UI options must not reveal camps assigned to a different committee member.
    client, _, app = setup_uc01
    response = client.get("/api/locations/assigned")
    assert response.status_code == 200
    assert response.json() == [
        {"location_id": "camp-1", "location_name": "ค่ายหนึ่ง"}
    ]

    app.dependency_overrides[get_committee_user_id] = lambda: "committee-2"
    assert client.get("/api/locations/assigned").json() == []


def test_AC_01_Given_When_Then_persists_community_linked_to_camp(setup_uc01):
    # Given: committee manages its assigned camp location.
    client, service, _ = setup_uc01
    # When: all AC-01 required fields are submitted.
    response = client.post("/api/communities", json=community_payload())
    # Then: saved record links to camp and returns confirmation details.
    assert response.status_code == 201
    body = response.json()
    assert body["community_id"]
    assert body["location_id"] == "camp-1"
    assert body["caretaker_name"] == "คุณสมชาย"
    assert body["contact_phone"] == "0812345678"
    with service.connect() as connection:
        row = connection.execute(
            "SELECT location_id,local_rules FROM uc01_communities WHERE community_id=?",
            (body["community_id"],),
        ).fetchone()
        assert tuple(row) == ("camp-1", "รักษาความสะอาด")
    assert client.get("/api/locations/camp-1/communities").json()[0]["community_id"] == body["community_id"]


@pytest.mark.parametrize("field,value", [
    ("community_name", ""), ("caretaker_name", " "),
    ("contact_phone", ""), ("contact_phone", None),
])
def test_AC_01_AF_01_01_rejects_required_field_without_saving(setup_uc01, field, value):
    client, service, _ = setup_uc01
    payload = community_payload()
    payload[field] = value
    assert client.post("/api/communities", json=payload).status_code == 422
    with service.connect() as connection:
        assert connection.execute("SELECT COUNT(*) FROM uc01_communities").fetchone()[0] == 0


def test_AC_01_C_01_cross_camp_denied_for_create_read_update(setup_uc01):
    client, _, _ = setup_uc01
    assert client.post("/api/communities", json=community_payload("camp-2")).status_code == 403
    assert client.get("/api/locations/camp-2/communities").status_code == 403
    saved = client.post("/api/communities", json=community_payload()).json()
    # Another committee has no assignment for camp-1 and cannot edit it.
    client.app.dependency_overrides[get_committee_user_id] = lambda: "committee-2"
    assert client.put(
        "/api/communities/" + saved["community_id"],
        json={key: value for key, value in community_payload().items() if key != "location_id"},
    ).status_code == 403


def test_AC_01_C_01_unauthenticated_and_wrong_role_fail_closed(setup_uc01):
    client, _, app = setup_uc01
    app.dependency_overrides.pop(get_committee_user_id)
    assert client.post("/api/communities", json=community_payload()).status_code == 401
    assert client.get("/api/locations/assigned").status_code == 401


def test_AC_01_assigned_committee_can_edit_without_changing_location(setup_uc01):
    client, _, _ = setup_uc01
    saved = client.post("/api/communities", json=community_payload()).json()
    replacement = community_payload()
    replacement["community_name"] = "บ้านแก้ไข"
    replacement.pop("location_id")
    edited = client.put("/api/communities/" + saved["community_id"], json=replacement)
    assert edited.status_code == 200
    assert edited.json()["community_name"] == "บ้านแก้ไข"
    assert edited.json()["location_id"] == "camp-1"
