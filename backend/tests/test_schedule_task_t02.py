from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.api.schedule import router
from backend.app.models import UserPermission


def _build_app(permission: UserPermission) -> FastAPI:
    app = FastAPI()

    @app.middleware("http")
    async def inject_permission(request, call_next):
        request.state.user_permission = permission
        return await call_next(request)

    app.include_router(router)
    return app


def test_schedule_view_requires_can_view_schedule() -> None:
    app = _build_app(UserPermission("user-001", "committee", can_view_schedule=True, can_manage_schedule=False))
    client = TestClient(app)

    response = client.get("/schedule")
    assert response.status_code == 200
    assert response.json()["activities"][0]["activity_name"] == "พิธีเปิด"

    app_without_view = _build_app(UserPermission("user-002", "faculty", can_view_schedule=False, can_manage_schedule=False))
    response = TestClient(app_without_view).get("/schedule")
    assert response.status_code == 403


def test_schedule_management_actions_require_manage_permission() -> None:
    app = _build_app(UserPermission("user-003", "faculty", can_view_schedule=True, can_manage_schedule=False))
    client = TestClient(app)

    response = client.post(
        "/schedule/activities",
        json={
            "activity_id": "act-998",
            "project_id": "project-001",
            "location_id": "loc-001",
            "activity_name": "Test",
            "activity_date": "2026-01-10",
            "start_time": "08:00",
            "end_time": "09:00",
            "description": "Sample activity",
            "facilitator_or_responsible": "Coordinator",
        },
    )
    assert response.status_code == 403

    manager_app = _build_app(UserPermission("user-004", "committee", can_view_schedule=True, can_manage_schedule=True))
    response = TestClient(manager_app).post(
        "/schedule/activities",
        json={
            "activity_id": "act-999",
            "project_id": "project-001",
            "location_id": "loc-001",
            "activity_name": "Test",
            "activity_date": "2026-01-10",
            "start_time": "12:00",
            "end_time": "13:00",
            "description": "Sample activity",
            "facilitator_or_responsible": "Coordinator",
        },
    )
    assert response.status_code == 201
